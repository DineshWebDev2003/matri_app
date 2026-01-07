<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use App\Traits\SupportTicketManager;
use Illuminate\Http\Request;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use Carbon\Carbon;

class TicketController extends Controller
{
    use SupportTicketManager;

    public function __construct()
    {
        parent::__construct();
        $this->layout = 'frontend';

        $this->middleware(function ($request, $next) {
            $this->user = auth()->user();
            if ($this->user) {
                $this->layout = 'master';
            }
            return $next($request);
        });

        $this->redirectLink = 'ticket.view';
        $this->userType     = 'user';
        $this->column       = 'user_id';
    }

    /**
     * List tickets for authenticated user (paginated)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => ['auth' => ['Unauthenticated']],
            ], 401);
        }

        $tickets = SupportTicket::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => [
                'tickets' => $tickets,
            ],
        ]);
    }

    /**
     * Store a new support ticket
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => ['auth' => ['Unauthenticated']],
            ], 401);
        }

        // Merge required fields for validation in trait
        $request->merge(['name' => $user->firstname ?? $user->name, 'email' => $user->email]);

        // Re-use validation rules from trait
        $this->validation($request);

        \DB::beginTransaction();
        try {
            $ticket = new SupportTicket();
            $ticket->user_id = $user->id;
            $ticket->ticket = rand(100000, 999999);
            $ticket->name = $request->name;
            $ticket->email = $request->email;
            $ticket->subject = $request->subject;
            $ticket->last_reply = Carbon::now();
            $ticket->status = \App\Constants\Status::TICKET_OPEN;
            $ticket->priority = $request->priority ?? 1;
            $ticket->save();

            $message = new SupportMessage();
            $message->support_ticket_id = $ticket->id;
            $message->message = $request->message;
            $message->save();

            if ($request->hasFile('attachments')) {
                $this->files = $request->file('attachments');
                $uploadAttachments = $this->storeSupportAttachments($message->id);
                if ($uploadAttachments !== 200) {
                    throw new \Exception('File upload failed');
                }
            }

            \DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => ['success' => ['Ticket created']],
                'data' => [
                    'ticket' => $ticket->fresh(),
                ],
            ], 201);
        } catch (\Throwable $e) {
            \DB::rollBack();
            \Log::error('Ticket create API error: '.$e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Unable to create ticket']],
            ], 500);
        }
    }

    /**
     * Show single ticket with messages
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => ['auth' => ['Unauthenticated']],
            ], 401);
        }

        $ticket = SupportTicket::where('user_id', $user->id)
            ->where('id', $id)
            ->with(['supportMessage' => function ($q) {
                $q->orderBy('id');
            }])->first();

        if (!$ticket) {
            return response()->json([
                'status' => 'error',
                'message' => ['ticket' => ['Not found']],
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'ticket' => $ticket,
                'messages' => $ticket->supportMessage,
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\User;
use Illuminate\Http\Request;
use App\Constants\Status;

class GalleryController extends Controller
{
    /**
     * Show global gallery moderation list.
     * @param string $filter  all|approved|rejected
     */
    public function moderate(Request $request, $filter = 'all')
    {
        // allow query param to override
        $filter = $request->input('filter', $filter);
        $range  = $request->input('range', 'all');

        $query = Gallery::with(['user:id,username,email'])
            ->where('type', Gallery::TYPE_PHOTO);

        if ($filter === 'approved') {
            $query->where('status', Gallery::STATUS_APPROVED);
        } elseif ($filter === 'rejected') {
            $query->where('status', Gallery::STATUS_REJECTED);
        }

        // Date range filter
        if ($range === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($range === 'last7') {
            $query->whereDate('created_at', '>=', now()->subDays(7));
        } elseif ($range === 'last30') {
            $query->whereDate('created_at', '>=', now()->subDays(30));
        }

        $galleries = $query->latest()->paginate(20);

        // counts for tabs
        $counts = [
            'all'      => Gallery::where('type', Gallery::TYPE_PHOTO)->count(),
            'approved' => Gallery::where('type', Gallery::TYPE_PHOTO)->where('status', Gallery::STATUS_APPROVED)->count(),
            'rejected' => Gallery::where('type', Gallery::TYPE_PHOTO)->where('status', Gallery::STATUS_REJECTED)->count(),
        ];

        $pageTitle = 'Gallery Moderation';
        return view('admin.gallery.moderate', compact('pageTitle', 'galleries', 'filter', 'counts'));
    }
    public function index($userId)
    {
        $user = User::with(['galleries' => function($query) {
            $query->orderBy('status')->latest();
        }])->findOrFail($userId);

        $pageTitle = "Manage Gallery: {$user->username}";
        
        return view('admin.users.gallery', compact('pageTitle', 'user'));
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:galleries,id',
            'status' => 'required|in:approved,rejected,pending'
        ]);

        $gallery = Gallery::findOrFail($request->id);
        if($request->status === 'rejected') {
            // delete file from storage then remove record
            $path = base_path('../'.getFilePath('gallery'));
            if (file_exists($path.'/'.$gallery->image)) {
                @unlink($path.'/'.$gallery->image);
            }
            $gallery->delete();
            return response()->json(['success'=>true,'deleted'=>true]);
        }
        $gallery->status = $request->status;
        $gallery->save();

        return response()->json(['success' => true,'deleted'=>false]);
    }

    public function delete($id)
    {
        $gallery = Gallery::findOrFail($id);
        $path = base_path('../'.getFilePath('gallery'));
        
        if (file_exists($path . '/' . $gallery->image)) {
            unlink($path . '/' . $gallery->image);
        }
        
        $gallery->delete();
        
        return response()->json(['success' => true]);
    }
}

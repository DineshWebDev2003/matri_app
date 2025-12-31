<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    // Get all conversations for the authenticated user
    public function getConversations()
    {
        try {
            $user = Auth::user();
            
            $conversations = DB::table('conversations')
                ->leftJoin('users as other_user', function($join) use ($user) {
                    $join->on('other_user.id', '=', DB::raw("CASE 
                        WHEN conversations.sender_id = {$user->id} THEN conversations.receiver_id 
                        ELSE conversations.sender_id 
                    END"));
                })
                ->leftJoin('basic_infos as other_bi', 'other_bi.user_id', '=', 'other_user.id')
                ->leftJoin('messages', function($join) {
                    $join->on('messages.conversation_id', '=', 'conversations.id')
                         ->whereRaw('messages.id = (SELECT MAX(id) FROM messages WHERE conversation_id = conversations.id)');
                })
                ->where(function($query) use ($user) {
                    $query->where('conversations.sender_id', $user->id)
                          ->orWhere('conversations.receiver_id', $user->id);
                })
                ->select([
                    'conversations.id',
                    'conversations.sender_id',
                    'conversations.receiver_id',
                    'conversations.created_at',
                    'conversations.updated_at',
                    'other_user.id as other_user_id',
                    'other_user.firstname',
                    'other_user.lastname',
                    'other_user.image',
                    'other_bi.gender as other_user_gender',
                                        'messages.message as last_message',
                    'messages.created_at as last_message_time',
                    'messages.read_status as last_message_read'
                ])
                ->orderBy('conversations.updated_at', 'desc')
                ->get();

            $formattedConversations = $conversations->map(function($conversation) use ($user) {
                $otherUserName = $conversation->firstname . ' ' . $conversation->lastname;
                
                // Clean up image URL - remove any extra spaces or special characters
                $otherUserImage = null;
                if ($conversation->image) {
                    $imagePath = trim($conversation->image);
                    if (file_exists(public_path("assets/images/user/profile/{$imagePath}"))) {
                        $otherUserImage = url("assets/images/user/profile/{$imagePath}");
                    }
                }

                // Fallback based on gender if no custom image
                if (!$otherUserImage) {
                    $gender = strtolower($conversation->other_user_gender ?? 'male');
                    $defaultFilename = $gender === 'female' ? 'default_female.png' : 'default_male.png';
                    $otherUserImage = url("assets/images/defaults/{$defaultFilename}");
                }
                
                return [
                    'id' => $conversation->id,
                    'other_user_id' => $conversation->other_user_id,
                    'other_user_name' => trim($otherUserName) ?: 'Unknown User',
                    'other_user_image' => $otherUserImage,
                    'other_user_gender' => $conversation->other_user_gender,
                    'last_message' => $conversation->last_message,
                    'last_message_time' => $conversation->last_message_time,
                    'unread_count' => DB::table('messages')
                        ->where('conversation_id', $conversation->id)
                        ->where('sender_id', '!=', $user->id)
                        ->where('read_status', 0)
                        ->count(),
                    'created_at' => $conversation->created_at,
                    'updated_at' => $conversation->updated_at
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'conversations' => $formattedConversations,
                    'total' => $formattedConversations->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get conversations failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to fetch conversations']]
            ], 500);
        }
    }

    // Get messages for a specific conversation
    public function getMessages($conversationId)
    {
        try {
            $user = Auth::user();
            
            // Verify user has access to this conversation
            $conversation = DB::table('conversations')
                ->where('id', $conversationId)
                ->where(function($query) use ($user) {
                    $query->where('sender_id', $user->id)
                          ->orWhere('receiver_id', $user->id);
                })
                ->first();

            if (!$conversation) {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['Conversation not found or access denied']]
                ], 404);
            }

            $messages = DB::table('messages')
                ->leftJoin('users as sender', 'messages.sender_id', '=', 'sender.id')
                ->leftJoin('basic_infos as sender_bi', 'sender_bi.user_id', '=', 'sender.id')
                ->where('messages.conversation_id', $conversationId)
                ->select([
                    'messages.id',
                    'messages.message',
                    'messages.sender_id',
                    'messages.read_status',
                    'messages.created_at',
                    'sender.firstname',
                    'sender.lastname',
                    'sender_bi.gender as sender_gender',
                    'sender.image'
                ])
                ->orderBy('messages.created_at', 'asc')
                ->get();

            $formattedMessages = $messages->map(function($message) use ($user) {
                // Clean up sender image URL
                $senderImage = null;
                if ($message->image) {
                    $imagePath = trim($message->image);
                    if (file_exists(public_path("assets/images/user/profile/{$imagePath}"))) {
                        $senderImage = url("assets/images/user/profile/{$imagePath}");
                    }
                }

                // Fallback image based on gender
                if (!$senderImage) {
                    $gender = strtolower($message->sender_gender ?? 'male');
                    $defaultFilename = $gender === 'female' ? 'default_female.png' : 'default_male.png';
                    $senderImage = url("assets/images/defaults/{$defaultFilename}");
                }
                
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_id' => $message->sender_id,
                    'is_mine' => $message->sender_id == $user->id,
                    'read_status' => $message->read_status,
                    'created_at' => $message->created_at,
                    'sender' => [
                        'name' => $message->firstname . ' ' . $message->lastname,
                        'image' => $senderImage,
                    ]
                ];
            });

            // Mark messages as read
            DB::table('messages')
                ->where('conversation_id', $conversationId)
                ->where('sender_id', '!=', $user->id)
                ->where('read_status', 0)
                ->update(['read_status' => 1]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'messages' => $formattedMessages,
                    'conversation_id' => $conversationId,
                    'total' => $formattedMessages->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get messages failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to fetch messages']]
            ], 500);
        }
    }

    // Send a message
    public function sendMessage(Request $request, $conversationId)
    {
        try {
            $user = Auth::user();
            
            $request->validate([
                'message' => 'required|string|max:1000'
            ]);

            // Verify conversation exists and user has access
            $conversation = DB::table('conversations')
                ->where('id', $conversationId)
                ->where(function($query) use ($user) {
                    $query->where('sender_id', $user->id)
                          ->orWhere('receiver_id', $user->id);
                })
                ->first();

            if (!$conversation) {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['Conversation not found']]
                ], 404);
            }

            // Get receiver ID
            $receiverId = $conversation->sender_id == $user->id ? $conversation->receiver_id : $conversation->sender_id;

            // Create message
            $messageId = DB::table('messages')->insertGetId([
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'message' => $request->message,
                'read_status' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Update conversation last activity
            DB::table('conversations')
                ->where('id', $conversationId)
                ->update(['updated_at' => now()]);

            $message = DB::table('messages')
                ->leftJoin('users as sender', 'messages.sender_id', '=', 'sender.id')
                ->leftJoin('basic_infos as sender_bi', 'sender_bi.user_id', '=', 'sender.id')
                ->where('messages.id', $messageId)
                ->select([
                    'messages.id',
                    'messages.message',
                    'messages.sender_id',
                    'messages.read_status',
                    'messages.created_at',
                    'sender.firstname',
                    'sender.lastname',
                    'sender_bi.gender as sender_gender',
                    'sender.image'
                ])
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => ['success' => ['Message sent successfully']],
                'data' => [
                    'message' => [
                        'id' => $message->id,
                        'message' => $message->message,
                        'sender_id' => $message->sender_id,
                        'is_mine' => true,
                        'read_status' => $message->read_status,
                        'created_at' => $message->created_at,
                        'sender' => [
                            'name' => $message->firstname . ' ' . $message->lastname,
                            'image' => $message->image && file_exists(public_path("assets/images/user/profile/{$message->image}")) ? url("assets/images/user/profile/{$message->image}") : null,
                        ]
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Send message failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to send message']]
            ], 500);
        }
    }

    // Create a new conversation
    public function createConversation(Request $request)
    {
        try {
            $user = Auth::user();
            
            $request->validate([
                'receiver_id' => 'required|exists:users,id',
                'message' => 'required|string|max:1000'
            ]);

            $receiverId = $request->receiver_id;

            // Check if conversation already exists
            $existingConversation = DB::table('conversations')
                ->where(function($query) use ($user, $receiverId) {
                    $query->where('sender_id', $user->id)->where('receiver_id', $receiverId);
                })
                ->orWhere(function($query) use ($user, $receiverId) {
                    $query->where('sender_id', $receiverId)->where('receiver_id', $user->id);
                })
                ->first();

            if ($existingConversation) {
                // Use existing conversation
                $conversationId = $existingConversation->id;
            } else {
                // Create new conversation
                $conversationId = DB::table('conversations')->insertGetId([
                    'sender_id' => $user->id,
                    'receiver_id' => $receiverId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // Send the first message
            $messageId = DB::table('messages')->insertGetId([
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'message' => $request->message,
                'read_status' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => ['success' => ['Conversation created successfully']],
                'data' => [
                    'conversation_id' => $conversationId,
                    'message_id' => $messageId
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Create conversation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to create conversation']]
            ], 500);
        }
    }

    // Initiate voice call
    public function initiateCall(Request $request, $conversationId)
    {
        try {
            $user = Auth::user();
            
            // Verify conversation access
            $conversation = DB::table('conversations')
                ->where('id', $conversationId)
                ->where(function($query) use ($user) {
                    $query->where('sender_id', $user->id)
                          ->orWhere('receiver_id', $user->id);
                })
                ->first();

            if (!$conversation) {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['Conversation not found']]
                ], 404);
            }

            // Get receiver info
            $receiverId = $conversation->sender_id == $user->id ? $conversation->receiver_id : $conversation->sender_id;
            $receiver = DB::table('users')->where('id', $receiverId)->first();

            // Log call initiation
            DB::table('messages')->insert([
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'message' => 'Voice call initiated',
                'read_status' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => ['success' => ['Call initiated']],
                'data' => [
                    'call_id' => uniqid('call_'),
                    'receiver' => [
                        'id' => $receiver->id,
                        'name' => $receiver->firstname . ' ' . $receiver->lastname,
                        'image' => $receiver->image && file_exists(public_path("assets/images/user/profile/{$receiver->image}")) ? url("assets/images/user/profile/{$receiver->image}") : null,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Initiate call failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to initiate call']]
            ], 500);
        }
    }

    // Initiate video call
    public function initiateVideoCall(Request $request, $conversationId)
    {
        try {
            $user = Auth::user();
            
            // Verify conversation access
            $conversation = DB::table('conversations')
                ->where('id', $conversationId)
                ->where(function($query) use ($user) {
                    $query->where('sender_id', $user->id)
                          ->orWhere('receiver_id', $user->id);
                })
                ->first();

            if (!$conversation) {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['Conversation not found']]
                ], 404);
            }

            // Get receiver info
            $receiverId = $conversation->sender_id == $user->id ? $conversation->receiver_id : $conversation->sender_id;
            $receiver = DB::table('users')->where('id', $receiverId)->first();

            // Log video call initiation
            DB::table('messages')->insert([
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'message' => 'Video call initiated',
                'read_status' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => ['success' => ['Video call initiated']],
                'data' => [
                    'call_id' => uniqid('video_'),
                    'receiver' => [
                        'id' => $receiver->id,
                        'name' => $receiver->firstname . ' ' . $receiver->lastname,
                        'image' => $receiver->image ? url("Final Code/assets/assets/images/user/profile/{$receiver->image}") : null,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Initiate video call failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to initiate video call']]
            ], 500);
        }
    }

    // Mark message as read
    public function markAsRead($messageId)
    {
        try {
            $user = Auth::user();
            
            $updated = DB::table('messages')
                ->where('id', $messageId)
                ->where('receiver_id', $user->id)
                ->update(['read_status' => 1]);

            if ($updated) {
                return response()->json([
                    'status' => 'success',
                    'message' => ['success' => ['Message marked as read']]
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['Message not found or already read']]
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error('Mark as read failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to mark message as read']]
            ], 500);
        }
    }
}

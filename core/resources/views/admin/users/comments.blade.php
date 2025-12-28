@extends('admin.layouts.app')
@section('panel')
<div class="container-fluid">
    <div class="card">
        <div class="card-body">
            @if($user->comments->count())
                <ul class="list-group">
                    @foreach($user->comments as $comment)
                        <li class="list-group-item">
                            <strong>{{ $comment->admin->name ?? 'Admin' }}:</strong>
                            <span>{{ $comment->comment }}</span>
                            <small class="text-muted float-end">{{ $comment->created_at->format('d M Y, h:i A') }}</small>
                        </li>
                    @endforeach
                </ul>
            @else
                <p class="text-muted">No comments found for this user.</p>
            @endif
        </div>
    </div>
    <button onclick="window.history.back()" class="btn btn--dark mt-3">Back</button>
</div>
@endsection 
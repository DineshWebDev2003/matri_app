@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <h4 class="mb-4">{{ $pageTitle }}</h4>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="d-flex align-items-center">
                    <img src="{{ $user->image ? asset('assets/images/user/'.$user->image) : 'https://via.placeholder.com/80' }}" class="rounded-circle me-3" width="80" height="80" alt="Photo">
                    <div>
                        <h5 class="mb-1">{{ $user->firstname }} {{ $user->lastname }}</h5>
                        <p class="text-muted mb-0">NKLYNM{{ $user->id }}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6 text-end">
                <button type="button" class="btn btn--primary" data-bs-toggle="modal" data-bs-target="#addCommentModal">
                    <i class="las la-plus"></i> Add New Comment
                </button>
            </div>
        </div>
        
        <div class="timeline">
            @forelse($user->comments as $comment)
                <div class="timeline-item">
                    <div class="timeline-badge bg-primary">
                        <i class="las la-comment"></i>
                    </div>
                    <div class="timeline-panel">
                        <div class="timeline-heading">
                            <h6 class="timeline-title">
                                Comment by {{ $comment->admin->name ?? 'Admin' }}
                            </h6>
                            <small class="text-muted">
                                <i class="las la-clock"></i> {{ $comment->created_at->format('M d, Y h:i A') }}
                            </small>
                        </div>
                        <div class="timeline-body">
                            <p>{{ $comment->comment }}</p>
                        </div>
                    </div>
                </div>
            @empty
                <div class="text-center py-5">
                    <i class="las la-comment-slash display-4 text-muted"></i>
                    <p class="mt-3">No comments found for this member</p>
                </div>
            @endforelse
        </div>
    </div>
</div>

<!-- Add Comment Modal -->
<div class="modal fade" id="addCommentModal" tabindex="-1" aria-labelledby="addCommentModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addCommentModalLabel">Add Comment</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="{{ route('admin.members.add-comment', $user->id) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <label>Comment</label>
                        <textarea name="comment" class="form-control" rows="4" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn--dark" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn--primary">Save Comment</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('style')
<style>
    .timeline {
        position: relative;
        padding: 20px 0;
    }
    
    .timeline:before {
        content: " ";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50px;
        width: 3px;
        background-color: #e9ecef;
        z-index: 0;
    }
    
    .timeline-item {
        margin-bottom: 20px;
        position: relative;
    }
    
    .timeline-badge {
        color: #fff;
        width: 40px;
        height: 40px;
        line-height: 40px;
        font-size: 1.2em;
        text-align: center;
        position: absolute;
        top: 0;
        left: 30px;
        margin-left: -20px;
        z-index: 100;
        border-radius: 50%;
    }
    
    .timeline-panel {
        position: relative;
        width: calc(100% - 90px);
        float: right;
        border: 1px solid #d4d4d4;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
        background-color: #fff;
    }
    
    .timeline-panel:before {
        position: absolute;
        top: 15px;
        left: -15px;
        display: inline-block;
        border-top: 15px solid transparent;
        border-right: 15px solid #ccc;
        border-bottom: 15px solid transparent;
        content: " ";
    }
    
    .timeline-panel:after {
        position: absolute;
        top: 16px;
        left: -14px;
        display: inline-block;
        border-top: 14px solid transparent;
        border-right: 14px solid #fff;
        border-bottom: 14px solid transparent;
        content: " ";
    }
    
    .timeline-title {
        margin-top: 0;
        color: inherit;
    }
    
    .timeline-heading {
        padding-bottom: 10px;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 10px;
    }
</style>
@endpush
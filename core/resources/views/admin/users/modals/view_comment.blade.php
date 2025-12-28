<div class="modal fade" id="viewCommentModal" tabindex="-1" aria-labelledby="viewCommentModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="viewCommentModalLabel">View Comments</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        @if(isset($comments) && count($comments))
          <ul class="list-group">
            @foreach($comments as $comment)
              <li class="list-group-item">
                <div class="fw-bold">{{ $comment->admin->name ?? 'Admin' }} <span class="text-muted small">({{ $comment->created_at->format('M d, Y h:i A') }})</span></div>
                <div>{{ $comment->content }}</div>
              </li>
            @endforeach
          </ul>
        @else
          <div class="text-muted">No comments found.</div>
        @endif
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div> 
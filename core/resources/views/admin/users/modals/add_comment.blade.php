<div class="modal fade" id="addCommentModal" tabindex="-1" aria-labelledby="addCommentModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addCommentModalLabel">Add Comment</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form method="POST" action="{{ route('admin.users.add-comment', $user->id) }}">
        @csrf
        <div class="modal-body">
          <div class="mb-3">
            <label for="comment" class="form-label">Comment</label>
            <textarea class="form-control" id="comment" name="comment" rows="4" required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Save Comment</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div> 
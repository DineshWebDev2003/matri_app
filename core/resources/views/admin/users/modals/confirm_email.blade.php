<div class="modal fade" id="confirmEmailModal" tabindex="-1" aria-labelledby="confirmEmailModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="confirmEmailModalLabel">Confirm Email</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to confirm this user's email?</p>
      </div>
      <div class="modal-footer">
        <form method="POST" action="{{ route('admin.users.confirm-email', $user->id) }}">
          @csrf
          <button type="submit" class="btn btn-success">Confirm Email</button>
        </form>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      </div>
    </div>
  </div>
</div> 
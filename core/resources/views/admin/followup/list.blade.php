@extends('admin.layouts.app')
@section('panel')
<div class="d-flex justify-content-between align-items-center mb-3">
    
    @if(auth()->guard('admin')->check())
    <div>
        <form method="post" action="{{ route('admin.users.followup.update-status') }}" class="d-inline">
            @csrf
            <input type="hidden" name="status" value="completed">
            <input type="hidden" name="user_id" id="bulkUserId">
            <button type="submit" class="btn btn-success"><i class="las la-check"></i> Approve</button>
        </form>
        <form method="post" action="{{ route('admin.users.followup.update-status') }}" class="d-inline ms-2">
            @csrf
            <input type="hidden" name="status" value="pending">
            <input type="hidden" name="user_id" id="bulkUserIdPending">
            <button type="submit" class="btn btn-warning text-dark"><i class="las la-hourglass-half"></i> Pending</button>
        </form>
        <form method="post" action="{{ route('admin.users.followup.update-status') }}" class="d-inline ms-2">
            @csrf
            <input type="hidden" name="status" value="rejected">
            <input type="hidden" name="user_id" id="bulkUserIdDecline">
            <button type="submit" class="btn btn-danger text-white"><i class="las la-times"></i> Decline</button>
        </form>
    </div>
    @endif
</div>

<div class="row g-3">
    @forelse($users as $user)
        <div class="col-12">
            @include('admin.followup._card', ['user'=>$user])
        </div>
    @empty
        <p>No users assigned to this staff.</p>
    @endforelse
</div>
{{ $users->links('pagination::bootstrap-4') }}
@endsection

@push('script')
<script>
    (function($){
        'use strict';
        function updateBulkIds(){
            const ids = $('.member-checkbox:checked').map(function(){return $(this).val();}).get();
            $('#bulkUserId').val(ids[0] || '');
            $('#bulkUserIdPending').val(ids[0] || '');
            $('#bulkUserIdDecline').val(ids[0] || '');
        }
        $(document).on('change','.member-checkbox',updateBulkIds);
        updateBulkIds();
    })(jQuery);
</script>
@endpush

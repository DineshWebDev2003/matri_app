@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <!-- Search & Filter -->
        <form method="GET" action="{{ url()->current() }}" class="row g-3 mb-4 align-items-end">
            <div class="col-md-4">
                <label class="form-label fw-bold">Search</label>
                <input type="text" name="search" value="{{ request('search') }}" class="form-control" placeholder="Name, email or mobile">
            </div>
            <div class="col-md-3">
                <label class="form-label fw-bold">Package</label>
                <select name="package" class="form-select">
                    <option value="">All Packages</option>
                    @foreach($packages as $pkg)
                        <option value="{{ $pkg->id }}" {{ request('package')==$pkg->id?'selected':'' }}>{{ $pkg->name }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label fw-bold">State</label>
                <select name="state" class="form-select">
                    <option value="">All States</option>
                    @foreach($states as $st)
                        <option value="{{ $st }}" {{ request('state')==$st?'selected':'' }}>{{ $st }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2 d-grid">
                <button class="btn btn--primary"><i class="las la-search"></i> Filter</button>
            </div>
        </form>

        <div class="row">
            @forelse($users as $user)
            <div class="col-12 mb-4">
                <div class="card shadow-sm p-4" style="border-radius:12px; background:#fff; font-family:'Inter','Roboto',Arial,sans-serif;">
                        <div class="row g-0 align-items-center">
                            <div class="col-md-2 text-center d-flex flex-column align-items-center justify-content-center" style="padding-right:0;">
                                <img src="{{ $user->image ? getImage(getFilePath('userProfile').'/'.$user->image, getFileSize('userProfile')) : asset('assets/images/avatar.png') }}" class="rounded" width="120" height="120" alt="Photo" style="object-fit:cover; background:#f5f5f5; border:2px solid #e0e0e0; margin-bottom:10px;">
                            </div>
                            <div class="col-md-10" style="padding-left:24px;">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <span class="fw-bold" style="font-size:1.5rem; color:#222; letter-spacing:0.5px;">{{ $user->firstname }} {{ $user->lastname }} <span style="color:#888; font-size:1.1rem;">(90KLYNM{{ $user->id }})</span></span>
                                    </div>
                                    <div>
                                        @if($user->status == \App\Constants\Status::USER_BAN)
                                        <span class="badge rounded-pill bg-danger px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">SUSPENDED</span>
                                    @elseif($user->limitation && in_array($user->limitation->package_id,[1,2,3]))
                                        <span class="badge rounded-pill bg-primary px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">PAID</span>
                                    @elseif($user->status == \App\Constants\Status::USER_ACTIVE && $user->limitation && $user->limitation->package_id == 4)
                                        <span class="badge rounded-pill bg-success px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">APPROVED</span>
                                    @else
                                        <span class="badge rounded-pill bg-warning text-dark px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">UNAPPROVED</span>
                                    @endif
                                    </div>
                                </div>
                                <div class="row mb-2" style="font-size:1.08rem; color:#333; line-height:2.1;">
                                    <div class="col-md-6 mb-1">
                                        <div><span style="font-weight:600;">Gender</span>: <span style="font-weight:400;">{{ $user->basicInfo->gender ?? 'N/A' }}</span></div>
                                        <div><span style="font-weight:600;">Mobile</span>: <span style="font-weight:400;">{{ $user->mobile }}</span></div>
                                        <div><span style="font-weight:600;">Religion Name</span>: <span style="font-weight:400;">{{ optional($user->basicInfo->religionInfo)->name ?? 'N/A' }}</span></div>
                                        <div><span style="font-weight:600;">Caste Name</span>: <span style="font-weight:400;">{{ $user->basicInfo->caste ?? 'N/A' }}</span></div>
                                        <div><span style="font-weight:600;">Mother Tongue</span>: <span style="font-weight:400;">{{ $user->basicInfo->mother_tongue ?? 'N/A' }}</span></div>
                                        <div><span style="font-weight:600;">Marital Status</span>: <span style="font-weight:400;">{{ $user->basicInfo->marital_status ?? 'N/A' }}</span></div>
                                    </div>
                                    <div class="col-md-6 mb-1">
                                        <div><span style="font-weight:600;">Email</span>: <span style="font-weight:400;">{{ $user->email }}</span></div>
                                        <div><span style="font-weight:600;">Country Name</span>: <span style="font-weight:400;">{{ $user->basicInfo->country ?? 'N/A' }}</span></div>
                                        <div><span style="font-weight:600;">State Name</span>: <span style="font-weight:400;">{{ $user->basicInfo->state ?? 'N/A' }}</span></div>
                                        <div><span style="font-weight:600;">City Name</span>: <span style="font-weight:400;">{{ $user->basicInfo->city ?? 'N/A' }}</span></div>
                                        <div><span style="font-weight:600;">Birthdate</span>: <span style="font-weight:400;">{{ $user->basicInfo->birth_date ?? 'N/A' }}</span></div>
                                        <div><span style="font-weight:600;">Registered On</span>: <span style="font-weight:400;">{{ $user->created_at ? $user->created_at->format('M d, Y h:i A') : 'N/A' }}</span></div>
                                    </div>
                                </div>
                                <div class="d-flex flex-wrap gap-2 mt-3">
                                    <button type="button" class="btn btn-outline-success btn-sm rounded-pill px-4 btn-approve-paid" 
                                            data-user-id="{{ $user->id }}"
                                            data-user-name="{{ $user->firstname }} {{ $user->lastname }}"
                                            data-user-email="{{ $user->email }}"
                                            data-user-mobile="{{ $user->mobile }}"
                                            data-user-image="{{ $user->image ? getImage(getFilePath('userProfile').'/'.$user->image, getFileSize('userProfile')) : asset('assets/images/avatar.png') }}">
                                            <i class="las la-arrow-up"></i> Approve as Paid
                                        </button>
                                    <a href="{{ route('admin.users.view-profile', $user->id) }}" class="btn btn-outline-primary btn-sm rounded-pill px-4"><i class="las la-eye"></i> View Profile</a>
                                    <a href="{{ route('admin.users.edit', $user->id) }}" class="btn btn-outline-warning btn-sm rounded-pill px-4"><i class="las la-edit"></i> Edit Profile</a>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
            @empty
            <div class="col-12">
                <div class="card">
                    <div class="card-body text-center">
                        <i class="las la-user-slash display-4 text-muted"></i>
                        <p class="mt-3">No paid members found</p>
                    </div>
                </div>
            </div>
            @endforelse
        </div>
        <div class="mt-4">
            {{ $users->links('pagination::bootstrap-4') }}
        </div>
    </div>
</div>
@endsection

@push('style')
<style>
    .plan-modal img{width:80px;height:80px;object-fit:cover;border-radius:4px;background:#f5f5f5;border:1px solid #e0e0e0}
</style>
@endpush

@push('script')
<script>
(function($){
    "use strict";
    const modalEl = document.getElementById('planAssignModal');
    let planModal;
    $(document).on('click','.btn-approve-paid',function(){
        const btn=$(this);
        const id=btn.data('user-id');
        // populate fields
        $('#planUserId').val(id);
        $('#planUserName').text(btn.data('user-name'));
        $('#planUserEmail').text(btn.data('user-email'));
        $('#planUserMobile').text(btn.data('user-mobile'));
        $('#planUserImg').attr('src',btn.data('user-image'));
        // set form action
        $('#planAssignForm').attr('action','{{ url('admin/users/change-plan') }}/'+id);
        if(!planModal){ planModal=new bootstrap.Modal(modalEl);} 
        planModal.show();
    });
})(jQuery);
</script>
@endpush


@push('modal')
<!-- Plan Assignment Modal -->
<div class="modal fade" id="planAssignModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg plan-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Plan Assignment</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="POST" id="planAssignForm">
                @csrf
                <div class="modal-body">
                    <div class="row mb-3 align-items-center">
                        <div class="col-md-3 text-center">
                            <img id="planUserImg" src="" alt="photo">
                        </div>
                        <div class="col-md-9">
                            <h5 id="planUserName"></h5>
                            <p class="mb-1"><i class="las la-envelope"></i> <span id="planUserEmail"></span></p>
                            <p><i class="las la-phone"></i> <span id="planUserMobile"></span></p>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Plan</label>
                        <select name="package_id" class="form-select" required>
                            <option value="" selected disabled>Select Plan</option>
                            @foreach($packages as $package)
                                <option value="{{ $package->id }}">{{ $package->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Payment Mode</label>
                        <select name="payment_mode" class="form-select" required>
                            <option value="" selected disabled>Select Payment Mode</option>
                            <option value="Cash">Cash</option>
                            <option value="Online">Online</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Payment Note</label>
                        <textarea name="payment_note" class="form-control" rows="3" placeholder="Enter Payment Note"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn--dark" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn--primary">Submit</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endpush 
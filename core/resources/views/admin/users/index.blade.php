@extends('admin.layouts.app')
@section('panel')
@php($isSuperAdmin = auth()->guard('admin')->check() && auth()->guard('admin')->user()->hasRole('Super Admin'))
@push('style')
<style>
    .nav-tabs .nav-link {
        font-weight: 600; /* semi-bold for all tabs */
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .nav-tabs .nav-link.active {
        font-weight: 700; /* bolder for the active tab */
    }
    .nav-tabs .badge {
        font-size: 0.75rem;
        padding: 0.35em 0.55em;
    }
</style>
@endpush
<div class="card">
    <div class="card-body">
        
        <div class="row mb-3 align-items-center">
            <div class="col-md-6">
                <form action="{{ route('admin.users.index') }}" method="GET" class="d-flex">
                    <input type="text" name="search" class="form-control me-2" placeholder="Search by name, ID, mobile, or email" value="{{ request('search') }}">
                    <button type="submit" class="btn btn--primary">
                        <i class="las la-search"></i> Search
                    </button>
                </form>
            </div>
            <div class="col-md-6 text-end d-flex justify-content-end align-items-center gap-3">
                <form action="{{ route('admin.users.index') }}" method="GET" id="sortForm" class="d-inline-block">
                    <label for="sort" class="me-2 fw-semibold">Sort</label>
                    <select name="sort" id="sort" class="form-select d-inline-block w-auto" style="min-width:180px;display:inline-block;" onchange="document.getElementById('sortForm').submit()">
                        <option value="latest" {{ request('sort') == 'latest' || !request('sort') ? 'selected' : '' }}>Latest</option>
                        <option value="today" {{ request('sort') == 'today' ? 'selected' : '' }}>Today</option>
                        <option value="asc" {{ request('sort') == 'asc' ? 'selected' : '' }}>Ascending</option>
                        <option value="desc" {{ request('sort') == 'desc' ? 'selected' : '' }}>Descending</option>
                    </select>
                </form>
                <a href="{{ route('admin.users.create') }}" class="btn btn--primary">
                    <i class="las la-plus"></i> Add New
                </a>
                <button type="button" class="btn btn--info" data-bs-toggle="modal" data-bs-target="#filterModal">
                    <i class="las la-filter"></i> Filter
                </button>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-12">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a class="nav-link {{ !request('status') ? 'active' : '' }}" href="{{ route('admin.users.index') }}">
                            All <span class="badge bg-secondary">{{ $counts['all'] }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request('status') == 'approved' ? 'active' : '' }}" href="{{ route('admin.users.index', ['status' => 'approved']) }}">
                            Approved List <span class="badge bg-success">{{ $counts['approved'] }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request('status') == 'unapproved' ? 'active' : '' }}" href="{{ route('admin.users.index', ['status' => 'unapproved']) }}">
                            Unapproved List <span class="badge bg-warning">{{ $counts['unapproved'] }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request('status') == 'paid' ? 'active' : '' }}" href="{{ route('admin.users.index', ['status' => 'paid']) }}">
                            Paid List <span class="badge bg-primary">{{ $counts['paid'] }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request('status') == 'suspended' ? 'active' : '' }}" href="{{ route('admin.users.index', ['status' => 'suspended']) }}">
                            Suspended List <span class="badge bg-danger">{{ $counts['suspended'] }}</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        
        <form action="{{ route('admin.users.bulk-action') }}" method="POST" id="memberForm">
            @csrf
            <div class="row mb-4">
                
                    <div class="col-12 d-flex flex-wrap gap-3 justify-content-end">
                    <button type="submit" name="action" value="delete" class="btn d-flex align-items-center" style="background:#f56565; color:#fff; font-weight:500; border-radius:8px; box-shadow:0 2px 8px rgba(245,101,101,0.15); border:1px solid #f56565; padding:0.5rem 1.5rem;" @unless($isSuperAdmin) disabled @endunless>
                        <i class="las la-trash-alt me-2"></i> Delete
                    </button>
                    @admincan('users.approve')
                        <button type="submit" name="action" value="approve" class="btn d-flex align-items-center" style="background:#38c172; color:#fff; font-weight:500; border-radius:8px; box-shadow:0 2px 8px rgba(56,193,114,0.15); border:1px solid #38c172; padding:0.5rem 1.5rem;">
                        <i class="las la-check me-2"></i> Approve
                    </button>
                    @endadmincan
                    @admincan('users.unapprove')
                        <button type="submit" name="action" value="unapprove" class="btn d-flex align-items-center" style="background:#f6ad55; color:#fff; font-weight:500; border-radius:8px; box-shadow:0 2px 8px rgba(246,173,85,0.15); border:1px solid #f6ad55; padding:0.5rem 1.5rem;">
                        <i class="las la-times me-2"></i> Unapprove
                    </button>
                    @endadmincan
                    @admincan('users.suspend')
                        <button type="submit" name="action" value="suspend" class="btn d-flex align-items-center" style="background:#232946; color:#fff; font-weight:500; border-radius:8px; box-shadow:0 2px 8px rgba(35,41,70,0.15); border:1px solid #232946; padding:0.5rem 1.5rem;">
                        <i class="las la-ban me-2"></i> Suspend
                    </button>
                    @endadmincan
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-12 d-flex align-items-center mb-2">
                    <div class="form-check me-3">
                        <input class="form-check-input" type="checkbox" id="selectAll">
                        <label class="form-check-label" for="selectAll">Select All</label>
                    </div>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <div class="d-flex align-items-center">
                        <label class="me-2">Show</label>
                        <select name="per_page" class="form-select w-auto" id="perPageSelect">
                            <option value="10" {{ request('per_page') == 10 ? 'selected' : '' }}>10</option>
                            <option value="25" {{ request('per_page') == 25 ? 'selected' : '' }}>25</option>
                            <option value="50" {{ request('per_page') == 50 ? 'selected' : '' }}>50</option>
                        </select>
                        <label class="ms-2">Entries</label>
                    </div>
                </div>
            </div>
            
            <div class="row">
                @forelse($users as $user)
                    <div class="col-12 mb-4">
                        <div class="card shadow-sm p-4 selectable-card" style="border-radius: 12px; background: #fff; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
                            <div class="row g-0 align-items-center">
                                <div class="col-md-2 text-center d-flex flex-column align-items-center justify-content-center" style="padding-right: 0;">
                                    <input type="checkbox" name="member_ids[]" value="{{ $user->id }}" class="form-check-input member-checkbox mb-3">
                                    <img src="{{ $user->image ? getImage(getFilePath('userProfile').'/'.$user->image, getFileSize('userProfile')) : asset('assets/images/avatar.png') }}" class="rounded" width="120" height="120" alt="Photo" style="object-fit:cover; background:#f5f5f5; border: 2px solid #e0e0e0; margin-bottom: 10px;">
                                </div>
                                <div class="col-md-10" style="padding-left: 24px;">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <span class="fw-bold" style="font-size: 1.5rem; color: #222; letter-spacing:0.5px;">{{ $user->firstname }} {{ $user->lastname }} <span style="color:#888; font-size:1.1rem;">(90KLYNM{{ $user->id }})</span></span>
                                        </div>
                                        <div>
                                            @if($user->status == Status::USER_BAN)
                                                 <span class="badge rounded-pill bg-danger px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">SUSPENDED</span>
                                             @elseif($user->status == Status::USER_UNAPPROVED)
                                                 <span class="badge rounded-pill bg-warning text-dark px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;"><i class="las la-thumbs-down"></i> UNAPPROVED</span>
                                             @elseif($user->limitation && in_array($user->limitation->package_id, [1,2,3]))
                                                 <span class="badge rounded-pill bg-primary px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">PAID</span>
                                             @elseif($user->status == Status::USER_ACTIVE && $user->limitation && $user->limitation->package_id == 4)
                                                 <span class="badge rounded-pill bg-success px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">APPROVED</span>
                                             @endif
                                        </div>
                                    </div>
                                    <div class="row mb-2" style="font-size:1.08rem; color:#333; line-height:2.1;">
                                        <div class="col-md-6 mb-1">
                                            <div><span style="font-weight:600;">Gender</span>: <span style="font-weight:400;">{{ optional($user->basicInfo)->gender ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">Mobile</span>: <span style="font-weight:400;">{{ $user->mobile }}</span></div>
                                            <div><span style="font-weight:600;">Religion</span>: <span style="font-weight:400;">{{ optional(optional($user->basicInfo)->religionInfo)->name ?? '-' }}</span></div>
                                            <div><span style="font-weight:600;">Caste Name</span>: <span style="font-weight:400;">{{ optional($user->basicInfo)->caste ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">Mother Tongue</span>: <span style="font-weight:400;">{{ optional($user->basicInfo)->mother_tongue ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">Marital Status</span>: <span style="font-weight:400;">{{ optional($user->basicInfo)->marital_status ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">Assign To Staff</span>: <span style="font-weight:400;">{{ optional($user->staff)->name ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">Plan Name</span>: <span style="font-weight:400;">{{ $user->limitation->package->name ?? 'FREE MATCH' }}</span></div>
                                            <div><span style="font-weight:600;">Plan Expired On</span>: <span style="font-weight:400;">{{ $user->limitation->expired_at ?? 'N/A' }}</span></div>
                                        </div>
                                        <div class="col-md-6 mb-1">
                                            <div><span style="font-weight:600;">Email</span>: <span style="font-weight:400;">{{ $user->email }}</span></div>
                                            <div><span style="font-weight:600;">Country Name</span>: <span style="font-weight:400;">{{ optional($user->basicInfo)->country ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">State Name</span>: <span style="font-weight:400;">{{ optional($user->basicInfo)->state ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">City Name</span>: <span style="font-weight:400;">{{ optional($user->basicInfo)->city ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">Birthdate</span>: <span style="font-weight:400;">{{ optional($user->basicInfo)->birth_date ?? 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">Registered On</span>: <span style="font-weight:400;">{{ $user->created_at ? $user->created_at->format('M d, Y h:i A') : 'N/A' }}</span></div>
                                            <div><span style="font-weight:600;">Assign To Franchise</span>: <span style="font-weight:400;">{{ $user->assigned_franchise ?? 'N/A' }}</span></div>
                                        </div>
                                    </div>
                                    <div class="d-flex flex-wrap gap-2 mt-3">
                                        <a href="{{ route('admin.users.confirm-email', $user->id) }}" class="btn btn-outline-success btn-sm rounded-pill px-4"><i class="las la-envelope"></i> Confirm Email</a>
                                        <a href="javascript:void(0)" class="btn btn-outline-dark btn-sm rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#addCommentModal" data-id="{{ $user->id }}"><i class="las la-comment"></i> Add Comment</a>
                                        <a href="{{ route('admin.users.view-comments', $user->id) }}" class="btn btn-outline-info btn-sm rounded-pill px-4"><i class="las la-comments"></i> View Comment</a>
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
                                <p class="mt-3">No members found</p>
                            </div>
                        </div>
                    </div>
                @endforelse
            </div>
        </form>
        
        <div class="mt-4 d-flex justify-content-center">
            {{ $users->appends(request()->all())->links('pagination::bootstrap-4') }}
        </div>
    </div>
</div>

<!-- Filter Modal -->
<div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="filterModalLabel">Advanced Filter</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form action="{{ route('admin.users.index') }}" method="GET">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label>Gender</label>
                            <select name="gender" class="form-select">
                                <option value="">Any</option>
                                <option value="Male" {{ request('gender') == 'Male' ? 'selected' : '' }}>Male</option>
                                <option value="Female" {{ request('gender') == 'Female' ? 'selected' : '' }}>Female</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label>Marital Status</label>
                            <select name="marital_status" class="form-select">
                                <option value="">Any</option>
                                <option value="Unmarried" {{ request('marital_status') == 'Unmarried' ? 'selected' : '' }}>Unmarried</option>
                                <option value="Divorced" {{ request('marital_status') == 'Divorced' ? 'selected' : '' }}>Divorced</option>
                                <option value="Widowed" {{ request('marital_status') == 'Widowed' ? 'selected' : '' }}>Widowed</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label>Religion</label>
                            <input type="text" name="religion" class="form-control" value="{{ request('religion') }}">
                        </div>
                        <div class="col-md-6">
                            <label>Caste</label>
                            <input type="text" name="caste" class="form-control" value="{{ request('caste') }}">
                        </div>
                        <div class="col-md-6">
                            <label>Country</label>
                            <input type="text" name="country" class="form-control" value="{{ request('country') }}">
                        </div>
                        <div class="col-md-6">
                            <label>State</label>
                            <input type="text" name="state" class="form-control" value="{{ request('state') }}">
                        </div>
                        <div class="col-md-6">
                            <label>City</label>
                            <input type="text" name="city" class="form-control" value="{{ request('city') }}">
                        </div>
                        <div class="col-md-6">
                            <label>Age Range</label>
                            <div class="d-flex">
                                <input type="number" name="age_from" class="form-control me-2" placeholder="From" value="{{ request('age_from') }}">
                                <input type="number" name="age_to" class="form-control" placeholder="To" value="{{ request('age_to') }}">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label>Registration Date</label>
                            <div class="d-flex">
                                <input type="date" name="reg_from" class="form-control me-2" value="{{ request('reg_from') }}">
                                <input type="date" name="reg_to" class="form-control" value="{{ request('reg_to') }}">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label>Plan Type</label>
                            <select name="plan_type" class="form-select">
                                <option value="">Any</option>
                                <option value="free" {{ request('plan_type') == 'free' ? 'selected' : '' }}>Free</option>
                                <option value="paid" {{ request('plan_type') == 'paid' ? 'selected' : '' }}>Paid</option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-4 text-end">
                        <button type="reset" class="btn btn--dark">Reset</button>
                        <button type="submit" class="btn btn--primary">Apply Filter</button>
                    </div>
                </form>
            </div>
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
            <form action="" method="POST" id="commentForm">
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
@if(session('success'))
    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="successModalLabel">@lang('Success')</h5>
                </div>
                <div class="modal-body">
                    {{ session('success') }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn--primary" data-bs-dismiss="modal">@lang('Okay')</button>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        });
    </script>
@endif
@endsection

@push('style')
<style>
    .selectable-card.selected {
        border: 2px solid #0d6efd !important;
        background: #f0f8ff;
    }
</style>
@endpush


@push('script')
<script>
(function($) {
    "use strict";
    // Card click toggles checkbox
    $(document).on('click', '.selectable-card', function(e){
        // Ignore clicks on interactive elements
        if($(e.target).is('input, button, a, i, label, textarea, select')) return;
        const cb=$(this).find('.member-checkbox');
        cb.prop('checked', !cb.prop('checked')).trigger('change');
    });
    // Checkbox change toggles selected style
    $(document).on('change', '.member-checkbox', function(){
        $(this).closest('.selectable-card').toggleClass('selected', $(this).prop('checked'));
    });
    "use strict";
    // Select All Checkbox
    $('#selectAll').on('change', function() {
        $('.member-checkbox').prop('checked', $(this).prop('checked'));
    });
    // Update Comment Form Action URL
    $('#addCommentModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var form = $('#commentForm');
        form.attr('action', '{{ route("admin.users.add-comment", "") }}/' + id);
    });

    // Confirmation dialog and AJAX for bulk actions
    $('#memberForm button[type="submit"]').on('click', function(e) {
        e.preventDefault();
        var action = $(this).val();
        var checked = $('.member-checkbox:checked').length;
        if (checked === 0) {
            showModal('Error', 'Please select at least one user.');
            return false;
        }
        let confirmMsg = '';
        if (action === 'delete') confirmMsg = 'Are you sure you want to delete the selected users?';
        if (action === 'approve') confirmMsg = 'Approve selected users?';
        if (action === 'unapprove') confirmMsg = 'Unapprove selected users?';
        if (action === 'suspend') confirmMsg = 'Suspend selected users?';
        showConfirmModal(confirmMsg, function() {
            // AJAX submit
            var form = $('#memberForm');
            var formData = form.serialize() + '&action=' + action;
            $.ajax({
                url: form.attr('action'),
                method: 'POST',
                data: formData,
                headers: {'X-CSRF-TOKEN': $('input[name="_token"]').val()},
                success: function(response) {
                    showModal('Success', response.message || 'Action completed successfully.');
                    setTimeout(function(){ location.reload(); }, 1500);
                },
                error: function(xhr) {
                    let msg = 'An error occurred.';
                    if(xhr.responseJSON && xhr.responseJSON.message) msg = xhr.responseJSON.message;
                    showModal('Error', msg);
                }
            });
        });
    });

    // Modal helpers
    window.showModal = function(title, message) {
        $('#actionModalLabel').text(title);
        $('#actionModalBody').html(message);
        var modal = new bootstrap.Modal(document.getElementById('actionModal'));
        modal.show();
    };
    // per page change reload
    $('#perPageSelect').on('change', function(){
        const val = $(this).val();
        const params = new URLSearchParams(window.location.search);
        params.set('per_page', val);
        window.location.href = window.location.pathname + '?' + params.toString();
    });

    window.showConfirmModal = function(message, onConfirm) {
        $('#confirmModalBody').html(message);
        var modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
        $('#confirmModalYes').off('click').on('click', function() {
            modal.hide();
            if (typeof onConfirm === 'function') onConfirm();
        });
    };
})(jQuery);
</script>
<!-- Action Modal -->
<div class="modal fade" id="actionModal" tabindex="-1" aria-labelledby="actionModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="actionModalLabel">Message</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="actionModalBody"></div>
            <div class="modal-footer">
                <button type="button" class="btn btn--primary" data-bs-dismiss="modal">OK</button>
            </div>
        </div>
    </div>
</div>
<!-- Confirm Modal -->
<div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="confirmModalLabel">Confirm Action</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="confirmModalBody"></div>
            <div class="modal-footer">
                <button type="button" class="btn btn--dark" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn--primary" id="confirmModalYes">Yes</button>
            </div>
        </div>
    </div>
</div>
@endpush
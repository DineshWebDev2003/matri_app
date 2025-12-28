@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <h4 class="mb-4">{{ $pageTitle }}</h4>
        
        <div class="row mb-3 align-items-center">
            <div class="col-md-6">
                <form action="{{ route('admin.members.index') }}" method="GET" class="d-flex">
                        @if(request('status'))
                            <input type="hidden" name="status" value="{{ request('status') }}"/>
                        @endif
                    <input type="text" name="search" class="form-control me-2" placeholder="Search by name, ID, mobile, or email" value="{{ request('search') }}">
                    <button type="submit" class="btn btn--primary">
                        <i class="las la-search"></i> Search
                    </button>
                </form>
            </div>
            <div class="col-md-6 text-end">
                <a href="{{ route('admin.members.create') }}" class="btn btn--primary">
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
                        <a class="nav-link {{ !request('status') ? 'active' : '' }}" href="{{ route('admin.members.index') }}">
                            All <span class="badge bg-secondary">{{ $counts['all'] }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request('status') == 'approved' ? 'active' : '' }}" href="{{ route('admin.members.index', ['status' => 'approved']) }}">
                            Approved List <span class="badge bg-success">{{ $counts['approved'] }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request('status') == 'unapproved' ? 'active' : '' }}" href="{{ route('admin.members.index', ['status' => 'unapproved']) }}">
                            Unapproved List <span class="badge bg-warning">{{ $counts['unapproved'] }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request('status') == 'paid' ? 'active' : '' }}" href="{{ route('admin.members.index', ['status' => 'paid']) }}">
                            Paid List <span class="badge bg-primary">{{ $counts['paid'] }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request('status') == 'suspended' ? 'active' : '' }}" href="{{ route('admin.members.index', ['status' => 'suspended']) }}">
                            Suspended List <span class="badge bg-danger">{{ $counts['suspended'] }}</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        
        <form action="{{ route('admin.members.bulk-action') }}" method="POST" id="memberForm">
            @csrf
            <div class="row mb-3">
                <div class="col-12 d-flex align-items-center mb-2">
                    <div class="form-check me-3">
                        <input class="form-check-input" type="checkbox" id="selectAll">
                        <label class="form-check-label" for="selectAll">Select All</label>
                    </div>
                    <button type="submit" name="action" value="delete" class="btn btn--danger btn-sm me-2">
                        <i class="las la-trash"></i> Delete
                    </button>
                    <button type="submit" name="action" value="approve" class="btn btn--success btn-sm me-2">
                        <i class="las la-check"></i> Approve
                    </button>
                    <button type="submit" name="action" value="unapprove" class="btn btn--warning btn-sm me-2">
                        <i class="las la-times"></i> Unapprove
                    </button>
                    <button type="submit" name="action" value="suspend" class="btn btn--dark btn-sm">
                        <i class="las la-ban"></i> Suspend
                    </button>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <div class="d-flex align-items-center">
                        <label class="me-2">Show</label>
                        @if(request('status'))
                                    <input type="hidden" name="status" value="{{ request('status') }}"/>
                                @endif
                                <select name="per_page" class="form-select w-auto" onchange="this.form.submit()">
                            <option value="10" {{ request('per_page') == 10 ? 'selected' : '' }}>10</option>
                            <option value="25" {{ request('per_page') == 25 ? 'selected' : '' }}>25</option>
                            <option value="50" {{ request('per_page') == 50 ? 'selected' : '' }}>50</option>
                        </select>
                        <label class="ms-2">Entries</label>
                    </div>
                </div>
                <div class="col-md-6 text-end">
                    <div class="d-flex align-items-center justify-content-end">
                        <label class="me-2">Sort</label>
                        @if(request('status'))
                                            <input type="hidden" name="status" value="{{ request('status') }}"/>
                                        @endif
                                        <select name="sort" class="form-select w-auto" onchange="this.form.submit()">
                            <option value="latest" {{ request('sort') == 'latest' || !request('sort') ? 'selected' : '' }}>Latest Descending</option>
                            <option value="oldest" {{ request('sort') == 'oldest' ? 'selected' : '' }}>Earliest</option>
                            <option value="a-z" {{ request('sort') == 'a-z' ? 'selected' : '' }}>A-Z</option>
                            <option value="z-a" {{ request('sort') == 'z-a' ? 'selected' : '' }}>Z-A</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="row">
                @forelse($members as $member)
                    <div class="col-12 mb-4">
                        <div class="card shadow-sm p-3" style="border-radius: 12px;">
                            <div class="row g-0 align-items-center">
                                <div class="col-md-2 text-center">
                                    <input type="checkbox" name="member_ids[]" value="{{ $member->id }}" class="form-check-input member-checkbox">
                                    <img src="{{ $member->image ? asset('assets/images/user/'.$member->image) : 'https://via.placeholder.com/100' }}" class="rounded-circle" width="100" height="100" alt="Photo">
                                </div>
                                <div class="col-md-10">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <span class="fw-bold" style="font-size: 1.2rem;">{{ $member->firstname }} {{ $member->lastname }} (NKLYNM{{ $member->id }})</span>
                                        </div>
                                        <div>
                                            @if($member->status == Status::USER_ACTIVE)
                                                <span class="badge bg-success">APPROVED</span>
                                            @elseif($member->status == Status::USER_UNAPPROVED)
                                                <span class="badge bg-warning text-dark">UNAPPROVED</span>
                                            @elseif($member->status == Status::USER_BAN)
                                                <span class="badge bg-danger">SUSPENDED</span>
                                            @endif
                                            
                                            @if($member->limitation && $member->limitation->package_id > 0)
                                                <span class="badge bg-primary">PAID</span>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-md-6">
                                            <div><b>Gender:</b> {{ $member->basicInfo->gender ?? 'N/A' }}</div>
                                            <div><b>Mobile:</b> {{ $member->mobile }}</div>
                                            <div><b>Religion:</b> {{ optional($member->basicInfo->religionInfo)->name ?? 'N/A' }}</div>
                                            <div><b>Caste:</b> {{ $member->basicInfo->caste ?? 'N/A' }}</div>
                                            <div><b>Mother Tongue:</b> {{ $member->basicInfo->mother_tongue ?? 'N/A' }}</div>
                                            <div><b>Marital Status:</b> {{ $member->basicInfo->marital_status ?? 'N/A' }}</div>
                                            <div><b>Plan Name:</b> {{ $member->limitation->package->name ?? 'FREE MATCH' }}</div>
                                            <div><b>Assign To Staff:</b> {{ $member->assigned_staff ?? 'N/A' }}</div>
                                        </div>
                                        <div class="col-md-6">
                                            <div><b>Email:</b> {{ $member->email }}</div>
                                            <div><b>Country:</b> {{ $member->basicInfo->country ?? 'N/A' }}</div>
                                            <div><b>State:</b> {{ $member->basicInfo->state ?? 'N/A' }}</div>
                                            <div><b>City:</b> {{ $member->basicInfo->city ?? 'N/A' }}</div>
                                            <div><b>Birthdate:</b> {{ $member->basicInfo->birth_date ?? 'N/A' }}</div>
                                            <div><b>Registered On:</b> {{ $member->created_at ? $member->created_at->format('M d, Y h:i A') : 'N/A' }}</div>
                                            <div><b>Assign To Franchise:</b> {{ $member->assigned_franchise ?? 'N/A' }}</div>
                                            <div><b>Plan Expired On:</b> {{ $member->limitation->expired_at ?? 'N/A' }}</div>
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2 mt-2">
                                        <a href="{{ route('admin.members.confirm-email', $member->id) }}" class="btn btn--success btn-sm">
                                            <i class="las la-envelope"></i> Confirm Email
                                        </a>
                                        <a href="javascript:void(0)" class="btn btn--dark btn-sm" data-bs-toggle="modal" data-bs-target="#addCommentModal" data-id="{{ $member->id }}">
                                            <i class="las la-comment"></i> Add Comment
                                        </a>
                                        <a href="{{ route('admin.members.view-comments', $member->id) }}" class="btn btn--info btn-sm">
                                            <i class="las la-comments"></i> View Comments
                                        </a>
                                        <a href="{{ route('admin.members.view-profile', $member->id) }}" class="btn btn--primary btn-sm">
                                            <i class="las la-eye"></i> View Profile
                                        </a>
                                        <a href="{{ route('admin.members.edit', $member->id) }}" class="btn btn--warning btn-sm">
                                            <i class="las la-edit"></i> Edit Profile
                                        </a>
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
            {{ $members->appends(request()->all())->links() }}
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
                <form action="{{ route('admin.members.index') }}" method="GET">
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
@endsection

@push('script')
<script>
    (function($) {
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
            form.attr('action', '{{ route("admin.members.add-comment", "") }}/' + id);
        });
        
    })(jQuery);
</script>
@endpush
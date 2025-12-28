@php($inFollowUp = isset($extra) && $extra === true)
<div class="col-12 mb-4">
    <div class="card shadow-sm p-3" style="border-radius: 12px;">
        <div class="row g-0 align-items-center">
            <div class="col-md-2 text-center">
                <img src="{{ $user->image ? asset('assets/images/user/'.$user->image) : asset('assets/images/default.png') }}" class="rounded-circle" width="100" height="100" alt="Photo">
            </div>
            <div class="col-md-10">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <span class="fw-bold" style="font-size: 1.2rem;">{{ $user->firstname }} {{ $user->lastname }} (NKLYNM{{ $user->id }})</span>
                    </div>
                    <div>
                        @if($user->status == 'approved')
                            <span class="badge bg-success">APPROVED</span>
                        @elseif($user->status == 'unapproved')
                            <span class="badge bg-warning text-dark">UNAPPROVED</span>
                        @elseif($user->status == 'suspended')
                            <span class="badge bg-danger">SUSPENDED</span>
                        @elseif($user->is_paid)
                            @php($planBadge = $user->limitation && $user->limitation->package_id != 4 ? 'PAID' : 'FREE')
                            @if($inFollowUp)
                                @php($statusBadge = $user->follow_up_status == 'completed' ? ['APPROVED','bg-success'] : ['PENDING','bg-warning text-dark'])
                                <span class="badge {{ $statusBadge[1] }}">{{ $statusBadge[0] }}</span>
                            @else
                                <span class="badge bg-primary">{{ $planBadge }}</span>
                            @endif
                        @endif
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-md-6">
                        <div><b>Gender:</b> {{ $user->basicInfo->gender ?? '-' }}</div>
                        <div><b>Mobile:</b> {{ $user->mobile }}</div>
                        @php
    $religionName = '-';
    if(optional($user->basicInfo)->religion_id){
        $religionName = optional(\App\Models\ReligionInfo::find($user->basicInfo->religion_id))->name ?? '-';
    } elseif(optional(optional($user->basicInfo)->toArray())['religion']) {
        $religionName = optional(optional($user->basicInfo)->toArray())['religion'];
    }
@endphp
<div><b>Religion:</b> {{ $religionName }}</div>
                        <div><b>Caste:</b> {{ $user->basicInfo->caste ?? '-' }}</div>
                        <div><b>Mother Tongue:</b> {{ $user->basicInfo->mother_tongue ?? '-' }}</div>
                        <div><b>Marital Status:</b> {{ $user->basicInfo->marital_status ?? '-' }}</div>
                        <div><b>Plan Name:</b> {{ $user->limitation->package->name ?? 'FREE MATCH' }}</div>
                        <div><b>Assign Staff:</b> {{ optional($user->staff)->name ?? '-' }}</div>
                    </div>
                    <div class="col-md-6">
                        <div><b>Email:</b> {{ $user->email }}</div>
                        <div><b>Country:</b> {{ $user->basicInfo->country ?? '-' }}</div>
                        <div><b>State:</b> {{ $user->basicInfo->state ?? '-' }}</div>
                        <div><b>City:</b> {{ $user->basicInfo->city ?? '-' }}</div>
                        <div><b>Birthdate:</b> {{ $user->basicInfo->birth_date ?? '-' }}</div>
                        <div><b>Registered On:</b> {{ $user->created_at ? $user->created_at->format('M d, Y h:i A') : '-' }}</div>
                        <div><b>Assign Franchise:</b> {{ $user->assigned_franchise ?? '-' }}</div>
                        <div><b>Plan Expired On:</b> {{ $user->limitation->expired_at ?? '-' }}</div>
                    </div>
                </div>
                @if($inFollowUp)
                <div class="d-flex gap-2 mt-2">
                    <a href="{{ route('admin.users.view-profile', $user->id) }}" class="btn btn-info btn-sm">View Profile</a>
                    <form method="POST" action="{{ route('admin.users.followup.update-status') }}" class="d-inline">
                        @csrf
                        <input type="hidden" name="user_id" value="{{ $user->id }}">
                        <input type="hidden" name="status" value="completed">
                        <button type="submit" class="btn btn-success btn-sm">Follow Up</button>
                    </form>
                </div>
                @else
                <div class="d-flex gap-2 mt-2">
                    <a href="{{ route('admin.users.view-profile', $user->id) }}" class="btn btn-info btn-sm">View Profile</a>
                    <a href="{{ route('admin.users.edit', $user->id) }}" class="btn btn-primary btn-sm">Edit Profile</a>
                    <a href="{{ route('admin.users.confirm-email', $user->id) }}" class="btn btn-success btn-sm">Confirm Email</a>
                    <a href="{{ route('admin.users.add-comment', $user->id) }}" class="btn btn-dark btn-sm">Add/View Comment</a>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <h4 class="mb-4">Expired Members</h4>
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
                                    <span class="badge rounded-pill bg-secondary px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">EXPIRED</span>
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
                                    <div><span style="font-weight:600;">Date of Birth</span>: <span style="font-weight:400;">{{ $user->basicInfo->dob ?? 'N/A' }}</span></div>
                                    <div><span style="font-weight:600;">Age</span>: <span style="font-weight:400;">{{ $user->basicInfo->age ?? 'N/A' }}</span></div>
                                    <div><span style="font-weight:600;">Height</span>: <span style="font-weight:400;">{{ $user->basicInfo->height ?? 'N/A' }}</span></div>
                                    <div><span style="font-weight:600;">Weight</span>: <span style="font-weight:400;">{{ $user->basicInfo->weight ?? 'N/A' }}</span></div>
                                    <div><span style="font-weight:600;">Package</span>: <span style="font-weight:400;">{{ optional($user->limitation->package)->name ?? 'N/A' }}</span></div>
                                    <div><span style="font-weight:600;">Expired On</span>: <span style="font-weight:400;">{{ $user->limitation->expire_date->format('d M Y') ?? 'N/A' }}</span></div>
                                </div>
                            </div>
                            <div class="d-flex flex-wrap gap-2 mt-3">
                                <a href="{{ route('admin.users.view-profile', $user->id) }}" class="btn btn-outline-primary btn-sm rounded-pill px-4"><i class="las la-eye"></i> View Profile</a>
                                <a href="{{ route('admin.users.edit', $user->id) }}" class="btn btn-outline-warning btn-sm rounded-pill px-4"><i class="las la-edit"></i> Edit Profile</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            @empty
                <p class="text-center">No expired members found</p>
            @endforelse
        </div>
        <div class="mt-4">
            {{ $users->links('pagination::bootstrap-4') }}
        </div>
    </div>
</div>
@endsection

@extends('admin.layouts.app')
@section('panel')
<div class="container-fluid">
    <h4 class="mb-4">Members Full Profile</h4>
    <div class="d-flex mb-3 gap-2">
        <a href="{{ url()->previous() }}" class="btn btn-primary"><i class="las la-arrow-left"></i> Back to list</a>
        <button class="btn btn-primary" onclick="window.print()"><i class="las la-print"></i> Print Profile</button>
    </div>
    <div class="card shadow-sm p-4" style="border-radius: 12px; background: #fff; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
        <div class="row g-0 align-items-center">
            <div class="col-md-12">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <span class="fw-bold" style="font-size: 1.5rem; color: #222; letter-spacing:0.5px;">{{ $user->firstname }} {{ $user->lastname }} <span style="color:#888; font-size:1.1rem;">(90KLYNM{{ $user->id }})</span></span>
                    </div>
                    <div>
                        @if($user->status == Status::USER_ACTIVE)
                            <span class="badge rounded-pill bg-success px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">APPROVED</span>
                        @elseif($user->status == Status::USER_UNAPPROVED)
                            <span class="badge rounded-pill bg-warning text-dark px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;"><i class="las la-thumbs-down"></i> UNAPPROVED</span>
                        @elseif($user->status == Status::USER_BAN && (!isset($user->limitation) || $user->limitation->package_id != 4))
                            <span class="badge rounded-pill bg-danger px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">SUSPENDED</span>
                        @elseif($user->limitation && $user->limitation->package_id == 4)
                            <span class="badge rounded-pill bg-warning text-dark px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;"><i class="las la-thumbs-down"></i> UNAPPROVED</span>
                        @endif
                        @if($user->limitation && in_array($user->limitation->package_id, [1,2,3]))
                            <span class="badge rounded-pill bg-primary px-4 py-2" style="font-size:1.1rem; letter-spacing:1px;">PAID</span>
                        @endif
                    </div>
                </div>
                <div class="row mb-2" style="font-size:1.08rem; color:#333; line-height:2.1;">
                    <div class="col-md-6 mb-1">
                        <div><span style="font-weight:600;">Plan Name</span>: <span style="font-weight:400;">{{ $user->limitation->package->name ?? 'FREE MATCH' }}</span></div>
                        <div><span style="font-weight:600;">Plan Expired On</span>: <span style="font-weight:400;">{{ $user->limitation->expired_at ?? 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">Name</span>: <span style="font-weight:400;">{{ $user->firstname }} {{ $user->lastname }}</span></div>
                        <div><span style="font-weight:600;">Marital Status</span>: <span style="font-weight:400;">{{ $user->basicInfo->marital_status ?? 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">Mother Tongue</span>: <span style="font-weight:400;">{{ $user->basicInfo->mother_tongue ?? 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">Mobile</span>: <span style="font-weight:400;">{{ $user->mobile }}</span></div>
                        <div><span style="font-weight:600;">Religion</span>: <span style="font-weight:400;">{{ optional(optional($user->basicInfo)->religionInfo)->name ?? '-' }}</span></div>
                        <div><span style="font-weight:600;">Caste Name</span>: <span style="font-weight:400;">{{ $user->basicInfo->caste ?? 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">Assign To Staff</span>: <span style="font-weight:400;">{{ optional($user->staff)->name ?? 'N/A' }}</span></div>
                    </div>
                    <div class="col-md-6 mb-1">
                        <div><span style="font-weight:600;">Email</span>: <span style="font-weight:400;">{{ $user->email }}</span></div>
                        <div><span style="font-weight:600;">Country Name</span>: <span style="font-weight:400;">{{ $user->basicInfo->country ?? 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">State Name</span>: <span style="font-weight:400;">{{ $user->basicInfo->state ?? 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">City Name</span>: <span style="font-weight:400;">{{ $user->basicInfo->city ?? 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">Birthdate</span>: <span style="font-weight:400;">{{ $user->basicInfo->birth_date ?? 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">Registered On</span>: <span style="font-weight:400;">{{ $user->created_at ? $user->created_at->format('M d, Y h:i A') : 'N/A' }}</span></div>
                        <div><span style="font-weight:600;">Assign To Franchise</span>: <span style="font-weight:400;">{{ $user->assigned_franchise ?? 'N/A' }}</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card mb-4" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div class="card-header" style="background: #f4f7fe; color: #232946; font-weight:600; font-size:1.1rem; border-top-left-radius: 12px; border-top-right-radius: 12px; border-bottom: 1px solid #e0e0e0;">About Us</div>
        <div class="card-body" style="font-size:1.08rem; color:#333; line-height:2.1;">
            <div>{{ $user->basicInfo->about ?? 'N/A' }}</div>
        </div>
    </div>
    <div class="card mb-4" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div class="card-header" style="background: #f4f7fe; color: #232946; font-weight:600; font-size:1.1rem; border-top-left-radius: 12px; border-top-right-radius: 12px; border-bottom: 1px solid #e0e0e0;">Religious Information</div>
        <div class="card-body row" style="font-size:1.08rem; color:#333; line-height:2.1;">
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Religion</span>: <span style="font-weight:400;">{{ optional($user->basicInfo->religionInfo)->name ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Caste</span>: <span style="font-weight:400;">{{ $user->basicInfo->caste ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Sub Caste</span>: <span style="font-weight:400;">{{ $user->basicInfo->sub_caste ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Gothram</span>: <span style="font-weight:400;">{{ $user->basicInfo->gothram ?? 'N/A' }}</span></div>
        </div>
    </div>
    <div class="card mb-4" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div class="card-header" style="background: #f4f7fe; color: #232946; font-weight:600; font-size:1.1rem; border-top-left-radius: 12px; border-top-right-radius: 12px; border-bottom: 1px solid #e0e0e0;">Physical Attributes</div>
        <div class="card-body row" style="font-size:1.08rem; color:#333; line-height:2.1;">
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Height</span>: <span style="font-weight:400;">{{ $user->physicalAttributes->height ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Weight</span>: <span style="font-weight:400;">{{ $user->physicalAttributes->weight ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Body Type</span>: <span style="font-weight:400;">{{ $user->physicalAttributes->body_type ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Skin Tone</span>: <span style="font-weight:400;">{{ $user->physicalAttributes->skin_tone ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Eating Habit</span>: <span style="font-weight:400;">{{ $user->physicalAttributes->eating_habit ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Drinking Habit</span>: <span style="font-weight:400;">{{ $user->physicalAttributes->drinking_habit ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Smoking Habit</span>: <span style="font-weight:400;">{{ $user->physicalAttributes->smoking_habit ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Blood Group</span>: <span style="font-weight:400;">{{ $user->physicalAttributes->blood_group ?? 'N/A' }}</span></div>
        </div>
    </div>
    <div class="card mb-4" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div class="card-header" style="background: #f4f7fe; color: #232946; font-weight:600; font-size:1.1rem; border-top-left-radius: 12px; border-top-right-radius: 12px; border-bottom: 1px solid #e0e0e0;">Family Information</div>
        <div class="card-body row" style="font-size:1.08rem; color:#333; line-height:2.1;">
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Father's Name</span>: <span style="font-weight:400;">{{ $user->family->father_name ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Mother's Name</span>: <span style="font-weight:400;">{{ $user->family->mother_name ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">No. of Siblings</span>: <span style="font-weight:400;">{{ $user->family->no_of_siblings ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Family Type</span>: <span style="font-weight:400;">{{ $user->family->family_type ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Family Status</span>: <span style="font-weight:400;">{{ $user->family->family_status ?? 'N/A' }}</span></div>
            <div class="col-md-6 mb-1"><span style="font-weight:600;">Family Value</span>: <span style="font-weight:400;">{{ $user->family->family_value ?? 'N/A' }}</span></div>
        </div>
    </div>
    <div class="card mb-4">
        <div class="card-header bg-primary text-white">Education Information</div>
        <div class="card-body">
            @if($user->educationInfo && $user->educationInfo->count())
                <ul>
                    @foreach($user->educationInfo as $edu)
                        <li>{{ $edu->education ?? 'N/A' }} - {{ $edu->degree ?? '' }}</li>
                    @endforeach
                </ul>
            @else
                <div>N/A</div>
            @endif
        </div>
    </div>
    <div class="card mb-4">
        <div class="card-header bg-primary text-white">Career Information</div>
        <div class="card-body">
            @if($user->careerInfo && $user->careerInfo->count())
                <ul>
                    @foreach($user->careerInfo as $career)
                        <li>{{ $career->occupation ?? 'N/A' }} - {{ $career->company ?? '' }}</li>
                    @endforeach
                </ul>
            @else
                <div>N/A</div>
            @endif
        </div>
    </div>
    <div class="card mb-4">
        <div class="card-header bg-primary text-white">Partner Expectation</div>
        <div class="card-body">
            <div>{{ $user->partnerExpectation->expectation ?? 'N/A' }}</div>
        </div>
    </div>
    <div class="card mb-4">
        <div class="card-header bg-primary text-white">Gallery</div>
        <div class="card-body">
            @if($user->galleries && $user->galleries->count())
                <div class="row">
                    @foreach($user->galleries as $gallery)
                        <div class="col-md-2 mb-2">
                            <img src="{{ asset('assets/images/user/gallery/'.$gallery->image) }}" class="img-thumbnail" alt="Gallery Image">
                        </div>
                    @endforeach
                </div>
            @else
                <div>No images found.</div>
            @endif
        </div>
    </div>
    @if($user->comments && $user->comments->count())
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">Comments</div>
            <div class="card-body">
                @foreach($user->comments as $comment)
                    <div class="mb-2">
                        <strong>{{ $comment->admin->name ?? 'Admin' }}:</strong>
                        <span>{{ $comment->comment }}</span>
                        <small class="text-muted">({{ $comment->created_at->format('d M Y, h:i A') }})</small>
                    </div>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection 
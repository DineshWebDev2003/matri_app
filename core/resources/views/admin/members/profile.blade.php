@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <h4 class="mb-4">{{ $pageTitle }}</h4>
        
        <div class="row">
            <div class="col-md-3">
                <div class="card">
                    <div class="card-body text-center">
                        <img src="{{ $member->image ? asset('assets/images/user/'.$member->image) : 'https://via.placeholder.com/200' }}" class="img-thumbnail rounded-circle mb-3" style="width: 200px; height: 200px; object-fit: cover;">
                        <h5>{{ $member->firstname }} {{ $member->lastname }}</h5>
                        <p class="text-muted">NKLYNM{{ $member->id }}</p>
                        
                        <div class="mt-3">
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
                        
                        <div class="mt-3">
                            <a href="{{ route('admin.members.edit', $member->id) }}" class="btn btn--primary btn-sm w-100 mb-2">
                                <i class="las la-edit"></i> Edit Profile
                            </a>
                            <a href="{{ route('admin.members.view-comments', $member->id) }}" class="btn btn--info btn-sm w-100 mb-2">
                                <i class="las la-comments"></i> View Comments
                            </a>
                            <a href="{{ route('admin.members.confirm-email', $member->id) }}" class="btn btn--success btn-sm w-100">
                                <i class="las la-envelope"></i> Confirm Email
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="card mt-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Contact Information</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Email</span>
                                <span class="text-muted">{{ $member->email }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Mobile</span>
                                <span class="text-muted">{{ $member->mobile }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Address</span>
                                <span class="text-muted">{{ optional($member->basicInfo)->address ?? 'N/A' }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>City</span>
                                <span class="text-muted">{{ optional($member->basicInfo)->city ?? 'N/A' }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>State</span>
                                <span class="text-muted">{{ optional($member->basicInfo)->state ?? 'N/A' }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Country</span>
                                <span class="text-muted">{{ optional($member->basicInfo)->country ?? 'N/A' }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div class="card mt-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Account Information</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Registered On</span>
                                <span class="text-muted">{{ $member->created_at ? $member->created_at->format('M d, Y h:i A') : 'N/A' }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Last Login</span>
                                <span class="text-muted">{{ $member->last_login ? $member->last_login->format('M d, Y h:i A') : 'N/A' }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Plan Name</span>
                                <span class="text-muted">{{ $member->limitation->package->name ?? 'FREE MATCH' }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Plan Expired On</span>
                                <span class="text-muted">{{ $member->limitation->expired_at ?? 'N/A' }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Assigned Staff</span>
                                <span class="text-muted">{{ $member->assigned_staff ?? 'N/A' }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Assigned Franchise</span>
                                <span class="text-muted">{{ $member->assigned_franchise ?? 'N/A' }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="col-md-9">
                <ul class="nav nav-tabs mb-3" id="profileTabs" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active" id="basic-tab" data-bs-toggle="tab" href="#basic" role="tab">Basic Details</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="physical-tab" data-bs-toggle="tab" href="#physical" role="tab">Physical Attributes</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="family-tab" data-bs-toggle="tab" href="#family" role="tab">Family Details</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="education-tab" data-bs-toggle="tab" href="#education" role="tab">Education & Career</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="partner-tab" data-bs-toggle="tab" href="#partner" role="tab">Partner Preference</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="gallery-tab" data-bs-toggle="tab" href="#gallery" role="tab">Photo Gallery</a>
                    </li>
                </ul>
                
                <div class="tab-content">
                    <!-- Basic Details Tab -->
                    <div class="tab-pane fade show active" id="basic" role="tabpanel">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Basic Information</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Full Name</th>
                                                    <td width="60%">{{ $member->firstname }} {{ $member->lastname }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Member ID</th>
                                                    <td>NKLYNM{{ $member->id }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Gender</th>
                                                    <td>{{ optional($member->basicInfo)->gender ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Date of Birth</th>
                                                    <td>{{ optional($member->basicInfo)->birth_date ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Age</th>
                                                    <td>
                                                        @if(optional($member->basicInfo)->birth_date)
                                                            {{ \Carbon\Carbon::parse(optional($member->basicInfo)->birth_date)->age }} Years
                                                        @else
                                                            N/A
                                                        @endif
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Marital Status</th>
                                                    <td width="60%">{{ optional($member->basicInfo)->marital_status ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Mother Tongue</th>
                                                    <td>{{ optional($member->basicInfo)->mother_tongue ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Religion</th>
                                                    <td>{{ optional($member->basicInfo)->religion ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Caste</th>
                                                    <td>{{ optional($member->basicInfo)->caste ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Sub Caste</th>
                                                    <td>{{ optional($member->basicInfo)->sub_caste ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Physical Attributes Tab -->
                    <div class="tab-pane fade" id="physical" role="tabpanel">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Physical Attributes</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Height</th>
                                                    <td width="60%">{{ optional($member->physicalAttributes)->height ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Weight</th>
                                                    <td>{{ optional($member->physicalAttributes)->weight ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Body Type</th>
                                                    <td>{{ optional($member->physicalAttributes)->body_type ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Complexion</th>
                                                    <td width="60%">{{ optional($member->physicalAttributes)->complexion ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Blood Group</th>
                                                    <td>{{ optional($member->physicalAttributes)->blood_group ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Physical Status</th>
                                                    <td>{{ optional($member->physicalAttributes)->physical_status ?? 'Normal' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Family Details Tab -->
                    <div class="tab-pane fade" id="family" role="tabpanel">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Family Details</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Family Type</th>
                                                    <td width="60%">{{ optional($member->family)->family_type ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Family Status</th>
                                                    <td>{{ optional($member->family)->family_status ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Father's Occupation</th>
                                                    <td>{{ optional($member->family)->father_occupation ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Mother's Occupation</th>
                                                    <td width="60%">{{ optional($member->family)->mother_occupation ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>No. of Brothers</th>
                                                    <td>{{ optional($member->family)->brothers ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>No. of Sisters</th>
                                                    <td>{{ optional($member->family)->sisters ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Education & Career Tab -->
                    <div class="tab-pane fade" id="education" role="tabpanel">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Education & Career</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Education</th>
                                                    <td width="60%">{{ optional($member->educationInfo)->education ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Education Details</th>
                                                    <td>{{ optional($member->educationInfo)->education_details ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Occupation</th>
                                                    <td width="60%">{{ optional($member->careerInfo)->occupation ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Income</th>
                                                    <td>{{ optional($member->careerInfo)->income ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Working Location</th>
                                                    <td>{{ optional($member->careerInfo)->working_location ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Partner Preference Tab -->
                    <div class="tab-pane fade" id="partner" role="tabpanel">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Partner Preference</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Age Preference</th>
                                                    <td width="60%">
                                                        @if(optional($member->partnerExpectation)->age_from && optional($member->partnerExpectation)->age_to)
                                                            {{ optional($member->partnerExpectation)->age_from }} to {{ optional($member->partnerExpectation)->age_to }} Years
                                                        @else
                                                            N/A
                                                        @endif
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Height Preference</th>
                                                    <td>
                                                        @if(optional($member->partnerExpectation)->height_from && optional($member->partnerExpectation)->height_to)
                                                            {{ optional($member->partnerExpectation)->height_from }} to {{ optional($member->partnerExpectation)->height_to }}
                                                        @else
                                                            N/A
                                                        @endif
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Religion Preference</th>
                                                    <td>{{ optional($member->partnerExpectation)->religion ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Caste Preference</th>
                                                    <td>{{ optional($member->partnerExpectation)->caste ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="col-md-6">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th width="40%">Education Preference</th>
                                                    <td width="60%">{{ optional($member->partnerExpectation)->education ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Occupation Preference</th>
                                                    <td>{{ optional($member->partnerExpectation)->occupation ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Marital Status Preference</th>
                                                    <td>{{ optional($member->partnerExpectation)->marital_status ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Location Preference</th>
                                                    <td>{{ optional($member->partnerExpectation)->location ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div class="row mt-3">
                                    <div class="col-md-12">
                                        <h6>Other Preferences</h6>
                                        <p>{{ optional($member->partnerExpectation)->other_preferences ?? 'No specific preferences mentioned.' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Photo Gallery Tab -->
                    <div class="tab-pane fade" id="gallery" role="tabpanel">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Photo Gallery</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    @if($member->galleries && $member->galleries->count() > 0)
                                        @foreach($member->galleries as $gallery)
                                            <div class="col-md-4 mb-4">
                                                <div class="card">
                                                    <img src="{{ asset('assets/images/gallery/'.$gallery->image) }}" class="card-img-top" alt="Gallery Image">
                                                </div>
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="col-md-12 text-center">
                                            <p>No gallery photos available.</p>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
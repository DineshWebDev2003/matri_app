@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <h4 class="mb-4">{{ $pageTitle }}</h4>
        
        <form action="{{ route('admin.members.update', $member->id) }}" method="POST" enctype="multipart/form-data">
            @csrf
            
            <ul class="nav nav-tabs mb-3" id="editMemberTabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="basic-tab" data-bs-toggle="tab" href="#basic" role="tab">Basic Details</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="residence-tab" data-bs-toggle="tab" href="#residence" role="tab">Residence</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="physical-tab" data-bs-toggle="tab" href="#physical" role="tab">Physical Info</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="other-tab" data-bs-toggle="tab" href="#other" role="tab">Other Info</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="partner-tab" data-bs-toggle="tab" href="#partner" role="tab">Partner Preference</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="photos-tab" data-bs-toggle="tab" href="#photos" role="tab">Upload Photos</a>
                </li>
            </ul>
            
            <div class="tab-content">
                <!-- Basic Details Tab -->
                <div class="tab-pane fade show active" id="basic" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>First Name <span class="text-danger">*</span></label>
                                <input type="text" name="firstname" class="form-control" value="{{ $member->firstname }}" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Last Name <span class="text-danger">*</span></label>
                                <input type="text" name="lastname" class="form-control" value="{{ $member->lastname }}" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Email <span class="text-danger">*</span></label>
                                <input type="email" name="email" class="form-control" value="{{ $member->email }}" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Mobile <span class="text-danger">*</span></label>
                                <input type="text" name="mobile" class="form-control" value="{{ $member->mobile }}" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Password (leave blank to keep unchanged)</label>
                                <input type="password" name="password" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Status</label>
                                <select name="status" class="form-select">
                                    <option value="{{ Status::USER_ACTIVE }}" {{ $member->status == Status::USER_ACTIVE ? 'selected' : '' }}>Approved</option>
                                    <option value="{{ Status::USER_UNAPPROVED }}" {{ $member->status == Status::USER_UNAPPROVED ? 'selected' : '' }}>Unapproved</option>
                                    <option value="{{ Status::USER_BAN }}" {{ $member->status == Status::USER_BAN ? 'selected' : '' }}>Suspended</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Gender <span class="text-danger">*</span></label>
                                <div class="d-flex">
                                    <div class="form-check me-3">
                                        <input class="form-check-input" type="radio" name="gender" value="Male" id="genderMale" {{ optional($member->basicInfo)->gender == 'Male' ? 'checked' : '' }}>
                                        <label class="form-check-label" for="genderMale">Male</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="gender" value="Female" id="genderFemale" {{ optional($member->basicInfo)->gender == 'Female' ? 'checked' : '' }}>
                                        <label class="form-check-label" for="genderFemale">Female</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Date of Birth</label>
                                <input type="date" name="birth_date" class="form-control" value="{{ optional($member->basicInfo)->birth_date }}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Marital Status <span class="text-danger">*</span></label>
                                <select name="marital_status" class="form-select" required>
                                    <option value="">Select Marital Status</option>
                                    <option value="Unmarried" {{ optional($member->basicInfo)->marital_status == 'Unmarried' ? 'selected' : '' }}>Unmarried</option>
                                    <option value="Divorced" {{ optional($member->basicInfo)->marital_status == 'Divorced' ? 'selected' : '' }}>Divorced</option>
                                    <option value="Widowed" {{ optional($member->basicInfo)->marital_status == 'Widowed' ? 'selected' : '' }}>Widowed</option>
                                    <option value="Separated" {{ optional($member->basicInfo)->marital_status == 'Separated' ? 'selected' : '' }}>Separated</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Mother Tongue</label>
                                <input type="text" name="mother_tongue" class="form-control" value="{{ optional($member->basicInfo)->mother_tongue }}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Assign to Staff</label>
                                <select name="assigned_staff" class="form-select">
                                    <option value="">Select Staff</option>
                                    @foreach($staffs as $staff)
                                        <option value="{{ $staff->id }}" {{ $member->assigned_staff == $staff->id ? 'selected' : '' }}>{{ $staff->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Assign to Franchise</label>
                                <select name="assigned_franchise" class="form-select">
                                    <option value="">Select Franchise</option>
                                    @foreach($franchises as $franchise)
                                        <option value="{{ $franchise->id }}" {{ $member->assigned_franchise == $franchise->id ? 'selected' : '' }}>{{ $franchise->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Package</label>
                                <select name="package_id" class="form-select">
                                    <option value="">Free Package</option>
                                    @foreach($packages as $package)
                                        <option value="{{ $package->id }}" {{ optional($member->limitation)->package_id == $package->id ? 'selected' : '' }}>{{ $package->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Residence Tab -->
                <div class="tab-pane fade" id="residence" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Country</label>
                                <input type="text" name="country" class="form-control" value="{{ optional($member->basicInfo)->country }}">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>State</label>
                                <input type="text" name="state" class="form-control" value="{{ optional($member->basicInfo)->state }}">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>City</label>
                                <input type="text" name="city" class="form-control" value="{{ optional($member->basicInfo)->city }}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Address</label>
                                <textarea name="address" class="form-control" rows="3">{{ optional($member->basicInfo)->address }}</textarea>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Physical Info Tab -->
                <div class="tab-pane fade" id="physical" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Height</label>
                                <input type="text" name="height" class="form-control" value="{{ optional($member->physicalAttributes)->height }}">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Weight</label>
                                <input type="text" name="weight" class="form-control" value="{{ optional($member->physicalAttributes)->weight }}">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Body Type</label>
                                <select name="body_type" class="form-select">
                                    <option value="">Select Body Type</option>
                                    <option value="Slim" {{ optional($member->physicalAttributes)->body_type == 'Slim' ? 'selected' : '' }}>Slim</option>
                                    <option value="Average" {{ optional($member->physicalAttributes)->body_type == 'Average' ? 'selected' : '' }}>Average</option>
                                    <option value="Athletic" {{ optional($member->physicalAttributes)->body_type == 'Athletic' ? 'selected' : '' }}>Athletic</option>
                                    <option value="Heavy" {{ optional($member->physicalAttributes)->body_type == 'Heavy' ? 'selected' : '' }}>Heavy</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Complexion</label>
                                <select name="complexion" class="form-select">
                                    <option value="">Select Complexion</option>
                                    <option value="Fair" {{ optional($member->physicalAttributes)->complexion == 'Fair' ? 'selected' : '' }}>Fair</option>
                                    <option value="Medium" {{ optional($member->physicalAttributes)->complexion == 'Medium' ? 'selected' : '' }}>Medium</option>
                                    <option value="Wheatish" {{ optional($member->physicalAttributes)->complexion == 'Wheatish' ? 'selected' : '' }}>Wheatish</option>
                                    <option value="Dark" {{ optional($member->physicalAttributes)->complexion == 'Dark' ? 'selected' : '' }}>Dark</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Blood Group</label>
                                <select name="blood_group" class="form-select">
                                    <option value="">Select Blood Group</option>
                                    <option value="A+" {{ optional($member->physicalAttributes)->blood_group == 'A+' ? 'selected' : '' }}>A+</option>
                                    <option value="A-" {{ optional($member->physicalAttributes)->blood_group == 'A-' ? 'selected' : '' }}>A-</option>
                                    <option value="B+" {{ optional($member->physicalAttributes)->blood_group == 'B+' ? 'selected' : '' }}>B+</option>
                                    <option value="B-" {{ optional($member->physicalAttributes)->blood_group == 'B-' ? 'selected' : '' }}>B-</option>
                                    <option value="AB+" {{ optional($member->physicalAttributes)->blood_group == 'AB+' ? 'selected' : '' }}>AB+</option>
                                    <option value="AB-" {{ optional($member->physicalAttributes)->blood_group == 'AB-' ? 'selected' : '' }}>AB-</option>
                                    <option value="O+" {{ optional($member->physicalAttributes)->blood_group == 'O+' ? 'selected' : '' }}>O+</option>
                                    <option value="O-" {{ optional($member->physicalAttributes)->blood_group == 'O-' ? 'selected' : '' }}>O-</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Physical Status</label>
                                <select name="physical_status" class="form-select">
                                    <option value="Normal" {{ optional($member->physicalAttributes)->physical_status == 'Normal' ? 'selected' : '' }}>Normal</option>
                                    <option value="Physically Challenged" {{ optional($member->physicalAttributes)->physical_status == 'Physically Challenged' ? 'selected' : '' }}>Physically Challenged</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Other Info Tab -->
                <div class="tab-pane fade" id="other" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Religion</label>
                                <input type="text" name="religion" class="form-control" value="{{ optional($member->basicInfo)->religion }}">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Caste</label>
                                <input type="text" name="caste" class="form-control" value="{{ optional($member->basicInfo)->caste }}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Education</label>
                                <input type="text" name="education" class="form-control" value="{{ optional($member->educationInfo)->education }}">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Occupation</label>
                                <input type="text" name="occupation" class="form-control" value="{{ optional($member->careerInfo)->occupation }}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Income</label>
                                <input type="text" name="income" class="form-control" value="{{ optional($member->careerInfo)->income }}">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Family Type</label>
                                <select name="family_type" class="form-select">
                                    <option value="">Select Family Type</option>
                                    <option value="Nuclear" {{ optional($member->family)->family_type == 'Nuclear' ? 'selected' : '' }}>Nuclear</option>
                                    <option value="Joint" {{ optional($member->family)->family_type == 'Joint' ? 'selected' : '' }}>Joint</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Partner Preference Tab -->
                <div class="tab-pane fade" id="partner" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Age Preference</label>
                                <div class="d-flex">
                                    <input type="number" name="partner_age_from" class="form-control me-2" placeholder="From" value="{{ optional($member->partnerExpectation)->age_from }}">
                                    <input type="number" name="partner_age_to" class="form-control" placeholder="To" value="{{ optional($member->partnerExpectation)->age_to }}">
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Height Preference</label>
                                <div class="d-flex">
                                    <input type="text" name="partner_height_from" class="form-control me-2" placeholder="From" value="{{ optional($member->partnerExpectation)->height_from }}">
                                    <input type="text" name="partner_height_to" class="form-control" placeholder="To" value="{{ optional($member->partnerExpectation)->height_to }}">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Religion Preference</label>
                                <input type="text" name="partner_religion" class="form-control" value="{{ optional($member->partnerExpectation)->religion }}">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Caste Preference</label>
                                <input type="text" name="partner_caste" class="form-control" value="{{ optional($member->partnerExpectation)->caste }}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Education Preference</label>
                                <input type="text" name="partner_education" class="form-control" value="{{ optional($member->partnerExpectation)->education }}">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Occupation Preference</label>
                                <input type="text" name="partner_occupation" class="form-control" value="{{ optional($member->partnerExpectation)->occupation }}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Other Preferences</label>
                                <textarea name="partner_other_preferences" class="form-control" rows="3">{{ optional($member->partnerExpectation)->other_preferences }}</textarea>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Upload Photos Tab -->
                <div class="tab-pane fade" id="photos" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Profile Photo</label>
                                <input type="file" name="profile_photo" class="form-control">
                                <small class="text-muted">Recommended size: 300x300 pixels</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            @if($member->image)
                                <div class="text-center">
                                    <img src="{{ asset('assets/images/user/'.$member->image) }}" class="img-thumbnail" style="max-width: 150px;">
                                    <p class="mt-2">Current Profile Photo</p>
                                </div>
                            @endif
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Additional Photos</label>
                                <input type="file" name="additional_photos[]" class="form-control" multiple>
                                <small class="text-muted">You can select multiple photos (max 5)</small>
                            </div>
                        </div>
                    </div>
                    
                    @if($member->galleries && $member->galleries->count() > 0)
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <h5>Current Gallery Photos</h5>
                                <div class="row">
                                    @foreach($member->galleries as $gallery)
                                        <div class="col-md-3 mb-3">
                                            <div class="card">
                                                <img src="{{ asset('assets/images/gallery/'.$gallery->image) }}" class="card-img-top">
                                                <div class="card-body text-center">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" name="delete_gallery[]" value="{{ $gallery->id }}" id="delete_gallery_{{ $gallery->id }}">
                                                        <label class="form-check-label" for="delete_gallery_{{ $gallery->id }}">
                                                            Delete
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
            
            <div class="mt-4 text-end">
                <a href="{{ route('admin.members.index') }}" class="btn btn--dark">Cancel</a>
                <button type="submit" class="btn btn--primary">Update Member</button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('script')
<script>
    (function($) {
        "use strict";
        
        // Tab navigation with next/prev buttons
        $('.tab-next').on('click', function() {
            var currentTab = $('.nav-tabs .active').parent();
            var nextTab = currentTab.next('li').find('a');
            if (nextTab.length > 0) {
                nextTab.tab('show');
            }
        });
        
        $('.tab-prev').on('click', function() {
            var currentTab = $('.nav-tabs .active').parent();
            var prevTab = currentTab.prev('li').find('a');
            if (prevTab.length > 0) {
                prevTab.tab('show');
            }
        });
        
    })(jQuery);
</script>
@endpush
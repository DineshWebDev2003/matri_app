@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <h4 class="mb-4">{{ $pageTitle }}</h4>
        
        <form action="{{ route('admin.members.store') }}" method="POST" enctype="multipart/form-data">
            @csrf
            
            <ul class="nav nav-tabs mb-3" id="createMemberTabs" role="tablist">
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
                                <input type="text" name="firstname" class="form-control" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Last Name <span class="text-danger">*</span></label>
                                <input type="text" name="lastname" class="form-control" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Email <span class="text-danger">*</span></label>
                                <input type="email" name="email" class="form-control" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Mobile <span class="text-danger">*</span></label>
                                <input type="text" name="mobile" class="form-control" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Password <span class="text-danger">*</span></label>
                                <input type="password" name="password" class="form-control" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Status</label>
                                <select name="status" class="form-select">
                                    <option value="{{ Status::USER_ACTIVE }}">Approved</option>
                                    <option value="{{ Status::USER_UNAPPROVED }}" selected>Unapproved</option>
                                    <option value="{{ Status::USER_BAN }}">Suspended</option>
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
                                        <input class="form-check-input" type="radio" name="gender" value="Male" id="genderMale" checked>
                                        <label class="form-check-label" for="genderMale">Male</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="gender" value="Female" id="genderFemale">
                                        <label class="form-check-label" for="genderFemale">Female</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Date of Birth</label>
                                <input type="date" name="birth_date" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Looking For <span class="text-danger">*</span></label>
                                <div class="d-flex">
                                    <div class="form-check me-3">
                                        <input class="form-check-input" type="radio" name="looking_for" value="1" id="lookingForMale" checked>
                                        <label class="form-check-label" for="lookingForMale">Bride (Female)</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="looking_for" value="2" id="lookingForFemale">
                                        <label class="form-check-label" for="lookingForFemale">Groom (Male)</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Marital Status <span class="text-danger">*</span></label>
                                <select name="marital_status" class="form-select" required>
                                    <option value="">Select Marital Status</option>
                                    <option value="Unmarried">Unmarried</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Separated">Separated</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Mother Tongue</label>
                                <input type="text" name="mother_tongue" class="form-control">
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
                                        <option value="{{ $staff->id }}">{{ $staff->name }}</option>
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
                                        <option value="{{ $franchise->id }}">{{ $franchise->name }}</option>
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
                                        <option value="{{ $package->id }}">{{ $package->name }}</option>
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
                                <input type="text" name="country" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>State</label>
                                <input type="text" name="state" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>City</label>
                                <input type="text" name="city" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Address</label>
                                <textarea name="address" class="form-control" rows="3"></textarea>
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
                                <input type="text" name="height" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Weight</label>
                                <input type="text" name="weight" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Body Type</label>
                                <select name="body_type" class="form-select">
                                    <option value="">Select Body Type</option>
                                    <option value="Slim">Slim</option>
                                    <option value="Average">Average</option>
                                    <option value="Athletic">Athletic</option>
                                    <option value="Heavy">Heavy</option>
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
                                    <option value="Fair">Fair</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Wheatish">Wheatish</option>
                                    <option value="Dark">Dark</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Blood Group</label>
                                <select name="blood_group" class="form-select">
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Physical Status</label>
                                <select name="physical_status" class="form-select">
                                    <option value="Normal">Normal</option>
                                    <option value="Physically Challenged">Physically Challenged</option>
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
                                <input type="text" name="religion" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Caste</label>
                                <input type="text" name="caste" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Education</label>
                                <input type="text" name="education" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Occupation</label>
                                <input type="text" name="occupation" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Income</label>
                                <input type="text" name="income" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Family Type</label>
                                <select name="family_type" class="form-select">
                                    <option value="">Select Family Type</option>
                                    <option value="Nuclear">Nuclear</option>
                                    <option value="Joint">Joint</option>
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
                                    <input type="number" name="partner_age_from" class="form-control me-2" placeholder="From">
                                    <input type="number" name="partner_age_to" class="form-control" placeholder="To">
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Height Preference</label>
                                <div class="d-flex">
                                    <input type="text" name="partner_height_from" class="form-control me-2" placeholder="From">
                                    <input type="text" name="partner_height_to" class="form-control" placeholder="To">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Religion Preference</label>
                                <input type="text" name="partner_religion" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Caste Preference</label>
                                <input type="text" name="partner_caste" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Education Preference</label>
                                <input type="text" name="partner_education" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Occupation Preference</label>
                                <input type="text" name="partner_occupation" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Other Preferences</label>
                                <textarea name="partner_other_preferences" class="form-control" rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Upload Photos Tab -->
                <div class="tab-pane fade" id="photos" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Profile Photo</label>
                                <input type="file" name="profile_photo" class="form-control">
                                <small class="text-muted">Recommended size: 300x300 pixels</small>
                            </div>
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
                </div>
            </div>
            
            <div class="mt-4 text-end">
                <a href="{{ route('admin.members.index') }}" class="btn btn--dark">Cancel</a>
                <button type="submit" class="btn btn--primary">Save Member</button>
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
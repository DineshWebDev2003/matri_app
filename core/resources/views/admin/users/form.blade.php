@extends('admin.layouts.app')
@section('panel')
<div class="container-fluid">
    <h4 class="mb-4">{{ isset($user) && $user->id ? 'Edit Member' : 'Add Member' }}</h4>
    <form method="POST" action="{{ isset($user) && $user->id ? route('admin.users.update', $user->id) : route('admin.users.index') }}">
        @csrf
        <ul class="nav nav-tabs mb-3" id="editMemberTabs" role="tablist">
            <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#basic">Basic Details</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#residence">Residence</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#physical">Physical Info</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#other">Other Info</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#partner">Partner Preference</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#photos">Upload Photos</a></li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane fade show active" id="basic">
                <div class="row mb-3">
                    <div class="col-md-2"><label>Gender *</label></div>
                    <div class="col-md-10">
                        <label><input type="radio" name="gender" value="Male" {{ (old('gender', $user->basicInfo->gender ?? '') == 'Male') ? 'checked' : '' }}> Male</label>
                        <label class="ms-3"><input type="radio" name="gender" value="Female" {{ (old('gender', $user->basicInfo->gender ?? '') == 'Female') ? 'checked' : '' }}> Female</label>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-2"><label>Enter First Name *</label></div>
                    <div class="col-md-10"><input type="text" name="firstname" class="form-control" value="{{ old('firstname', $user->firstname ?? '') }}" required></div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-2"><label>Enter Last Name *</label></div>
                    <div class="col-md-10"><input type="text" name="lastname" class="form-control" value="{{ old('lastname', $user->lastname ?? '') }}" required></div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-2"><label>Enter Your Email Id *</label></div>
                    <div class="col-md-10"><input type="email" name="email" class="form-control" value="{{ old('email', $user->email ?? '') }}" required></div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-2"><label>Create a Password {{ isset($user) && $user->id ? '(leave blank to keep unchanged)' : '*' }}</label></div>
                    <div class="col-md-10"><input type="password" name="password" class="form-control" {{ isset($user) && $user->id ? '' : 'required' }}></div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-2"><label>Marital Status *</label></div>
                    <div class="col-md-10">
                        <label><input type="radio" name="marital_status" value="Unmarried" {{ (old('marital_status', $user->basicInfo->marital_status ?? '') == 'Unmarried') ? 'checked' : '' }}> Unmarried</label>
                        <label class="ms-3"><input type="radio" name="marital_status" value="Widow/Widower" {{ (old('marital_status', $user->basicInfo->marital_status ?? '') == 'Widow/Widower') ? 'checked' : '' }}> Widow/Widower</label>
                        <label class="ms-3"><input type="radio" name="marital_status" value="Divorcee" {{ (old('marital_status', $user->basicInfo->marital_status ?? '') == 'Divorcee') ? 'checked' : '' }}> Divorcee</label>
                        <label class="ms-3"><input type="radio" name="marital_status" value="Separated" {{ (old('marital_status', $user->basicInfo->marital_status ?? '') == 'Separated') ? 'checked' : '' }}> Separated</label>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-2"><label>Total Children *</label></div>
                    <div class="col-md-10">
                        <select name="total_children" class="form-control">
                            <option value="">Select Total Children</option>
                            @for($i=0;$i<=10;$i++)
                                <option value="{{ $i }}" {{ (old('total_children', $user->basicInfo->total_children ?? '') == $i) ? 'selected' : '' }}>{{ $i }}</option>
                            @endfor
                        </select>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-2"><label>Status Children *</label></div>
                    <div class="col-md-10">
                        <label><input type="radio" name="status_children" value="Living with me" {{ (old('status_children', $user->basicInfo->status_children ?? '') == 'Living with me') ? 'checked' : '' }}> Living with me</label>
                        <label class="ms-3"><input type="radio" name="status_children" value="Not living with me" {{ (old('status_children', $user->basicInfo->status_children ?? '') == 'Not living with me') ? 'checked' : '' }}> Not living with me</label>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-2"><label>Mother Tongue *</label></div>
                    <div class="col-md-10"><input type="text" name="mother_tongue" class="form-control" value="{{ old('mother_tongue', $user->basicInfo->mother_tongue ?? '') }}" required></div>
                </div>
            </div>
            <div class="tab-pane fade" id="residence">
                <div class="alert alert-info">Residence tab content here...</div>
            </div>
            <div class="tab-pane fade" id="physical">
                <div class="alert alert-info">Physical Info tab content here...</div>
            </div>
            <div class="tab-pane fade" id="other">
                <div class="alert alert-info">Other Info tab content here...</div>
            </div>
            <div class="tab-pane fade" id="partner">
                <div class="alert alert-info">Partner Preference tab content here...</div>
            </div>
            <div class="tab-pane fade" id="photos">
                <div class="alert alert-info">Upload Photos tab content here...</div>
            </div>
        </div>
        <div class="mt-4">
            <button type="submit" class="btn btn--base">{{ isset($user) && $user->id ? 'Update' : 'Add' }} Member</button>
            <a href="{{ route('admin.users.index') }}" class="btn btn--dark ms-2">Cancel</a>
        </div>
    </form>
</div>
@endsection 
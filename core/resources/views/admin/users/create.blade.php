<style>
.nav-tabs {
    background: #f8f9fa;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.07);
    padding: 0.5rem 1rem 0 1rem;
    border-bottom: 2px solid #e0e0e0;
}
.nav-tabs .nav-link {
    color: #2563eb;
    font-weight: 500;
    border: none;
    border-radius: 8px 8px 0 0;
    margin-right: 8px;
    background: transparent;
    transition: background 0.2s, color 0.2s;
    padding: 0.7rem 1.5rem;
}
.nav-tabs .nav-link.active {
    color: #fff !important;
    background: #2563eb !important;
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.10);
    font-weight: 600;
}
.nav-tabs .nav-link:hover:not(.active) {
    background: #e0e7ff;
    color: #1e40af;
}
</style>
@extends('admin.layouts.app')
@section('panel')
<div class="container-fluid">
    <!-- Summary Card -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card shadow-sm p-3 mb-3" style="border-radius: 12px; background: #f8f9fa;">
                <div class="row text-center">
                    <div class="col-md-4 mb-2 mb-md-0">
                        <div class="fw-bold">Remaining Interests</div>
                        <div class="fs-5">0</div>
                    </div>
                    <div class="col-md-4 mb-2 mb-md-0">
                        <div class="fw-bold">Profile Visits</div>
                        <div class="fs-5">0</div>
                    </div>
                    <div class="col-md-4">
                        <div class="fw-bold">Images Uploaded</div>
                        <div class="fs-5">0 / N/A</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Tabbed Create Form -->
    <div class="card shadow-sm p-4" style="border-radius: 12px; background: #fff; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
        <h4 class="mb-4" style="font-weight:600; color:#232946;">Add New Member</h4>
        <ul class="nav nav-tabs mb-4" id="createUserTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="basic-tab" data-bs-toggle="tab" data-bs-target="#basic" type="button" role="tab">Basic Details</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="residence-tab" data-bs-toggle="tab" data-bs-target="#residence" type="button" role="tab">Residence Info</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="physical-tab" data-bs-toggle="tab" data-bs-target="#physical" type="button" role="tab">Physical Info</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="family-tab" data-bs-toggle="tab" data-bs-target="#family" type="button" role="tab">Family Info</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="education-tab" data-bs-toggle="tab" data-bs-target="#education" type="button" role="tab">Education Info</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="career-tab" data-bs-toggle="tab" data-bs-target="#career" type="button" role="tab">Career Info</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="partner-tab" data-bs-toggle="tab" data-bs-target="#partner" type="button" role="tab">Partner Preference</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="gallery-tab" data-bs-toggle="tab" data-bs-target="#gallery" type="button" role="tab">Gallery</button>
            </li>
        </ul>
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif
        @if($errors->any())
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <ul class="mb-0">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif
        <form method="POST" action="{{ route('admin.users.store') }}" enctype="multipart/form-data">
            @csrf
            <div class="tab-content" id="createUserTabContent">
                <!-- Basic Details Tab -->
                <div class="tab-pane fade show active" id="basic" role="tabpanel">
                    @include('admin.users.partials.edit_basic', ['user' => null, 'staffs' => $staffs])
                </div>
                <!-- Residence Info Tab -->
                <div class="tab-pane fade" id="residence" role="tabpanel">
                    @include('admin.users.partials.edit_residence', ['user' => null])
                </div>
                <!-- Physical Info Tab -->
                <div class="tab-pane fade" id="physical" role="tabpanel">
                    @include('admin.users.partials.edit_physical', ['user' => null])
                </div>
                <!-- Family Info Tab -->
                <div class="tab-pane fade" id="family" role="tabpanel">
                    @include('admin.users.partials.edit_family', ['user' => null])
                </div>
                <!-- Education Info Tab -->
                <div class="tab-pane fade" id="education" role="tabpanel">
                    @include('admin.users.partials.edit_education', ['user' => null])
                </div>
                <!-- Career Info Tab -->
                <div class="tab-pane fade" id="career" role="tabpanel">
                    @include('admin.users.partials.edit_career', ['user' => null])
                </div>
                <!-- Partner Preference Tab -->
                <div class="tab-pane fade" id="partner" role="tabpanel">
                    @include('admin.users.partials.edit_partner', ['user' => null])
                </div>
                <!-- Gallery Tab -->
                <div class="tab-pane fade" id="gallery" role="tabpanel">
                    @include('admin.users.partials.edit_gallery', ['user' => null])
                </div>
            </div>
            <div class="mt-4 text-end">
                <button type="submit" class="btn btn-primary px-4 py-2 rounded-pill">Create Member</button>
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
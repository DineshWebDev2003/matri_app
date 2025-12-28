@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <form class="row g-3 mb-4">
            <div class="col-md-3">
                <label>Gender</label>
                <select class="form-control" name="gender">
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            <div class="col-md-3">
                <label>Featured</label>
                <select class="form-control" name="featured">
                    <option value="">Any</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </div>
            <div class="col-md-3">
                <label>Keyword</label>
                <input type="text" class="form-control" name="keyword" placeholder="Name, ID, etc.">
            </div>
            <div class="col-md-3">
                <label>Registered Between</label>
                <input type="date" class="form-control mb-1" name="registered_from">
                <input type="date" class="form-control" name="registered_to">
            </div>
            <div class="col-md-2">
                <label>Age</label>
                <input type="text" class="form-control" name="age" placeholder="e.g. 25-30">
            </div>
            <div class="col-md-2">
                <label>Height</label>
                <input type="text" class="form-control" name="height" placeholder="e.g. 5'5-6'0">
            </div>
            <div class="col-md-2">
                <label>Mother Tongue</label>
                <input type="text" class="form-control" name="mother_tongue">
            </div>
            <div class="col-md-2">
                <label>Marital Status</label>
                <select class="form-control" name="marital_status">
                    <option value="">Any</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                </select>
            </div>
            <div class="col-md-2">
                <label>Religion</label>
                <input type="text" class="form-control" name="religion">
            </div>
            <div class="col-md-2">
                <label>Caste</label>
                <input type="text" class="form-control" name="caste">
            </div>
            <div class="col-md-2">
                <label>Country</label>
                <input type="text" class="form-control" name="country">
            </div>
            <div class="col-md-12 text-end">
                <button class="btn btn--base" type="submit"><i class="las la-search"></i> Search</button>
            </div>
        </form>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {{-- Results will be shown here --}}
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body text-center text-muted">
                        <i class="las la-search la-2x"></i>
                        <div>No results found. Use filters above.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 
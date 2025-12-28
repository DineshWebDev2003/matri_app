@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <div class="row mb-3 align-items-center">
            <div class="col-md-8">
                <form class="d-flex">
                    <input type="text" class="form-control me-2" placeholder="Search follow-ups...">
                    <button class="btn btn--base" type="submit"><i class="las la-search"></i></button>
                </form>
            </div>
            <div class="col-md-4 text-end">
                <select class="form-select w-auto d-inline-block">
                    <option>Sort by</option>
                    <option>Newest</option>
                    <option>Oldest</option>
                </select>
            </div>
        </div>
        <ul class="nav nav-tabs mb-3">
            <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#today">Today Follow-up</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#previous">Previous</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#next">Next</a></li>
            <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#pending">Pending</a></li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane fade show active" id="today">
                <div class="alert alert-info text-center">No Record Found</div>
            </div>
            <div class="tab-pane fade" id="previous">
                <div class="alert alert-info text-center">No Record Found</div>
            </div>
            <div class="tab-pane fade" id="next">
                <div class="alert alert-info text-center">No Record Found</div>
            </div>
            <div class="tab-pane fade" id="pending">
                <div class="alert alert-info text-center">No Record Found</div>
            </div>
        </div>
    </div>
</div>
@endsection 
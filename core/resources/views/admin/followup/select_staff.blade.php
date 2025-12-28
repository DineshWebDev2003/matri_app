@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <h5 class="mb-4">Choose Staff</h5>
        <form method="get" action="{{ route('admin.users.followup.select-staff') }}">
            <div class="row g-3">
                <div class="col-md-6">
                    <select name="staff" class="form-select" required>
                        <option value="">Select Staff</option>
                        @foreach($staffs as $s)
                            <option value="{{ $s->id }}">{{ $s->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-auto">
                    <button class="btn btn--primary">Continue</button>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection

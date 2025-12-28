@extends('admin.layouts.app')

@php
    $isEdit = isset($staff) && $staff;
@endphp

@section('panel')
    <div class="row justify-content-center">
        <div class="col-lg-8 col-md-12">
            <div class="card b-radius--10">
                <div class="card-body">
                    <form action="{{ $isEdit ? route('admin.staff.update', $staff->id) : route('admin.staff.store') }}" method="POST">
                        @csrf
                        <div class="form-group">
                            <label for="name">@lang('Name')</label>
                            <input type="text" name="name" id="name" class="form-control" value="{{ old('name', optional($staff)->name) }}" required>
                        </div>
                        <div class="form-group">
                            <label for="username">@lang('Username')</label>
                            <input type="text" name="username" id="username" class="form-control" value="{{ old('username', optional($staff)->username) }}" required>
                        </div>
                        <div class="form-group">
                            <label for="email">@lang('Email')</label>
                            <input type="email" name="email" id="email" class="form-control" value="{{ old('email', optional($staff)->email) }}" required>
                        </div>
                        <div class="form-group">
                            <label for="role_id">@lang('Role')</label>
                            @php
                                $selectedRole = old('role_id');
                                if(!$selectedRole && isset($staff) && $staff){
                                    $selectedRole = optional($staff->roles->first())->id;
                                }
                            @endphp
                            <select name="role_id" id="role_id" class="form-control" required>
                                <option value="">@lang('Select Role')</option>
                                @foreach($roles as $id => $roleName)
                                    <option value="{{ $id }}" @selected($selectedRole == $id)>{{ $roleName }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="password">@lang('Password') {{ $isEdit ? '(' . __('Leave blank to keep unchanged') . ')' : '' }}</label>
                                    <input type="password" name="password" id="password" class="form-control" {{ $isEdit ? '' : 'required' }}>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="password_confirmation">@lang('Confirm Password')</label>
                                    <input type="password" name="password_confirmation" id="password_confirmation" class="form-control" {{ $isEdit ? '' : 'required' }}>
                                </div>
                            </div>
                        </div>

                        <div class="form-group text-end">
                            <button type="submit" class="btn btn--primary">@lang('Submit')</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('breadcrumb-plugins')
    <a href="{{ route('admin.staff.index') }}" class="btn btn-sm btn-outline--primary">
        <i class="las la-arrow-left"></i> @lang('Back')
    </a>
@endpush

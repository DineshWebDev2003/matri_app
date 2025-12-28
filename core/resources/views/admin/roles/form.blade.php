@extends('admin.layouts.app')

@php
    $isEdit = isset($role);
@endphp

@section('panel')
    <div class="row justify-content-center">
        <div class="col-lg-8 col-md-12">
            <div class="card b-radius--10">
                <div class="card-body">
                    <form action="{{ $isEdit ? route('admin.roles.update', $role->id) : route('admin.roles.store') }}" method="POST">
                        @csrf
                        <div class="form-group">
                            <label for="name">@lang('Role Name')</label>
                            <input type="text" name="name" id="name" value="{{ old('name', $role->name ?? '') }}" class="form-control" required>
                        </div>

                        <div class="form-group">
                            <label>@lang('Assign Permissions')</label>
                            @php
                                $grouped = $permissions->groupBy(function($p){
                                    $parts = explode('.', $p->name);
                                    return $parts[0];
                                });
                                $current = isset($role) ? $role->permissions->pluck('name')->toArray() : [];
                            @endphp
                            <div class="accordion mb-4" id="permAccordion">
                                @foreach($grouped as $module => $perms)
                                    <div class="accordion-item mb-2">
                                        <h2 class="accordion-header" id="heading-{{ $loop->index }}">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-{{ $loop->index }}" aria-expanded="false" aria-controls="collapse-{{ $loop->index }}">
                                                {{ ucfirst(str_replace('_',' ',$module)) }}
                                            </button>
                                        </h2>
                                        <div id="collapse-{{ $loop->index }}" class="accordion-collapse collapse" aria-labelledby="heading-{{ $loop->index }}" data-bs-parent="#permAccordion">
                                            <div class="accordion-body">
                                                @php
                                                    // further group by section if permission contains 3 parts e.g users.all-members.view
                                                    $bySection = $perms->groupBy(function($p){
                                                        $parts = explode('.', $p->name);
                                                        return $parts[1] ?? 'general';
                                                    });
                                                @endphp
                                                @if($module === 'users')
                                                    @foreach($bySection as $sectionName => $sectionPerms)
                                                        <p class="fw-semibold text-uppercase mb-2 mt-3">{{ str_replace(['-','_'],' ', $sectionName) }}</p>
                                                        <div class="row mb-2">
                                                            @foreach($sectionPerms as $perm)
                                                                <div class="col-md-4 mb-1">
                                                                    <label class="form-check-label d-flex align-items-center">
                                                                        <input type="checkbox" name="permissions[]" value="{{ $perm->name }}" class="form-check-input me-2" @checked(in_array($perm->name, $current))>
                                                                        @php
                                                                            $action = \Illuminate\Support\Str::afterLast($perm->name, '.');
                                                                        @endphp
                                                                        <span class="text-capitalize">{{ $action }}</span>
                                                                    </label>
                                                                </div>
                                                            @endforeach
                                                        </div>
                                                    @endforeach
                                                @else
                                                    <div class="row">
                                                        @foreach($perms as $perm)
                                                            <div class="col-sm-6 mb-2">
                                                                <label class="form-check-label d-flex align-items-center">
                                                                    <input type="checkbox" name="permissions[]" value="{{ $perm->name }}" class="form-check-input me-2" @checked(in_array($perm->name, $current))>
                                                                    @php
                                                                        $label = \Illuminate\Support\Str::of($perm->name)->after($module)->ltrim('. ')->replace('_',' ')->title();
                                                                    @endphp
                                                                    <span>{{ $label }}</span>
                                                                </label>
                                                            </div>
                                                        @endforeach
                                                    </div>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                @endforeach

                            </div>

                            <div class="form-group text-end">
                                <button type="submit" class="btn btn--primary">@lang('Submit')</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('breadcrumb-plugins')
    <a href="{{ route('admin.roles.index') }}" class="btn btn-sm btn-outline--primary">
        <i class="las la-arrow-left"></i> @lang('Back')
    </a>
@endpush

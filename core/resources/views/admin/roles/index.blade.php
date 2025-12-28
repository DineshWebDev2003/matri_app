@extends('admin.layouts.app')

@section('panel')
    <div class="row">
        <div class="col-lg-12">
            <div class="card b-radius--10">
                <div class="card-body p-0">
                    

                    @forelse($roles as $role)
                        <div class="d-flex justify-content-between align-items-center border rounded p-3 mb-2">
                            <div>
                                <div class="fw-bold">{{ __($role->name) }}</div>
                            </div>
                            <div>
                                @if($role->name === 'Super Admin')
                                    <span class="text-muted">Admin permissions can not be changed</span>
                                @else
                                    <a href="{{ route('admin.roles.edit', $role->id) }}" class="btn btn-outline--primary btn-sm">
                                        <i class="las la-key me-1"></i> Permissions
                                    </a>
                                @endif
                            </div>
                        </div>
                    @empty
                        <div class="text-center text-muted">No roles found</div>
                    @endforelse

                </div>
            </div>
        </div>
    </div>

    <x-confirmation-modal />
@endsection

@push('breadcrumb-plugins')
    <a href="{{ route('admin.roles.create') }}" class="btn btn--primary btn-sm"><i class="las la-users me-1"></i> Manage Role</a>
@endpush

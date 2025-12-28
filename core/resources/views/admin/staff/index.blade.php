@extends('admin.layouts.app')

@section('panel')
    <div class="row">
        <div class="col-lg-12">
            <div class="card b-radius--10">
                <div class="card-body p-0">
                    <div class="table-responsive--md table-responsive">
                        <table class="table table--light">
                            <thead>
                                <tr>
                                    <th>@lang('S.N.')</th>
                                    <th>@lang('Name')</th>
                                    <th>@lang('Username')</th>
                                    <th>@lang('Email')</th>
                                    <th>@lang('Role')</th>
                                    <th>@lang('Action')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($staff as $user)
                                    <tr>
                                        <td>{{ $loop->index + 1 }}</td>
                                        <td>{{ $user->name }}</td>
                                        <td>{{ $user->username }}</td>
                                        <td>{{ $user->email }}</td>
                                        <td>
                                            @foreach($user->roles as $role)
                                                <span class="badge badge--primary">{{ $role->name }}</span>
                                            @endforeach
                                        </td>
                                        <td>
                                            <div class="d-flex flex-wrap justify-content-end gap-1">
                                                <a href="{{ route('admin.staff.edit', $user->id) }}" class="btn btn-outline--primary btn-sm">
                                                    <i class="las la-edit"></i> @lang('Edit')
                                                </a>
                                                @if(!$user->hasRole('Super Admin'))
                                                    <button type="button" class="btn btn-outline--danger btn-sm confirmationBtn"
                                                        data-question="@lang('Are you sure to delete this staff account?')"
                                                        data-action="{{ route('admin.staff.delete', $user->id) }}">
                                                        <i class="las la-trash"></i> @lang('Delete')
                                                    </button>
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td class="text-center text-muted" colspan="100%">@lang('No staff found')</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
                @if($staff->hasPages())
                    <div class="card-footer">
                        {{ paginateLinks($staff) }}
                    </div>
                @endif
            </div>
        </div>
    </div>

    <x-confirmation-modal />
@endsection

@push('breadcrumb-plugins')
    <a href="{{ route('admin.staff.create') }}" class="btn btn-sm btn-outline--primary">
        <i class="las la-plus"></i> @lang('Add New')
    </a>
@endpush

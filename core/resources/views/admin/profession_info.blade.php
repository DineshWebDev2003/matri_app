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
                                    <th>@lang('Action')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($professions as $profession)
                                    <tr>
                                        <td>{{ $loop->index + 1 }}</td>
                                        <td><span class="fw-bold">{{ __($profession->name) }}</span></td>
                                        <td>
                                            <div class="d-flex flex-wrap gap-1">
                                                <button class="btn btn-outline--primary btn-sm cuModalBtn"
                                                    data-modal_title="@lang('Update Profession')"
                                                    data-resource="{{ $profession }}" type="button">
                                                    <i class="las la-pen"></i>@lang('Edit')
                                                </button>
                                                <button class="btn btn-outline--danger btn-sm confirmationBtn"
                                                    data-action="{{ route('admin.profession.delete', $profession->id) }}"
                                                    data-question="@lang('Are you sure, you want to delete this profession?')"
                                                    type="button">
                                                    <i class="las la-trash-alt"></i>@lang('Delete')
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td class="text-muted text-center" colspan="100%">{{ __($emptyMessage) }}</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {{ $professions->links() }}
        </div>
    </div>

    <x-confirmation-modal />

    {{-- CRUD Modal --}}
    <div class="modal fade" id="cuModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                        <i class="las la-times"></i>
                    </button>
                </div>
                <form action="{{ route('admin.profession.save') }}" method="POST">
                    @csrf
                    <div class="modal-body">
                        <div class="form-group">
                            <label>@lang('Name')</label>
                            <input type="text" class="form-control" name="name" placeholder="@lang('Enter name')" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn--primary w-100 h-45">@lang('Submit')</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@push('breadcrumb-plugins')
    <button type="button" class="btn btn-sm btn-outline--primary cuModalBtn" data-modal_title="@lang('Add Profession')">
        <i class="las la-plus"></i> @lang('Add New')
    </button>
@endpush

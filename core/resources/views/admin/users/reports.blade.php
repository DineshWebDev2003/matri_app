@extends('admin.layouts.app')

@section('panel')
    <div class="row">

        <div class="col-lg-12">
            <div class="card b-radius--10">
                <div class="card-body p-0">

                    <div class="table-responsive--sm table-responsive">
                        <table class="table--light style--two table">
                            <thead>
                                <tr>
                                    <th>@lang('S.N')</th>
                                    <th>@lang('Reporter')</th>
                                    <th>@lang('Title')</th>
                                    <th>@lang('Details')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($reports as $report)
                                    <tr>
                                        <td>
                                            <span class="fw-bold">{{ $reports->firstItem() + $loop->index }}</span>
                                        </td>

                                        <td>
                                            <span class="fw-bold">{{ @$report->reporter->fullname }}</span>
                                            <br>
                                            <span class="small"> <a href="{{ route('admin.users.detail', $report->user_id) }}"><span>@</span>{{ @$report->reporter->username }}</a> </span>
                                        </td>

                                        <td>
                                            <span class="fw-bold">
                                                {{ __($report->title) }}
                                            </span>
                                        </td>

                                        <td>{{ __($report->reason) }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td class="text-muted text-center" colspan="100%">{{ __($emptyMessage) }}</td>
                                    </tr>
                                @endforelse

                            </tbody>
                        </table><!-- table end -->
                    </div>
                </div>
                @if ($reports->hasPages())
                    <div class="card-footer py-4">
                        {{ paginateLinks($reports) }}
                    </div>
                @endif
            </div><!-- card end -->
        </div>
    </div>
@endsection

@push('breadcrumb-plugins')
    <a class="btn btn-outline--primary btn-sm" href="{{ route('admin.users.detail', $reports->first()->complaint_id) }}"><i class="las la-undo"></i>@lang('Back')</a>
@endpush

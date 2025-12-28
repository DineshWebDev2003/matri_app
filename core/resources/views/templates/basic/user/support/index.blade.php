@extends($activeTemplate . 'layouts.master')
@section('content')
    <div class="row justify-content-center mt-4">
        <div class="col-md-12">
            <div class="table-responsive--md">
                <table class="custom--table table">
                    <thead>
                        <tr>
                            <th>@lang('Subject')</th>
                            <th>@lang('Status')</th>
                            <th>@lang('Priority')</th>
                            <th>@lang('Last Reply')</th>
                            <th>@lang('Action')</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($supports as $support)
                            <tr>
                                <td> <a class="fw-bold" href="{{ route('ticket.view', $support->ticket) }}"> [@lang('Ticket')#{{ $support->ticket }}] {{ __($support->subject) }} </a></td>
                                <td>
                                    @php echo $support->statusBadge; @endphp
                                </td>
                                <td>
                                    @if ($support->priority == Status::PRIORITY_LOW)
                                        <span class="badge badge--dark">@lang('Low')</span>
                                    @elseif($support->priority == Status::PRIORITY_MEDIUM)
                                        <span class="badge badge--success">@lang('Medium')</span>
                                    @elseif($support->priority == Status::PRIORITY_HIGH)
                                        <span class="badge badge--primary">@lang('High')</span>
                                    @endif
                                </td>
                                <td>{{ diffForHumans($support->last_reply) }} </td>

                                <td>
                                    <a class="icon-anchor btn--danger" data-bs-toggle="tooltip" href="{{ route('ticket.view', $support->ticket) }}" title="@lang('View')"><i class="las la-desktop"></i></a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td class="text-center" colspan="100%">{{ __($emptyMessage) }}</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            {{ paginateLinks($supports) }}

        </div>
    </div>
@endsection
@push('breadcrumb-plugins')
    <a class="btn btn-sm btn--base mb-2" href="{{ route('ticket.open') }}"> <i class="fa fa-plus"></i> @lang('New Ticket')</a>
@endpush

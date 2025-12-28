@extends($activeTemplate . 'layouts.' . $layout)

@section('content')
    @if ($layout == 'frontend')
        <div class="section">
            <div class="container">
    @endif
    <div class="row justify-content-center">
        <div class="col-md-12">
            <div class="card custom--card">
                <div class="card-header card-header-bg d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 mt-0">
                        @php echo $myTicket->statusBadge; @endphp
                        <span class="ticket-title">[@lang('Ticket')#{{ $myTicket->ticket }}] {{ $myTicket->subject }}</span>
                    </h6>
                    @if ($myTicket->status != 3 && $myTicket->user)
                        <button class="btn btn-danger close-button btn-sm confirmationBtn" data-action="{{ route('ticket.close', $myTicket->id) }}" data-question="@lang('Are you sure to close this ticket?')" type="button"><i class="fa fa-lg fa-times-circle"></i>
                        </button>
                    @endif
                </div>
                <div class="card-body">
                    <form action="{{ route('ticket.reply', $myTicket->id) }}" enctype="multipart/form-data" method="post">
                        @csrf
                        <div class="row gy-3">
                            <div class="col-12 form-group">
                                <div class="input--group">
                                    <textarea class="form-control form--control" name="message">{{ old('message') }}</textarea>
                                    <label class="form--label">@lang('Message')</label>
                                </div>
                            </div>
                            <div class="form-group col-12">
                                <div class="text-end">
                                    <a class="btn btn--base btn-sm addFile" href="javascript:void(0)"><i class="fa fa-plus"></i> @lang('Add New')</a>
                                </div>
                                <div class="attachment-label"><label class="form-label text--dark">@lang('Attachments')</label> <small class="text-danger">@lang('Max 5 files can be uploaded'). @lang('Maximum upload size is') {{ ini_get('upload_max_filesize') }}</small></div>
                                <input class="form-control form--control" name="attachments[]" type="file" />
                                <div id="fileUploadsContainer"></div>
                                <small class="ticket-attachments-message text-muted my-2">
                                    @lang('Allowed File Extensions'): .@lang('jpg'), .@lang('jpeg'), .@lang('png'), .@lang('pdf'), .@lang('doc'), .@lang('docx')
                                </small>
                            </div>
                            <div class="form-group col-12">
                                <button class="btn btn--base w-100" type="submit"> <i class="fa fa-reply"></i> @lang('Reply')</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-body">
                    @foreach ($messages as $message)
                        @if ($message->admin_id == 0)
                            <div class="row border-base border-radius-3 my-3 mx-2 border py-3">
                                <div class="col-md-3 border-end text-md-end">
                                    <h5 class="my-1">{{ $message->ticket->name }}</h5>
                                </div>
                                <div class="col-md-9">
                                    <p class="text-muted fw-bold my-1">
                                        @lang('Posted on') {{ $message->created_at->format('l, dS F Y @ H:i') }}</p>
                                    <p>{{ $message->message }}</p>
                                    @if ($message->attachments->count() > 0)
                                        <div class="mt-2">
                                            @foreach ($message->attachments as $k => $image)
                                                <a class="mr-3" href="{{ route('ticket.download', encrypt($image->id)) }}"><i class="fa fa-file"></i> @lang('Attachment') {{ ++$k }} </a>
                                            @endforeach
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @else
                            <div class="row border-warning border-radius-3 my-3 mx-2 border py-3" style="background-color: #ffd96729">
                                <div class="col-md-3 border-end text-md-end">
                                    <h5 class="my-1">{{ $message->admin->name }}</h5>
                                    <p class="lead text-muted">@lang('Staff')</p>
                                </div>
                                <div class="col-md-9">
                                    <p class="text-muted fw-bold my-1">
                                        @lang('Posted on') {{ $message->created_at->format('l, dS F Y @ H:i') }}</p>
                                    <p>{{ $message->message }}</p>
                                    @if ($message->attachments->count() > 0)
                                        <div class="mt-2">
                                            @foreach ($message->attachments as $k => $image)
                                                <a class="mr-3" href="{{ route('ticket.download', encrypt($image->id)) }}"><i class="fa fa-file"></i> @lang('Attachment') {{ ++$k }} </a>
                                            @endforeach
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @endif
                    @endforeach
                </div>
            </div>

        </div>
    </div>

    @if ($layout == 'frontend')
        </div>
        </div>
    @endif

    <x-confirmation-modal />
@endsection
@push('breadcrumb-plugins')
    <a class="btn btn-sm btn--base mb-2" href="{{ route('ticket.index') }}"> <i class="las la-ticket-alt"></i> @lang('My Tickets')</a>
@endpush
@push('style')
    <style>
        .input-group-text:focus {
            box-shadow: none !important;
        }

        .ticket-title {
            line-height: 1.5;
        }

        @media (max-width: 767px) {
            .attachment-label {
                padding: 10px 0px;
                line-height: 1.5;
            }

            .attachment-label label {
                margin-bottom: 0 !important;
            }

            .ticket-title {
                margin-top: 10px;
                font-size: 14px;
                display: block;
            }
        }
    </style>
@endpush
@push('script')
    <script>
        (function($) {
            "use strict";
            var fileAdded = 0;
            $('.addFile').on('click', function() {
                if (fileAdded >= 4) {
                    notify('error', 'You\'ve added maximum number of file');
                    return false;
                }
                fileAdded++;
                $("#fileUploadsContainer").append(`
                    <div class="input-group my-3">
                        <input type="file" name="attachments[]" class="form-control form--control" required />
                        <button class="input-group-text btn-danger remove-btn"><i class="las la-times"></i></button>
                    </div>
                `)
            });
            $(document).on('click', '.remove-btn', function() {
                fileAdded--;
                $(this).closest('.input-group').remove();
            });
        })(jQuery);
    </script>
@endpush

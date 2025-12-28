@extends($activeTemplate . 'layouts.master')
@section('content')
    <div class="row justify-content-center">
        <div class="col-md-12">
            <div class="card custom--card">

                <div class="card-body">
                    <form action="{{ route('ticket.store') }}" method="post" enctype="multipart/form-data">
                        @csrf
                        <div class="row gy-4">
                            <input name="name" type="hidden" value="{{ @$user->firstname . ' ' . @$user->lastname }}">
                            <input name="email" type="hidden" value="{{ @$user->email }}">

                            <div class="form-group col-md-6">
                                <div class="input--group">
                                    <input class="form-control form--control" id="subject" name="subject" type="text" value="{{ old('subject') }}" autocomplete="off" placeholder="none" required>
                                    <label class="form--label" for="subject">@lang('Subject')</label>
                                </div>
                            </div>
                            <div class="form-group col-md-6">
                                <div class="input--group">
                                    <select class="form-select form--control form-control" id="priority" name="priority" required>
                                        <option value="3">@lang('High')</option>
                                        <option value="2">@lang('Medium')</option>
                                        <option value="1">@lang('Low')</option>
                                    </select>
                                    <label class="form--label" for="priority">@lang('Priority')</label>
                                </div>
                            </div>
                            <div class="col-12 form-group">
                                <div class="input--group">
                                    <textarea class="form-control form--control" name="message">{{ old('message') }}</textarea>
                                    <label class="form--label">@lang('Message')</label>
                                </div>
                            </div>
                            <div class="form-group col-12">
                                <div class="text-end">
                                    <button class="btn btn--base btn-sm addFile" type="button">
                                        <i class="fa fa-plus"></i> @lang('Add New')
                                    </button>
                                </div>
                                <div class="file-upload">
                                    <div class="attachment-label"><label class="form-label text--dark">@lang('Attachments')</label> <small class="text-danger">@lang('Max 5 files can be uploaded'). @lang('Maximum upload size is') {{ ini_get('upload_max_filesize') }}</small></div>
                                    <input class="form-control form--control mb-2" id="inputAttachments" name="attachments[]" type="file" />
                                    <div id="fileUploadsContainer"></div>
                                    <small class="ticket-attachments-message text-muted">
                                        @lang('Allowed File Extensions'): .@lang('jpg'), .@lang('jpeg'), .@lang('png'), .@lang('pdf'), .@lang('doc'), .@lang('docx')
                                    </small>
                                </div>
                            </div>
                            <div class="col-12 form-group">
                                <button class="btn btn--base w-100" type="submit"><i class="fa fa-paper-plane"></i>&nbsp;@lang('Submit')</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('breadcrumb-plugins')
    <a class="btn btn-sm btn--base mb-2" href="{{ route('ticket.index') }}"> <i class="las la-ticket-alt"></i> @lang('My Tickets')</a>
@endpush

@push('style')
    <style>
        .input-group-text:focus {
            box-shadow: none !important;
        }

        @media (max-width: 767px) {
            .attachment-label {
                padding: 10px 0px;
                line-height: 1.5;
            }

            .attachment-label label {
                margin-bottom: 0 !important;
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

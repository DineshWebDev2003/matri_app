@extends('admin.layouts.app')
@section('panel')
    <div class="row">
        <div class="col-md-12">
            <div class="card overflow-hidden">
                <div class="card-body p-0">
                    <div class="table-responsive table-responsive--sm">
                        <table class="table align-items-center table--light">
                            <thead>
                                <tr>
                                    <th>@lang('Short Code')</th>
                                    <th>@lang('Description')</th>
                                </tr>
                            </thead>
                            <tbody class="list">
                                @forelse($template->shortcodes as $shortcode => $key)
                                    <tr>
                                        <th><span class="short-codes">@php echo "{{ ". $shortcode ." }}"  @endphp</span></th>
                                        <td>{{ __($key) }}</td>
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
            </div><!-- card end -->

            <h6 class="mt-4 mb-2">@lang('Global Short Codes')</h6>
            <div class="card overflow-hidden">
                <div class="card-body p-0">
                    <div class="table-responsive table-responsive--sm">
                        <table class=" table align-items-center table--light">
                            <thead>
                                <tr>
                                    <th>@lang('Short Code') </th>
                                    <th>@lang('Description')</th>
                                </tr>
                            </thead>
                            <tbody class="list">
                                @foreach ($general->global_shortcodes as $shortCode => $codeDetails)
                                    <tr>
                                        <td><span class="short-codes">@{{ @php echo $shortCode @endphp }}</span></td>
                                        <td>{{ __($codeDetails) }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <form action="{{ route('admin.setting.notification.template.update', $template->id) }}" method="post">
        @csrf
        <div class="row">
            <div class="col-md-6">
                <div class="card mt-4">
                    <div class="card-header bg--primary">
                        <h5 class="card-title text-white">@lang('Email Template')</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="form-group">
                                    <label>@lang('Subject')</label>
                                    <input class="form-control form-control-lg" name="subject" placeholder="@lang('Email subject')" required type="text" value="{{ $template->subj }}" />
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label>@lang('Status') <span class="text-danger">*</span></label>
                                    <input @if ($template->email_status) checked @endif data-bs-toggle="toggle" data-height="46px" data-off="@lang("Don't Send")" data-offstyle="-danger" data-on="@lang('Send Email')" data-onstyle="-success" data-width="100%" name="email_status" type="checkbox">
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label>@lang('Message') <span class="text-danger">*</span></label>
                                    <textarea class="form-control nicEdit" name="email_body" placeholder="@lang('Your message using short-codes')" rows="10">{{ $template->email_body }}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card mt-4">
                    <div class="card-header bg--primary">
                        <h5 class="card-title text-white">@lang('SMS Template')</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label>@lang('Status') <span class="text-danger">*</span></label>
                                    <input @if ($template->sms_status) checked @endif data-bs-toggle="toggle" data-height="46px" data-off="@lang("Don't Send")" data-offstyle="-danger" data-on="@lang('Send SMS')" data-onstyle="-success" data-width="100%" name="sms_status" type="checkbox">
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label>@lang('Message')</label>
                                    <textarea class="form-control" name="sms_body" placeholder="@lang('Your message using short-codes')" required rows="10">{{ $template->sms_body }}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="btn btn--primary w-100 h-45 mt-4" type="submit">@lang('Submit')</button>
    </form>
@endsection

@push('breadcrumb-plugins')
    <x-back route="{{ route('admin.setting.notification.templates') }}" />
@endpush

@php
$customCaptcha = loadCustomCaptcha();
$googleCaptcha = loadReCaptcha();
$prefix        = Request::route()->getPrefix();
@endphp
@if ($googleCaptcha)
    @if ($prefix == '/admin')
        <div class="mb-3">
            @php echo $googleCaptcha @endphp
        </div>
    @else
        <div class="mt-4">
            @php echo $googleCaptcha @endphp
        </div>
    @endif

@endif
@if ($customCaptcha)
    @if ($prefix == '/admin')
        <div class="form-group">
            <div class="mb-2">
                @php echo $customCaptcha @endphp
            </div>
            <label class="form-label">@lang('Captcha')</label>
            <input type="text" name="captcha" class="form-control form--control" required>
        </div>
    @else
        <div class="col-sm-12 mt-4">
            @php echo $customCaptcha @endphp
        </div>
        <div class="col-sm-12 mt-4">
            <div class="input--group">
                <input name="captcha" type="text" id="captcha" class="form-control form--control" required>
                <label class="form--label" for="captcha">@lang('Captcha')</label>
            </div>
        </div>
    @endif
@endif
@if ($googleCaptcha)
    @push('script')
        <script>
            (function($) {
                "use strict"
                $('.verify-gcaptcha').on('submit', function() {
                    var response = grecaptcha.getResponse();
                    if (response.length == 0) {
                        document.getElementById('g-recaptcha-error').innerHTML =
                            '<span class="text-danger">@lang('Captcha field is required.')</span>';
                        return false;
                    }
                    return true;
                });
            })(jQuery);
        </script>
    @endpush
@endif

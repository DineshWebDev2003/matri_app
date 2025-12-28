@extends($activeTemplate . 'layouts.frontend')
@section('content')
    <div class="login section">
        <div class="container">
            <div class="row gy-5 justify-content-center">
                <div class="col-md-6">
                    <div class="d-flex justify-content-center">
                        <div class="verification-code-wrapper login__wrapper">
                            <div class="verification-area">
                                <div class="section__head pb-3 text-center">
                                    <h5 class="login-title pb-3 text-center">@lang('Verify Mobile Number')</h5>
                                    <p class="t-short-para mx-auto mb-0 text-center">@lang('A 6 digit verification code sent to your mobile number') : +{{ showMobileNumber(auth()->user()->mobile) }}</p>
                                </div>
                                <form class="submit-form" action="{{ route('user.verify.mobile') }}" method="POST">
                                    @csrf
                                    @include($activeTemplate . 'partials.verification_code')
                                    <div class="mb-3">
                                        <button class="btn btn--base w-100 mt-3" type="submit">@lang('Submit')</button>
                                    </div>
                                    <div class="form-group">
                                        <p>
                                            @lang('If you don\'t get any code'), <a class="forget-pass" href="{{ route('user.send.verify.code', 'phone') }}"> @lang('Try again')</a>
                                        </p>
                                        @if ($errors->has('resend'))
                                            <br />
                                            <small class="text-danger">{{ $errors->first('resend') }}</small>
                                        @endif
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

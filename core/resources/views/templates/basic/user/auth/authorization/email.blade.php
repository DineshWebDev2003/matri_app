@php
    $content = getContent('email_verify.content', true);
@endphp
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
                                    <h2 class="login-title mt-0">{{ __(@$content->data_values->heading) }}</h2>
                                    <p class="t-short-para mx-auto mb-0 text-center">
                                        {{ __(@$content->data_values->subheading) }}:
                                        {{ showEmailAddress(auth()->user()->email) }}
                                    </p>
                                </div>
                                <form class="submit-form" action="{{ route('user.verify.email') }}" method="POST">
                                    @csrf
                                    @include($activeTemplate . 'partials.verification_code')

                                    <button class="btn btn--base w-100 mt-3" type="submit">@lang('Submit')</button>

                                    <div class="input--group email-verify mt-3">
                                        @lang('If you don\'t get any code'),
                                        <a href="{{ route('user.send.verify.code', 'email') }}"> @lang('Try again')</a>
                                        @if ($errors->has('resend'))
                                            <small class="text-danger d-block">{{ $errors->first('resend') }}</small>
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

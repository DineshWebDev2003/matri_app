@php
    $content = getContent('code_verify.content', true);
@endphp
@extends($activeTemplate . 'layouts.frontend')
@section('content')
    <div class="login section">
        <div class="container">
            <div class="d-flex justify-content-center">
                <div class="verification-code-wrapper login__wrapper">
                    <div class="verification-area">
                        <div class="section__head text-center">
                            <h2 class="login-title mt-0">{{ __(@$content->data_values->heading) }}</h2>
                            <p class="t-short-para mx-auto mb-0 text-center">
                                {{ __(@$content->data_values->subheading) }}
                            </p>
                        </div>
                        <form class="submit-form" action="{{ route('user.password.verify.code') }}" method="POST">
                            @csrf
                            <input name="email" type="hidden" value="{{ $email }}">

                            @include($activeTemplate . 'partials.verification_code')

                            <button class="btn btn--base w-100 mt-2" type="submit">@lang('Submit')</button>

                            <div class="input--group mt-3">
                                @lang('Please check including your Junk/Spam Folder. if not found, you can')
                                <a class="text--base" href="{{ route('user.password.request') }}">@lang('Try to send again')</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@extends($activeTemplate . 'layouts.master')

@section('content')
    <div class="col-md-10">
        <div class="card custom--card">
            <div class="card-body">
                <form action="" method="post">
                    @csrf
                    <div class="row gy-4">
                        <div class="col-md-12">
                            <div class="input--group">
                                <input autocomplete="current-password" class="form-control form--control" name="current_password" required type="password">
                                <label class="form--label">@lang('Current Password')</label>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="input--group">
                                <input autocomplete="current-password" class="form-control form--control" name="password" required type="password">
                                <label class="form--label">@lang('Password')</label>
                                @if ($general->secure_password)
                                    <div class="input-popup">
                                        <p class="error lower">@lang('1 small letter minimum')</p>
                                        <p class="error capital">@lang('1 capital letter minimum')</p>
                                        <p class="error number">@lang('1 number minimum')</p>
                                        <p class="error special">@lang('1 special character minimum')</p>
                                        <p class="error minimum">@lang('6 character password')</p>
                                    </div>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="input--group">
                                <input autocomplete="current-password" class="form-control form--control" name="password_confirmation" required type="password">
                                <label class="form--label">@lang('Confirm Password')</label>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <button class="btn btn--base w-100 mt-0" type="submit">@lang('Submit')</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
@if ($general->secure_password)
    @push('script-lib')
        <script src="{{ asset('assets/global/js/secure_password.js') }}"></script>
    @endpush
@endif

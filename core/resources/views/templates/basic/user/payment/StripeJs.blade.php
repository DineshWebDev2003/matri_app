@extends($activeTemplate . 'layouts.master')
@section('content')
    <div class="col-md-10">
        <div class="card custom--card">
            <h5 class="card-header mt-0">@lang('Stripe Storefront')</h5>
            <div class="card-body">
                <form action="{{ $data->url }}" method="{{ $data->method }}">
                    <ul class="list-group text-center">
                        <li class="list-group-item d-flex justify-content-between">
                            @lang('You have to pay '):
                            <strong>{{ showAmount($deposit->final_amo) }} {{ __($deposit->method_currency) }}</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            @lang('You will get '):
                            <strong>{{ showAmount($deposit->amount) }} {{ __($general->cur_text) }}</strong>
                        </li>
                    </ul>
                    <script src="{{ $data->src }}"
                        class="stripe-button"
                        @foreach ($data->val as $key => $value)
                    data-{{ $key }}="{{ $value }}" @endforeach></script>
                </form>
            </div>
        </div>
    </div>
@endsection

@push('style')
    <style>
        .list-group-item {
            color: unset;
            font-size: 14px;
        }
    </style>
@endpush

@push('script-lib')
    <script src="https://js.stripe.com/v3/"></script>
@endpush
@push('name')
    <script>
        (function($) {
            "use strict";
            $('button[type="submit"]').addClass("btn btn--base w-100 mt-4").removeClass('stripe-button-el');
            $('button[type="submit"]').find('span').css('min-height', 'auto');
        })(jQuery);
    </script>
@endpush

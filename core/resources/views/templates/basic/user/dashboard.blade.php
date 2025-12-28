@extends($activeTemplate . 'layouts.master')
@section('content')
    @php
        $kycInstruction = getContent('kyc_instruction.content', true);
    @endphp
    @if (auth()->user()->kv == 0)
        <div class="alert alert-info" role="alert">
            <h6 class="alert-heading my-0">@lang('KYC Verification required')</h6>
            <hr class="my-2">
            <p class="mb-0"> {{ __($kycInstruction->data_values->verification_instruction) }} <a class="text--base" href="{{ route('user.kyc.form') }}">@lang('Click Here to Verify')</a></p>
        </div>
    @elseif(auth()->user()->kv == 2)
        <div class="alert alert-warning" role="alert">
            <h6 class="alert-heading my-0">@lang('KYC Verification pending')</h6>
            <hr class="my-2">
            <p class="mb-0"> {{ __($kycInstruction->data_values->pending_instruction) }} <a class="text--base" href="{{ route('user.kyc.data') }}">@lang('See KYC Data')</a></p>
        </div>
    @endif
    <!-- Dashboard  -->
    <div class="row gy-4 justify-content-center">
        <div class="dashboard-wrapper col-xxl-4 col-md-6">
            <div class="dashboard-card d-flex align-items-center flex-wrap">
                <div class="dashboard-card__icon">
                    <i class="far fa-heart"></i>
                </div>
                <div class="dashboard-card__content text-start">
                    <h4 class="dashboard-card__title d-block mt-0">{{ userLimitation()['interest_express_limit'] }}</h5>
                        <span class="dashboard-card__desc">@lang('Remaining Interests')</span>
                </div>
            </div>
        </div>
        <div class="dashboard-wrapper col-xxl-4 col-md-6">
            <div class="dashboard-card d-flex align-items-center flex-wrap">
                <div class="dashboard-card__icon">
                    <i class="fas fa-phone"></i>
                </div>
                <div class="dashboard-card__content text-start">
                    <h4 class="dashboard-card__title d-block mt-0">{{ userLimitation()['contact_view_limit'] }}</h5>
                        <span class="dashboard-card__desc">@lang('Remaining Contact View')</span>
                </div>
            </div>
        </div>
        <div class="dashboard-wrapper col-xxl-4 col-md-6">
            <div class="dashboard-card d-flex align-items-center flex-wrap">
                <div class="dashboard-card__icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div class="dashboard-card__content text-start">
                    <h4 class="dashboard-card__title d-block mt-0">{{ $user->limitation->image_upload_limit == -1 ? trans('Unlimited') : ($user->limitation->image_upload_limit - $user->total_images > 0 ? $user->limitation->image_upload_limit - $user->total_images : 0) }}</h5>
                        <span class="dashboard-card__desc">@lang('Remaining Image Upload')</span>
                </div>
            </div>
        </div>
        <div class="dashboard-wrapper col-xxl-4 col-md-6">
            <div class="dashboard-card d-flex align-items-center flex-wrap">
                <div class="dashboard-card__icon">
                    <i class="fas fa-list"></i>
                </div>
                <div class="dashboard-card__content text-start">
                    <h4 class="dashboard-card__title d-block mt-0">{{ $user->totalShortlisted }}</h5>
                        <span class="dashboard-card__desc">@lang('Total Shortlisted')</span>
                </div>
            </div>
        </div>
        <div class="dashboard-wrapper col-xxl-4 col-md-6">
            <div class="dashboard-card d-flex align-items-center flex-wrap">
                <div class="dashboard-card__icon">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <div class="dashboard-card__content text-start">
                    <h4 class="dashboard-card__title d-block mt-0">{{ $user->interestSent }}</h5>
                        <span class="dashboard-card__desc">@lang('Interest Sent')</span>
                </div>
            </div>
        </div>
        <div class="dashboard-wrapper col-xxl-4 col-md-6">
            <div class="dashboard-card d-flex align-items-center flex-wrap">
                <div class="dashboard-card__icon">
                    <i class="fas fa-heart"></i>
                </div>
                <div class="dashboard-card__content text-start">
                    <h4 class="dashboard-card__title d-block mt-0">{{ $user->totalInterestRequests }}</h5>
                        <span class="dashboard-card__desc">@lang('Interest Requests')</span>
                </div>
            </div>
        </div>

        <div class="col-md-12">
            <div class="card custom--card package--card">
                <h5 class="card-header mt-0">@lang('Current Package')</h5>
                <div class="card-body">
                    <div class="row">
                        <h5>{{ __($user->limitation->package_id ? $user->limitation->package->name : 'Global Package') }}</h5>
                        <div class="package-options d-flex flex-wrap">
                            <i class="las la-check mt-1"></i>
                            <span class="ps-2">
                                @if ($user->limitation->interest_express_limit != -1)
                                    {{ $user->limitation->interest_express_limit }}
                                @else
                                    @lang('Unlimited ')
                                @endif
                                @lang('Express Interests')
                            </span>
                        </div>
                        <div class="package-options d-flex mt-1 flex-wrap">
                            <i class="las la-check mt-1"></i>
                            <span class="ps-2">
                                {{ $user->limitation->contact_view_limit == -1 ? 'Unlimited ' : $user->limitation->contact_view_limit }}
                                @lang('Contact View')
                            </span>
                        </div>

                        <div class="package-options d-flex mt-1 flex-wrap">
                            <i class="las la-check mt-1"></i>
                            <span class="ps-2">
                                {{ $user->limitation->image_upload_limit == -1 ? 'Unlimited ' : $user->limitation->image_upload_limit }}
                                @lang('Image Upload')
                            </span>
                        </div>
                        <div class="mt-3">
                            <div>
                                @php
                                    $expiry = $user->limitation->expired_at ?? $user->limitation->expire_date;
                                @endphp
                                @if ($expiry && checkValidityPeriod($user->limitation))
                                    @lang('Package expiry date') : {{ showDateTime($expiry, 'd M, Y') }}
                                @elseif($expiry)
                                    @lang('Package expired on') : {{ showDateTime($expiry, 'd M, Y') }}
                                @else
                                    @lang('Package expired')
                                @endif
                            </div>
                            <a class="btn btn--base mt-3" href="{{ route('packages') }}">@lang('Upgrade Package')</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-12">
            <h5>@lang('Latest Interests')</h5>
            @include($activeTemplate . 'partials.interest_table', ['interests' => $user->interests, 'pagination' => false])
        </div>
        <div class="col-md-12">
            <h5>@lang('Latest Interest Requests')</h5>
            @include($activeTemplate . 'partials.interest_request_table', ['interestRequests' => $user->interestRequests, 'pagination' => false])
        </div>
    </div>
    <!-- Dashboard End -->
@endsection

@push('style')
    <style>
        .wallet--card.custom--card .card-body {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
@endpush

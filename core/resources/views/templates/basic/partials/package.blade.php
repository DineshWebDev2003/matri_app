@php
    $packageContent = getContent('package.content', true);
    $gatewayCurrency = \App\Models\GatewayCurrency::whereHas('method', function ($gate) {
        $gate->where('status', Status::ENABLE);
    })
        ->with('method')
        ->orderby('method_code')
        ->get();
@endphp
@php use Illuminate\Support\Str; @endphp
<div class="section pricing-plan section--bg">
    <div class="section__head">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-10 col-xl-6">
                    <h2 class="mt-0 text-center">{{ __(@$packageContent->data_values->heading) }}</h2>
                    <p class="section__para mx-auto mb-0 text-center">
                        {{ __(@$packageContent->data_values->subheading) }}
                    </p>
                </div>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
            @foreach ($packages as $package)
            @continue($package->price == 0)
                <div class="col d-flex justify-content-center">
                    <div class="plan {{ Str::contains(strtolower($package->name), 'premium') ? 'plan--gold zoom' : '' }}">
                        <div class="plan__head">
                            <div class="plan__head-content">
                                <h4 class="text--white mt-0 mb-0 text-center">{{ __($package->name) }}</h4>
                            </div>
                        </div>
                        <div class="plan__body">
                            <div class="text-center">
                                <h2 class="plan-price display-4 fw-bold mb-1">{{ showAmount($package->price) }} {{ __($general->cur_text) }}</h2>
                                @if (Str::contains(strtolower($package->name),'basic'))
                                <del class="old-price text-warning d-block">999 {{ __($general->cur_text) }}</del>
                                @elseif (Str::contains(strtolower($package->name),'premium'))
                                <del class="old-price text-warning d-block">1,999 {{ __($general->cur_text) }}</del>
                                @elseif (Str::contains(strtolower($package->name),'elite'))
                                <del class="old-price text-warning d-block">3,999 {{ __($general->cur_text) }}</del>
                                @endif
                                <span class="validity text-secondary fw-semibold d-block mt-1">
    @if (Str::contains(strtolower($package->name),'premium'))
        Unlimited Days Validity
    @elseif (Str::contains(strtolower($package->name),'elite'))
        Unlimited Validity
    @else
        365 Days Validity
    @endif
</span>
                            </div>
                            <ul class="list list--base d-none">
                                <li>
                                    <i class="text--base @if ($package->validity_period) fas fa-check @else fas fa-times @endif"></i>
                                    @lang('Duration') {{ packageLimitation($package)['validity_period'] }}
                                </li>

                                <li>
                                    <i class="text--base @if ($package->contact_view_limit) fas fa-check @else fas fa-times @endif"></i>
                                    @lang('Contact View') {{ packageLimitation($package)['contact_view_limit'] }}
                                </li>

                                <li>
                                    <i class="text--base @if ($package->interest_express_limit) fas fa-check @else fas fa-times @endif"></i>
                                    @lang('Interest Express') {{ packageLimitation($package)['interest_express_limit'] }}
                                </li>

                                <li>
                                    <i class="text--base @if ($package->image_upload_limit) fas fa-check @else fas fa-times @endif"></i>
                                    @lang('Image Upload') {{ packageLimitation($package)['image_upload_limit'] }}
                                </li>
                            </ul>
                            <div class="payable-box text-center py-3">
                                @if ($package->price == 0)
                                    <button class="btn btn--base sm-text" type="button" disabled>
                                        @lang('Buy Now') </button>
                                @else
                                     <button class="btn btn--base w-100 packageBtn mb-2" data-package="{{ $package }}" type="button"> @lang('Buy Now') </button>
                                     @if (Str::contains(strtolower($package->name),'basic'))
                                      <button class="btn btn--base w-100 sm-text" data-bs-toggle="modal" data-bs-target="#planFeaturesModalBasic" type="button">@lang('View Features')</button>
                                      @elseif (Str::contains(strtolower($package->name),'premium'))
                                      <button class="btn btn--base w-100 sm-text" data-bs-toggle="modal" data-bs-target="#planFeaturesModalPremium" type="button">@lang('View Features')</button>
                                      @elseif (Str::contains(strtolower($package->name),'elite'))
                                      <button class="btn btn--base w-100 sm-text" data-bs-toggle="modal" data-bs-target="#planFeaturesModalElite" type="button">@lang('View Features')</button>
                                      @endif

                                 @endif

                            </div>
                            @if (Str::contains(strtolower($package->name),'basic'))
                            <div class="features-bar mt-3" style="display:none;" id="features-{{ $package->id }}">
                                <img src="{{ asset('assets/images/package/plan.png') }}" class="img-fluid w-100" alt="plan features">
                            </div>
                            @endif

                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        @if ($totalPackage > $packages->count())
            <div class="mt-5 text-center">
                <a class="btn btn--base" href="{{ route('packages') }}">@lang('See More')</a>
            </div>
        @endif

    </div>
</div>

<div class="modal fade" id="purchaseModal" role="dialog" aria-hidden="true" aria-labelledby="purchaseModalTitle" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="existModalLongTitle">@lang('Purchase Package -') <span class="package-name"></span></h5>
                <span class="close" data-bs-dismiss="modal" type="button" aria-label="Close">
                    <i class="las la-times"></i>
                </span>
            </div>
            <form action="" method="post">
                @csrf
                <input name="method_code" type="hidden">
                <input name="currency" type="hidden">
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="input--group">
                                <select class="form-select form-control form--control" name="gateway" required>
                                    <option value="">@lang('Select One')</option>
                                    @foreach ($gatewayCurrency as $data)
                                        <option data-gateway="{{ $data }}" value="{{ $data->method_code }}" @selected(old('gateway') == $data->method_code)>{{ $data->name }}</option>
                                    @endforeach
                                </select>
                                <label class="form--label">@lang('Gateway')</label>
                            </div>
                        </div>
                        <div class="col-md-12 preview-details d-none mt-3">
                            <ul class="list-group">
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>@lang('Limit')</span>
                                    <span>
                                        <span class="min">0</span> {{ __($general->cur_text) }} - <span class="max">0</span> {{ __($general->cur_text) }}
                                    </span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between">
                                   <span class="old-price"></span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>@lang('Charge')</span>
                                    <span><span class="charge">0</span> {{ __($general->cur_text) }}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>@lang('Payable')</span> <span><span class="payable"> 0</span>
                                        {{ __($general->cur_text) }}</span>
                                </li>
                                <li class="list-group-item justify-content-between d-none rate-element">

                                </li>
                                <li class="list-group-item justify-content-between d-none in-site-cur">
                                    <span>@lang('In') <span class="base-currency"></span></span>
                                    <span class="final_amo">0</span>
                                </li>
                                <li class="list-group-item justify-content-center crypto_currency d-none">
                                    <span>@lang('Conversion with') <span class="method_currency"></span>
                                        @lang('and final value will Show on next step')</span>
                                </li>
                            </ul>
                            <p class="text--danger limit-message d-none mb-0 pt-2 text-center"></p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn--base w-100 submit-btn" type="submit">@lang('Pay Now')</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Premium Match Features Modal -->
<div class="modal fade" id="planFeaturesModalPremium" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
            <button type="button" class="btn-close position-absolute top-0 end-0 m-2" data-bs-dismiss="modal" aria-label="Close"></button>
            <div class="card border-0 shadow-lg">
                <div class="card-header bg-gradient-gold text-center text-white fw-bold fs-5 position-relative">@lang('Serious Match Finders')
                            <div class="rose-shower position-absolute top-0 start-0 w-100 h-100"></div>
                        </div>
                <div class="card-body">
                    <p class="text-center small mb-3 text-dark">@lang('Ideal for serious users who want more time and better reach.')</p>
                    <ul class="list-group list-group-flush mb-3">
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-warning fw-bold">365 Days Validity</span> – 1-year access for relaxed matchmaking.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-warning fw-bold">View Unlimited Profiles</span> – And 365 Contact Viewable.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-warning fw-bold">Send Interest to 500 Members</span> – Higher reach to connect better.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-warning fw-bold">Upload 8 Photos</span> – More images to present yourself well.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-warning fw-bold">Balanced Features</span> – Ideal for serious users at a fair price.')</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Elite Reach Features Modal -->
<div class="modal fade" id="planFeaturesModalElite" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
            <button type="button" class="btn-close position-absolute top-0 end-0 m-2" data-bs-dismiss="modal" aria-label="Close"></button>
            <div class="card border-0 shadow-lg">
                <div class="card-header bg-gradient-red text-center text-white fw-bold fs-5 position-relative">@lang('Full Access & Unlimited Search')
                            <div class="rose-shower position-absolute top-0 start-0 w-100 h-100"></div>
                        </div>
                <div class="card-body">
                    <p class="text-center small mb-3 text-dark">@lang('Lifetime membership with unrestricted features for serious match seekers.')</p>
                    <ul class="list-group list-group-flush mb-3">
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">Unlimited Validity</span> – Lifetime access to find your perfect match.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">Unlimited Profile And Contacts Views</span> – Browse every profile without limits.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">Unlimited Interest Requests</span> – Connect freely with anyone.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">Unlimited Photo Uploads</span> – Fully showcase your personality.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">Priority Support</span> – Get dedicated assistance anytime.')</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="planFeaturesModalBasic" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-2" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="card border-0 shadow-lg">
                    <div class="card-header bg-gradient-red text-center text-white fw-bold fs-5 position-relative">@lang('Simple & Budget-Friendly Search')
                            <div class="rose-shower position-absolute top-0 start-0 w-100 h-100"></div>
                        </div>
                    <div class="card-body">
                    <p class="text-center small mb-3 text-dark">@lang('Great for people who want to try with fewer features and low cost.')</p>
                    
                    <ul class="list-group list-group-flush mb-3">
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">6 Months Validity</span> – Enough time to explore and try.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">View Unlimited Profiles</span> – And 120 Contact Viewable.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">Send Interest to 150 Members</span> – Show your interest to chosen profiles.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">Upload 3 Photos</span> – Share your identity with clear limits.')</li>
                        <li class="list-group-item border-0 d-flex align-items-start"><i class="las la-check text-success me-2 mt-1"></i>@lang('<span class="text-danger fw-bold">Low-Cost Entry Plan</span> – Best for first-time users or quick marriages.')</li>
                    </ul>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>

@push('style')
    <style>
        .modal .btn {
            padding: 5px 10px !important;
        }

        .modal-title {
            margin: 0;
        }

        .modal-header {
            padding: 13px 15px;
        }

        .modal-body h6 {
            margin: 1rem 1rem;
        }

        .list-group-item {
            color: unset;
            font-size: 14px;
        }
        /* Golden highlighted Premium package */
        .plan--gold{
            position:relative;
            overflow:visible;
            border:1px solid #d4a300;
            box-shadow:0 4px 12px rgba(0,0,0,0.25);
        }
        .plan--gold .plan__head{
            background:linear-gradient(90deg,#ffd64d 0%, #d4a300 50%, #bb8800 100%) !important;
        }
        .plan--gold .plan__body-price{
            color:#a06b00 !important;
        }
        .plan--gold .btn{
            background:linear-gradient(90deg,#ffd64d 0%, #d4a300 50%, #bb8800 100%) !important;
            color:#fff !important;
            border:none;
            text-shadow:1px 1px 2px rgba(0,0,0,0.4);
        }
        /* Badge */
        .plan--gold::after{
            content:'';
            position:absolute;
            top:-25px;
            right:-25px;
            width:70px;
            height:70px;
            background:url('{{ asset('assets/images/package/recommended.png') }}') no-repeat center/contain;
            z-index:2;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        /* Modal Features Card */
        .price-bar{background:#c70039;color:#fff;padding:6px 18px;border-radius:4px;font-weight:700;display:inline-block;font-size:14px;}
        .plan-popup{background:#ffffff;border-radius:14px;max-width:520px;margin:auto;position:relative;padding:32px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.25);animation:popupZoom .4s ease;}
        .plan-popup::before{content:'';position:absolute;inset:0;border-radius:14px;padding:2px;background:linear-gradient(135deg,#ffe58a 0%, #e1b200 50%, #c59500 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
        .plan-popup-title{min-height:500px;font-weight:800;font-size:24px;color:#c70039;letter-spacing:0.4px;}
        .plan-popup-sub{font-size:15px;color:#666;line-height:1.4;}
        .plan-popup ul li{font-size:15px;margin-bottom:10px;display:flex;align-items:start;}
        .plan-popup ul li i{color:#e1b200;font-size:18px;line-height:1;margin-top:3px;}
        
        .bg-gradient-gold{background:linear-gradient(90deg,#ffd64d 0%, #d4a300 100%) !important;}
        .bg-gradient-red{background:linear-gradient(90deg,#c70039 0%, #ff004c 100%) !important;}
        /* Ensure cards are consistent width and features list hidden */
        .plan{min-height:450px;width:100%;max-width:320px;margin:0 auto;}
        .plan__body{flex:1 1 auto;display:flex;flex-direction:column;}
        .payable-box{margin-top:auto;}
        .old-price{color:#ffd64d;text-decoration:line-through;font-size:24px;font-weight:700;}
        .validity{font-size:1rem;font-weight:600;color:#6c757d;}
        .list--base{display:none !important;}
        .bg-gradient-blue{background:linear-gradient(90deg,#0058d4 0%, #008cff 100%) !important;}
@keyframes popupZoom{0%{transform:scale(.6);opacity:0;}100%{transform:scale(1);opacity:1;}}
        /* Features bar */
        .features-bar{
            background:#fff;
        }
        .features-bar img{border:1px solid #eee;box-shadow:0 2px 6px rgba(0,0,0,0.15);}
        /* Zoom effect */
        .zoom{
            transform:scale(1.03);
            transition:transform .3s ease;
        }
        .zoom:hover{
            transform:scale(1.08);
        }
            /* Rose rain */
        .rose-shower {
            pointer-events:none;
            overflow:hidden; /* confine roses within header banner */
            height:100%;
            z-index:5;
        }
        .rose-shower img.rose {
            position:absolute;
            width:16px;
            height:16px;
            opacity:0.6;
            animation:roseFall 4s linear infinite;
            will-change:transform;
        }
        @keyframes roseFall {
            0%{transform:translateY(-100px) rotate(0deg);opacity:1;}
            100%{transform:translateY(500px) rotate(360deg);opacity:0;}
        }
    </style>
@endpush

@push('script')
    <script>
        (function($) {
            "use trict";

            let amount = 0;
            let modal = $('#purchaseModal');
            $('.packageBtn').on('click', function() {
                let package = $(this).data('package');

                let url = `{{ route('user.payment.purchase.package', ':id') }}`;
                let gateway = modal.find('[name=gateway]');
                gateway.val('');
                const opts = gateway.find('option:not([value=""])');
                if(opts.length === 1){
                    gateway.val(opts.first().val()).trigger('change');
                }

                url = url.replaceAll(":id", package.id);
                modal.find('form').attr('action', url);

                modal.find('.package-name').text(package.name);
                amount = package.price;
                modal.find('[name=amount]').val(amount);
                modal.find('.preview-details').addClass('d-none');
                modal.modal('show');
            });

            

            modal.find('select[name=gateway]').change(function() {
                if (!modal.find('select[name=gateway]').val()) {
                    modal.find('.preview-details').addClass('d-none');
                    return false;
                }
                var resource = modal.find('select[name=gateway] option:selected').data('gateway');

                var fixed_charge = parseFloat(resource.fixed_charge);
                var percent_charge = parseFloat(resource.percent_charge);
                var rate = parseFloat(resource.rate)
                if (resource.method.crypto == 1) {
                    var toFixedDigit = 8;
                    modal.find('.crypto_currency').removeClass('d-none');
                } else {
                    var toFixedDigit = 2;
                    modal.find('.crypto_currency').addClass('d-none');
                }
                modal.find('.min').text(parseFloat(resource.min_amount).toFixed(2));
                modal.find('.max').text(parseFloat(resource.max_amount).toFixed(2));

                modal.find('.preview-details').removeClass('d-none');
                var charge = parseFloat(fixed_charge + (amount * percent_charge / 100)).toFixed(2);
                modal.find('.charge').text(charge);

                var payable = parseFloat((parseFloat(amount) + parseFloat(charge))).toFixed(2);
                modal.find('.payable').text(payable);

                if (parseFloat(payable) > parseFloat(resource.max_amount)) {
                    $('.limit-message').text('Payable amount exceeds the limit, please try another gateway');
                    $('.submit-btn').attr('disabled', true);
                    $('.limit-message').removeClass('d-none');
                } else {
                    $('.limit-message').addClass('d-none');
                    $('.submit-btn').attr('disabled', false);
                }

                var final_amo = (parseFloat((parseFloat(amount) + parseFloat(charge))) * rate).toFixed(toFixedDigit);
                modal.find('.final_amo').text(final_amo);

                if (resource.currency != '{{ $general->cur_text }}') {
                    var rateElement =
                        `<span class="">@lang('Conversion Rate')</span> <span><span  class="">1 {{ __($general->cur_text) }} = <span class="rate">${rate}</span>  <span class="base-currency">${resource.currency}</span></span></span>`;
                    modal.find('.rate-element').html(rateElement)
                    modal.find('.rate-element').removeClass('d-none');
                    modal.find('.in-site-cur').removeClass('d-none');
                    modal.find('.rate-element').addClass('d-flex');
                    modal.find('.in-site-cur').addClass('d-flex');
                } else {
                    modal.find('.rate-element').html('')
                    modal.find('.rate-element').addClass('d-none');
                    modal.find('.in-site-cur').addClass('d-none');
                    modal.find('.rate-element').removeClass('d-flex');
                    modal.find('.in-site-cur').removeClass('d-flex');
                }
                modal.find('.base-currency').text(resource.currency);
                modal.find('.method_currency').text(resource.currency);
                modal.find('input[name=currency]').val(resource.currency);
                modal.find('input[name=method_code]').val(resource.method_code);
            });
        // Rose rain animation for all Features popups
        ['#planFeaturesModalBasic','#planFeaturesModalPremium','#planFeaturesModalElite'].forEach(function(selector){
            var modal = $(selector);
            modal.on('shown.bs.modal', function () {
                var $container = $(this).find('.rose-shower');
                if ($container.children('img.rose').length === 0) { // add once per open
                    for (let i = 0; i < 20; i++) {
                        let left = Math.random() * 100; // percentage across header
                        let size = 12 + Math.random() * 12; // 12-24px
                        let delay = Math.random() * 4; // staggered start
                        $('<img>', {
                            class: 'rose',
                            src: '{{ asset("assets/images/package/rose.png") }}'
                        }).css({
                            left: left + '%',
                            width: size + 'px',
                            height: size + 'px',
                            animationDelay: delay + 's',
                            opacity: 0.6
                        }).appendTo($container);
                    }
                }
            });
        });
        })(jQuery);
    </script>
@endpush

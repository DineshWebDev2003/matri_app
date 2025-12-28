@php
    $bannerContent = getContent('banner.content', true);
    $bannerElement = getContent('banner.element', limit: 5);
    
    $countryData = (array) json_decode(file_get_contents(resource_path('views/partials/country.json')));
    $countries = array_column($countryData, 'country');
    $maritalStatuses = App\Models\MaritalStatus::all();
@endphp

<!-- Hero  -->
@push('style-lib')
<link href="https://fonts.googleapis.com/css2?family=Monomakh&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Aladin&display=swap" rel="stylesheet">
<style>
    .aladin-font{
        font-family:'Aladin', cursive !important;
    }
    .monomakh-font{
        font-family:'Monomakh', serif !important;
    }
    .hero__content-subtitle{color:#fff!important;}
    .hero__content-subtitle span{color:#fff!important;}
    .gradient-gold{
        background: linear-gradient(90deg,#ffea8a 0%, #FFE452 40%, #ffb300 60%, #ffea8a 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip:text;
        color:transparent;
        text-shadow: 2px 2px 0 #d18b00, 4px 4px 0 #b56e00, 6px 6px 8px rgba(0,0,0,0.45);
    }
    .gradient-red{
        background: linear-gradient(90deg,#ff1f1f 0%, #b50000 40%, #700000 60%, #ff1f1f 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip:text;
        color:transparent;
        text-shadow:
            /* subtle highlight */ -1px -1px 0 #ff4d4d,
            /* inner shade */ 1px 1px 1px #5b0000,
            /* outer depth */ 2px 2px 4px rgba(0,0,0,0.55);
    
    }
    .hero__content-subtitle span::after{content:none !important;}
    .btn--gold{
        background: linear-gradient(90deg,#ffea8a 0%, #FFE452 40%, #ffb300 60%, #ffea8a 100%);
        color:#ffffff !important;
        font-weight:600;
        text-shadow:1px 1px 3px rgba(0,0,0,0.6);
        border:none;
        border-radius:6px;
        box-shadow:0 3px 6px rgba(0,0,0,0.25);
    }
    .btn--gold:hover{
        filter:brightness(1.05);
        transform:translateY(-2px);
        box-shadow:0 5px 10px rgba(0,0,0,0.35);
    }
    .cupid-gif{
        position:absolute;
        top:-55px;
        left:-40px;
        width:80px;
        transform:scaleX(-1);
        pointer-events:none;
    }
</style>
@endpush

<section class="hero">
    <div class="hero-slider">
        @foreach ($bannerElement as $banner)
            <div class="hero-slider__item">
                <img src="{{ getImage('assets/images/frontend/banner/' . $banner->data_values->slider_image, '1920x1080') }}" alt="@lang('Banner')">
            </div>
        @endforeach
    </div>

    <div class="hero__content">
        <div class="container">
            <div class="row align-items-center gy-5">
                <div class="col-xl-7 col-lg-6 pe-xl-5 welcome-block position-relative">
                    <img src="{{ asset('assets/Gif/cupid.gif') }}" class="cupid-gif" alt="Cupid">
                    <h4 class="hero__content-subtitle monomakh-font mt-0">
                        <span>@lang('Welcome')</span> <span>@lang('To')</span> <span class="monomakh-font gradient-red">{{ __($general->site_name) }}</span>
                    </h4>
                    <h1 class="hero__content-title text-capitalize aladin-font" style="color: #FFE452; text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 3px 3px 6px rgba(0,0,0,0.5);">
                        {{ str_replace('Find Your Perfect Life Partner With Us', '<span style="color: #FFE452; text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 3px 3px 6px rgba(0,0,0,0.5);">Find Your Perfect Life Partner With Us</span>', __(@$bannerContent->data_values->subheading)) }}
                    </h1>
                    <div class="mx-auto">
                        <a class="btn btn--gold mt-3" href="{{ url(@$bannerContent->data_values->button_url) }}">
                            {{ __(@$bannerContent->data_values->button_text) }}
                        </a>
                    </div>
                </div>
                <div class="col-xl-5 col-lg-6">
                    <div class="banner-account">
    @include($activeTemplate . 'partials.banner_register_form')
                        <form class="register-form d-none" action="{{ route('member.list') }}">
                            <div class="section__head pb-3 text-center">
                                <h2 class="login-title mt-0">@lang('Find Your Partner')</h2>
                            </div>
                            <div class="row gy-4">
                                <div class="col-lg-12">
                                    <div class="input--group">
                                        <select class="form-control form--control" name="country">
                                            <option value="">@lang('Select One')</option>
                                            @foreach ($countries as $country)
                                                <option value="{{ $country }}">{{ __($country) }}</option>
                                            @endforeach
                                        </select>
                                        <label class="form--label">@lang('Country')</label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="input--group">
                                        <input class="form-control form--control" id="city" name="city" type="text">
                                        <label class="form--label" for="city">@lang('City')</label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="input--group">
                                        <input class="form-control form--control" id="profession" name="profession" type="text">
                                        <label class="form--label" for="profession">@lang('Profession')</label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="input--group">
                                        <select class="form-control form--control" name="marital_status">
                                            <option value="">@lang('Select One')</option>
                                            @foreach ($maritalStatuses as $maritalStatus)
                                                <option value="{{ $maritalStatus->title }}">{{ __($maritalStatus->title) }}
                                                </option>
                                            @endforeach
                                        </select>
                                        <label class="form--label">@lang('Marital Status')</label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="input--group">
                                        <select class="form-control form--control" name="looking_for">
                                            <option value="">@lang('Select One')</option>
                                            <option value="1">@lang('Bridgroom')</option>
                                            <option value="2">@lang('Bride')</option>
                                        </select>
                                        <label class="form--label">@lang('Looking For')</label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="input--group">
                                        <select class="form-control form--control" name="smoking_status">
                                            <option value="">@lang('Select One')</option>
                                            <option value="1">@lang('Smoker')</option>
                                            <option value="0">@lang('Non-smoker')</option>
                                        </select>
                                        <label class="form--label">@lang('Smoking Habits')</label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="input--group">
                                        <select class="form-control form--control" name="drinking_status">
                                            <option value="">@lang('Select One')</option>
                                            <option value="1">@lang('Drunker')</option>
                                            <option value="0">@lang('Non-drunker')</option>
                                        </select>
                                        <label class="form--label">@lang('Drinking Status')</label>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <button class="btn btn--base w-100" type="submit">@lang('Search')</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

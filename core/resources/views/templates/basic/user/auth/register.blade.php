@extends($activeTemplate . 'layouts.frontend')
@php
    $info = json_decode(json_encode(getIpInfo()), true);
    $mobileCode = @implode(',', $info['code']);
    $countries = json_decode(file_get_contents(resource_path('views/partials/country.json')));
    $registerContent = getContent('register.content', true);
    $policyPages = getContent('policy_pages.element', false, null, true);
@endphp
@section('content')
    <div class="login section">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="login__wrapper position-relative">
                            <!-- Sound Toggle -->
                            <div class="sound-toggle">
                                <!-- From Uiverse.io by MuhammadHasann -->
                                <div class="toggle-cont">
                                    <input class="toggle-input" id="toggle-sound" name="toggle-sound" type="checkbox" />
                                    <label class="toggle-label" for="toggle-sound">
                                        <div class="cont-label-play">
                                            <span class="label-play"></span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        <form class="login__form verify-gcaptcha" action="{{ route('user.register') }}" autocomplete="off" method="POST">
                            @csrf
                            @include($activeTemplate . 'partials.register_form_fields')
                        </form>
                        @include($activeTemplate . 'partials.social_login')
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="existModalCenter" role="dialog" aria-hidden="true" aria-labelledby="existModalCenterTitle" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="existModalLongTitle">@lang('You are with us')</h5>
                    <span class="close" data-bs-dismiss="modal" type="button" aria-label="Close">
                        <i class="las la-times"></i>
                    </span>
                </div>
                <div class="modal-body">
                    <h6>@lang('You already have an account, please login!')</h6>
                </div>
                <div class="modal-footer">
                    <button class="btn btn--dark btn-sm" data-bs-dismiss="modal" type="button">@lang('Close')</button>
                    <a class="btn btn--base btn-sm" href="{{ route('user.login') }}">@lang('Login')</a>
                </div>
            </div>
        </div>
    </div>
@endsection

@if ($general->secure_password)
    @push('script-lib')
        <script src="{{ asset('assets/global/js/secure_password.js') }}"></script>
    @endpush
@endif
@push('script')
    <script>
        "use strict";
        (function($) {
            $('input[name=mobile_code]').val('91');
$('input[name=country_code]').val('IN');
$('.mobile-code').text('+91');

            // Load castes when religion is selected
            $('#religion').on('change', function () {
                const rel = $(this).val();
                const $caste = $('#caste');
                $caste.html('<option value="">@lang("Loading...")</option>');
                if (!rel) {
                    return;
                }
                $.get('{{ url('castes') }}/' + encodeURIComponent(rel), function (data) {
                    let opts = '<option value="">@lang("Select Caste")</option>';
                    $.each(data, function (i, name) {
                        opts += `<option value="${name}">${name}</option>`;
                    });
                    $caste.html(opts);
                    // set old value if present
                    const oldCaste = '{{ old('caste') }}';
                    if (oldCaste) {
                        $caste.val(oldCaste);
                    }
                });
            });

            // Trigger once on page load for old value
            $('#religion').trigger('change');

            $('.checkUser').on('focusout', function(e) {
                var url = '{{ route('user.checkUser') }}';
                var value = $(this).val();
                var token = '{{ csrf_token() }}';
                if ($(this).attr('name') == 'mobile') {
                    var mobile = `${$('.mobile-code').text().substr(1)}${value}`;
                    var data = {
                        mobile: mobile,
                        _token: token
                    }
                }
                if ($(this).attr('name') == 'email') {
                    var data = {
                        email: value,
                        _token: token
                    }
                }

                $.post(url, data, function(response) {
                    if (response.data != false && response.type == 'email') {
                        $('#existModalCenter').modal('show');
                    } else if (response.data != false && response.type !== 'email') {
                        $(`.${response.type}Exist`).text(`${response.type} already exist`);
                    } else {
                        $(`.${response.type}Exist`).text('');
                    }
                });
            });
            var bgAudio = new Audio("{{ asset('assets/images/frontend/Song/Song.mp3') }}");
            bgAudio.loop = true;

            $('.toggle-input').on('change', function () {
                if (this.checked) {
                    bgAudio.play();
                } else {
                    bgAudio.pause();
                    bgAudio.currentTime = 0;
                }
            });
        })(jQuery);
    </script>
@endpush

@push('style')
    <style>
        .country-code .input-group-text {
            background: #fff !important;
        }

        .country-code select {
            border: none;
        }

        .country-code select:focus {
            border: none;
            outline: none;
        }

        .modal .btn {
            padding: 5px 10px !important;
        }

        .modal-title {
            margin: 0;
            line-height: 0 !important;
        }

        .modal-body h6 {
            margin: 1rem 1rem;
        }
        /* Play / Pause button styles – exact design */
        .btn-audio{
            position:absolute;
            top:8px;
            right:8px;
            width:120px;
            height:120px;
            transform:scale(0.5);
            transform-origin:top right;
            z-index:10;
        }

        .play-btn{
            position:absolute;
            appearance:none;
            width:100%;
            height:100%;
            border-radius:50%;
            background:conic-gradient(#ff6347,#ff6347);
            cursor:pointer;
            outline:none;
        }
        .play-btn::before{
            content:"";
            position:absolute;
            width:93%;
            height:93%;
            background:#000;
            border-radius:50%;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
        }
        .play-btn:checked{
            animation:borderAnimate 700ms ease-in-out 1 forwards;
        }
        @keyframes borderAnimate{
            0%{transform:rotate(0);background:conic-gradient(#ff6347,transparent 20%)}
            80%{background:conic-gradient(#ff6347,transparent 90%)}
            100%{transform:rotate(360deg);background:conic-gradient(#ff6347,#ff6347)}
        }

        .play-icon{
            position:absolute;
            width:40px;height:40px;
            left:60%;top:65%;
            background:#ff6347;
            transform:translate(-60%,-50%) rotate(90deg);
            clip-path:polygon(50% 15%,0 100%,100% 100%);
            transition:all 400ms ease-in-out;
            cursor:pointer;
        }
        .play-btn:checked + .play-icon{clip-path:polygon(0 100%,0 100%,100% 100%)}

        .pause-icon{
            position:absolute;
            width:40px;height:40px;
            left:50%;top:65%;
            transform:translate(-50%,-50%);
            cursor:pointer;
        }
        .pause-icon::before,
        .pause-icon::after{
            content:"";
            position:absolute;
            width:0;height:100%;
            background:#ff6347;
        }
        .pause-icon::before{left:0}
        .pause-icon::after{right:0}
        .play-btn:checked ~ .pause-icon::before{animation:reveal 300ms ease-in-out 350ms forwards}
        .play-btn:checked ~ .pause-icon::after{animation:reveal 300ms ease-in-out 600ms forwards}
        @keyframes reveal{0%{width:0}100%{width:35%}}
        .pause-icon::before,.pause-icon::after{content:"";position:absolute;width:0;height:100%;background:#ff6347}
        .play-btn:checked ~ .pause-icon::before{animation:bar .3s .35s forwards}
        .play-btn:checked ~ .pause-icon::after{animation:bar .3s .6s forwards}
        @keyframes bar{to{width:40%}}

        /* Toggle switch styles */
        .sound-toggle{position:absolute;top:8px;right:8px;z-index:10;transform:scale(.45);transform-origin:top right;}
        .toggle-cont{width:100px;height:50px;border-radius:9999px;}
        .toggle-cont .toggle-input{display:none;}
        .toggle-cont .toggle-label{cursor:pointer;position:relative;display:inline-block;padding:6px;width:100%;height:100%;background:#272727;border-radius:9999px;box-sizing:content-box;box-shadow:0 0 16px -8px #fefefe;}
        .toggle-cont .toggle-label .cont-label-play{position:relative;width:50px;aspect-ratio:1/1;background:#ffffff;border-radius:9999px;transition:all .5s cubic-bezier(1,0,0,1);}
        .toggle-cont .toggle-input:checked + .toggle-label .cont-label-play{background:#ffffff;transform:translateX(50px);}
        .toggle-cont .toggle-label .label-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:inline-block;width:24px;aspect-ratio:1/1;background:#DC242D;border-radius:4px;clip-path:polygon(25% 0,75% 50%,25% 100%,25% 51%);transition:all .5s cubic-bezier(1,0,0,1);}
        .toggle-cont .toggle-input:checked + .toggle-label .label-play{width:20px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%);}
    </style>
@endpush

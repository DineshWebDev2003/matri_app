@php
    $registerContent = getContent('register.content', true);
    $policyPages = getContent('policy_pages.element', false, null, true);
    $general = gs();
    $religions = \App\Models\ReligionInfo::orderBy('name')->get();
@endphp

<form class="login__form verify-gcaptcha banner-register" action="{{ route('user.register') }}" autocomplete="off" method="POST" style="position: relative;">
    <!-- Sound Toggle -->
    <div class="sound-toggle">
        <!-- From Uiverse.io by MuhammadHasann -->
        <div class="toggle-cont">
            <input class="toggle-input" id="banner-toggle-sound" name="toggle-sound" type="checkbox" />
            <label class="toggle-label" for="banner-toggle-sound">
                <div class="cont-label-play">
                    <span class="label-play"></span>
                </div>
            </label>
        </div>
    </div>
    @csrf
    @include($activeTemplate . 'partials.register_form_fields')
</form>

@push('script')
    <script>
        (function ($) {
            'use strict';
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
        /* Toggle switch styles */
        .sound-toggle{position:absolute;top:4px;right:8px;z-index:10;transform:scale(.45);transform-origin:top right;}
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
            .sound-toggle{transform:scale(.25);top:6px;right:2px;}
        }
        
        @media (max-width: 480px) {
            .sound-toggle{transform:scale(.20);top:-16px;right:-2px;}
        }
        .toggle-cont{width:100px;height:50px;border-radius:9999px;}
        .toggle-cont .toggle-input{display:none;}
        .toggle-cont .toggle-label{cursor:pointer;position:relative;display:inline-block;padding:6px;width:100%;height:100%;background:#272727;border-radius:9999px;box-sizing:content-box;box-shadow:0 0 16px -8px #fefefe;}
        .toggle-cont .toggle-label .cont-label-play{position:relative;width:50px;aspect-ratio:1/1;background:#ffffff;border-radius:9999px;transition:all .5s cubic-bezier(1,0,0,1);}
        .toggle-cont .toggle-input:checked + .toggle-label .cont-label-play{background:#ffffff;transform:translateX(50px);}
        .toggle-cont .toggle-label .label-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:inline-block;width:24px;aspect-ratio:1/1;background:#DC242D;border-radius:4px;clip-path:polygon(25% 0,75% 50%,25% 100%,25% 51%);transition:all .5s cubic-bezier(1,0,0,1);}
        .toggle-cont .toggle-input:checked + .toggle-label .label-play{width:20px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%);}
    </style>
@endpush


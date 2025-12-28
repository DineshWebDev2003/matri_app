<!doctype html>
<html itemscope itemtype="http://schema.org/WebPage" lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>
    @if(request()->routeIs('home'))
    90sKalyanam – Tamil Matrimony for 90s Kids | Find Your Perfect Match
    @else
        {{ __($pageTitle) }} | 90s Kalyanam
    @endif
</title>
    @include('partials.seo')
    <link href="{{ asset('assets/global/css/bootstrap.min.css') }}" rel="stylesheet">

    <link href="{{ asset('assets/global/css/all.min.css') }}" rel="stylesheet">
    <!-- Latest Font Awesome CDN for fa-x-twitter icon -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossorigin="anonymous">

    <link href="{{ asset('assets/admin/css/vendor/datepicker.min.css') }}" rel="stylesheet">

    <link href="{{ asset('assets/global/css/line-awesome.min.css') }}" rel="stylesheet" />
    <link href="{{ asset($activeTemplateTrue . 'css/slick.css') }}" rel="stylesheet">
    <link href="{{ asset($activeTemplateTrue . 'css/jquery-ui.css') }}" rel="stylesheet">
    <link href="{{ asset($activeTemplateTrue . 'css/magnific-popup.css') }}" rel="stylesheet">
    <link href="{{ asset($activeTemplateTrue . 'css/odometer-theme-default.css') }}" rel="stylesheet">
    <link href="{{ asset($activeTemplateTrue . 'css/main.css') }}" rel="stylesheet">

    <link href="{{ asset($activeTemplateTrue . 'css/custom.css') }}" rel="stylesheet">

    @stack('style-lib')

    @stack('style')

    <link href="{{ asset($activeTemplateTrue . 'css/color.php') }}?color={{ $general->base_color }}&secondColor={{ $general->secondary_color }}" rel="stylesheet">
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '684815251280745');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=684815251280745&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
</head>

<body>
    @yield('panel')
    <script src="{{ asset('assets/global/js/jquery-3.6.0.min.js') }}"></script>
    <script src="{{ asset('assets/global/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset($activeTemplateTrue . 'js/slick.js') }}"></script>
    <script src="{{ asset($activeTemplateTrue . 'js/jquery.magnific-popup.js') }}"></script>
    <script src="{{ asset($activeTemplateTrue . 'js/jquery.filterizr.min.js') }}"></script>
    <script src="{{ asset($activeTemplateTrue . 'js/jquery.ui.js') }}"></script>
    <script src="{{ asset($activeTemplateTrue . 'js/viewport.js') }}"></script>
    <script src="{{ asset($activeTemplateTrue . 'js/odometer.js') }}"></script>
    @stack('script-lib')
    <script src="{{ asset($activeTemplateTrue . 'js/app.js') }}"></script>
    @stack('script')
    @include('partials.plugins')
    @include('partials.notify')
    <script>
        (function($) {
            "use strict";
            $(".langSel").on("change", function() {
                window.location.href = "{{ route('home') }}/change/" + $(this).val();
            });

        })(jQuery);
    </script>
    @if (request()->routeIs('home'))
    <!-- WhatsApp Chat Bubble -->
    <div class="whats-bubble" id="whatsBubble"><span id="whatsMsg"></span></div>
    <!-- WhatsApp Floating Button -->
    @php
        $whatsappContent = getContent('whatsapp.content', true);
    @endphp
    @if($whatsappContent)
        <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $whatsappContent->data_values->contact_number) }}" target="_blank" class="Btn" aria-label="Chat on WhatsApp">
            <div class="sign">
                <svg class="socialSvg whatsappSvg" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                </svg>
            </div>
            <div class="text">WhatsApp</div>
        </a>
    @endif

    <style>
        .whats-btn {
            position: fixed;
            left: 18px;
            bottom: 22px;
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: #25d366;
            color: #fff !important;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
            z-index: 999;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .whats-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.35);
            text-decoration: none;
            color: #fff;
        }
        @media (max-width: 576px) {
            .whats-btn {
                left: 16px;
                bottom: 16px;
                width: 52px;
                height: 52px;
                font-size: 28px;
            }
        }
            .whats-bubble {
            pointer-events:none;
            position: fixed;
            left: 32px;
            bottom: 86px;
            background: #ffffff;
            color: #333;
            box-sizing: border-box;
            border: 2px solid #25d366;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 998;
            opacity:0;
            transform:scale(0.8);
            transition:opacity .3s ease, transform .3s ease;
        }
        .whats-bubble.show {opacity:1;transform:scale(1);} 
        .whats-bubble::after {
            content: "";
            position: absolute;
            left: 18px;
            bottom: -6px;
            width: 12px;
            height: 12px;
            background: #ffffff;
            transform: rotate(45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        @media(max-width:576px){
            .whats-bubble{left:18px;bottom:76px;font-size:13px;max-width:180px;}
            .whats-bubble::after{left:18px;}
        }
        .whats-bubble span{font-weight:normal;}
        /* Whatsapp Button (uiverse.io) */
        .Btn{
            display:flex;align-items:center;justify-content:flex-start;width:45px;height:45px;border:none;border-radius:50%;cursor:pointer;position:fixed;left:18px;bottom:22px;overflow:hidden;transition:.3s;box-shadow:2px 2px 10px rgba(0,0,0,.2);background:#00d757;z-index:50;
        }
        .Btn .sign{width:100%;transition:.3s;display:flex;align-items:center;justify-content:center;}
        .Btn .sign svg{width:25px;fill:#fff}
        .Btn .text{position:absolute;right:0;width:0;opacity:0;color:#fff;font-size:1rem;font-weight:600;letter-spacing:0.3px;transition:.3s;white-space:nowrap;text-transform:none;}
        .Btn:hover{width:150px;border-radius:40px;}
        .Btn:hover .sign{width:30%;padding-left:10px;}
        .Btn:hover .text{opacity:1;width:70%;padding-right:10px;}
        .Btn:active{transform:translate(2px,2px);} 
    </style>
<script>
// WhatsApp bubble typewriter & periodic animation
(function(){
    const bubble = document.getElementById('whatsBubble');
    const msgSpan = document.getElementById('whatsMsg');
    if(!bubble || !msgSpan) return;
    const fullText = 'Coffee Eduthukoga Mappilai ☕ Ponna Pidichuruka ?? 😊';
    const intervalMs = 15000; // show every 15 seconds
    const visibleMs  = 5000;  // visible duration 5s
    const typeSpeed  = 45;    // typing speed per char ms

    let typer;
        function typeWrite(){
        if(typer) clearInterval(typer);
        msgSpan.textContent = '';
        let idx = 0;
        typer = setInterval(()=>{
            msgSpan.textContent += fullText.charAt(idx++);
            if(idx === fullText.length) clearInterval(typer);
        }, typeSpeed);
    }

    function triggerBubble(){
        bubble.classList.add('show');
        typeWrite();
        setTimeout(()=>{bubble.classList.remove('show');}, visibleMs);
    }

    setTimeout(()=>{
        triggerBubble();
        setInterval(triggerBubble, intervalMs);
    }, 1000);
})();
@endif
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
</body>

</html>

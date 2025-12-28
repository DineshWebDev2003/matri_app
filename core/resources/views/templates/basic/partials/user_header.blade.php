@php
    $pages = App\Models\Page::where('tempname', $activeTemplate)
        ->where('is_default', Status::NO)
        ->get();
@endphp
<!-- Header -->

<!-- ==================== Bottom Header End Here ==================== -->
<header class="header-bottom">
    <div class="container">
        <nav class="navbar navbar-expand-lg navbar-light">
            <a class="navbar-brand logo" href="{{ route('home') }}"><img src="{{ getImage(getFilePath('logoIcon') . '/logo.png') }}" alt=""></a>
            <button class="navbar-toggler header-button" data-bs-target="#navbarSupportedContent" data-bs-toggle="collapse" type="button" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <i class="las la-bars"></i>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav nav-menu ms-auto">
                    <li class="nav-item">
                        <a class="nav-link {{ menuActive('home') }}" href="{{ route('home') }}">@lang('Home')</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ menuActive('packages') }}" href="{{ route('packages') }}">@lang('Packages')</a>
                    </li>
                    <li class="nav-item position-relative" id="memberMsgNav">
                        <a class="nav-link {{ menuActive('member.list') }}" href="{{ route('member.list') }}">@lang('Members')</a>
                        <div class="partner-bubble position-absolute" style="display:none;">
                            <span>@lang('Your partner is waiting...')</span>
                        </div>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ menuActive('stories') }}" href="{{ route('stories') }}">@lang('Stories')</a>
                    </li>

                    @foreach ($pages as $page)
                        <li class="nav-item">
                            <a class="nav-link @if (request()->url() == route('pages', [$page->slug])) active @endif" href="{{ url($page->slug) }}">{{ __($page->name) }}</a>
                        </li>
                    @endforeach

                    <li class="nav-item">
                        <a class="nav-link {{ menuActive('contact') }}" href="{{ route('contact') }}">@lang('Contact')</a>
                    </li>
                    <li class="nav-item d-lg-none d-block">
                        <a class="nav-link {{ menuActive('user.home') }}" href="{{ route('user.login') }}">
                            @lang('Dashboard')</a>
                    </li>
                    <li class="nav-item d-lg-none d-block d-flex justify-content-between">
                        <a class="nav-link" href="{{ route('user.logout') }}"> @lang('Logout')</a>

                        @if ($general->multi_language)
                            <select class="langSel select language-select">
                                @foreach ($language as $lang)
                                    <option value="{{ $lang->code }}" @selected(session()->get('lang') == $lang->code)>@lang($lang->name)</option>
                                @endforeach
                            </select>
                        @endif
                    </li>
                </ul>
                <div class="d-none d-lg-block">
                    <ul class="header-login list primary-menu">
                        @if ($general->multi_language)
                            <li class="header-login__item">
                                <select class="langSel select language-select">
                                    @foreach ($language as $lang)
                                        <option value="{{ $lang->code }}" @selected(session()->get('lang') == $lang->code)>@lang($lang->name)</option>
                                    @endforeach
                                </select>
                            </li>
                        @endif
                        <li class="header-login__item">
                            <a class="btn btn--base btn--sm" href="{{ route('user.home') }}"> <i class="las la-user"></i> @lang('Dashboard')</a>
                        </li>

                        <li class="header-login__item">
                            <a class="btn btn--base btn--sm btn--outline" href="{{ route('user.logout') }}"> @lang('Logout') </a>
                        </li>
                    </ul>
                </div>
                <!-- User Login End -->
            </div>
        </nav>
    </div>
@push('style')
<style>
    .partner-bubble{
        --bubble-bg:#fff3cd;
        --bubble-text:#856404;
        top: 110%; /* a bit below nav */
        left: 50%;
        transform: translateX(-50%);
        background:var(--bubble-bg);
        color:var(--bubble-text);
        padding:6px 14px;
        border-radius:8px;
        font-size:13px;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.15);
    }
    .partner-bubble::after{
        content:"";
        position:absolute;
        top:-8px;
        left:50%;
        transform:translateX(-50%);
        border-width:0 8px 8px 8px;
        border-style:solid;
        border-color:transparent transparent var(--bubble-bg) transparent;
    }
.partner-bubble-mobile{
        bottom: 110%;
        left: 50%;
        transform: translateX(-50%);
        background:var(--bubble-bg);
        color:var(--bubble-text);
        padding:6px 14px;
        border-radius:8px;
        font-size:12px;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.15);
    }
    .partner-bubble-mobile::after{
        content:"";
        position:absolute;
        bottom:-8px;
        left:50%;
        transform:translateX(-50%);
        border-width:8px 8px 0 8px;
        border-style:solid;
        border-color:var(--bubble-bg) transparent transparent transparent;
    }
</style>
@endpush

@push('script')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const bubbleDesktop = document.querySelector('#memberMsgNav .partner-bubble');
        const bubbleMobile = document.querySelector('#mobileMemberNav .partner-bubble-mobile');
        if (!bubbleDesktop && !bubbleMobile) return;
        const showDuration = 3000; // 3s visible
        const interval = 10000; // 10s cycle
        const colors=[
            {bg:'#ffeb3b',text:'#0d47a1'},
            {bg:'#8bc34a',text:'#1b5e20'},
            {bg:'#03a9f4',text:'#004d40'},
            {bg:'#ff9800',text:'#4e342e'},
            {bg:'#e1bee7',text:'#4a148c'}
        ];
        function showBubble(){
            const pair=colors[Math.floor(Math.random()*colors.length)];
            bubbleDesktop.style.setProperty('--bubble-bg',pair.bg);
            bubbleDesktop.style.setProperty('--bubble-text',pair.text);
            if(bubbleDesktop){bubbleDesktop.style.display='block';}
            if(bubbleMobile){bubbleMobile.style.setProperty('--bubble-bg',pair.bg);bubbleMobile.style.setProperty('--bubble-text',pair.text);bubbleMobile.style.display='block';}
            setTimeout(()=>{if(bubbleDesktop) bubbleDesktop.style.display='none'; if(bubbleMobile) bubbleMobile.style.display='none';},showDuration);
        }
        showBubble();
        setInterval(showBubble,interval);
    });
</script>
@endpush
</header>
<!-- ==================== Bottom Header End Here ==================== -->

<!-- =========================== Mobile Device Bottom Navigation Start ============================ -->
<div class="mobile-nav d-lg-none d-block">
    <div class="container">
        <ul class="mobile-nav__menu d-flex justify-content-between">
            <li class="mobile-nav__item">
                <a class="mobile-nav__link text-decoration-none" href="{{ route('user.home') }}">
                    <i class="las la-home"></i>
                    <span>@lang('Dashboard')</span>
                </a>
            </li>

            <li class="mobile-nav__item position-relative" id="mobileMemberNav">
                <a class="mobile-nav__link" href="{{ route('member.list') }}">
                    <i class="las la-users"></i>
                    <span>@lang('Members')</span>
                <div class="partner-bubble-mobile position-absolute" style="display:none;">
                    <span>@lang('Your partner is waiting...')</span>
                </div>
                </a>
            </li>

            <li class="mobile-nav__item">
                <a class="mobile-nav__link" href="{{ route('user.interest.requests') }}">
                    <i class="la la-heart-o"></i>
                    <span>@lang('Interest Request')</span>
                </a>
            </li>

            <li class="mobile-nav__item dashboard-sidebar-show">
                <a class="mobile-nav__link" href="javascript:void(0)">
                    <i class="las la-bars"></i>
                    <span>@lang('Menu')</span>
                </a>
            </li>
        </ul>
    </div>
</div>

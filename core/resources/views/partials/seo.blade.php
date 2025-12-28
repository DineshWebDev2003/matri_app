<!-- Favicon (always included) -->
<link rel="icon" type="image/png" sizes="96x96" href="{{ asset('assets/favicon/favicon-96x96.png') }}">
<link rel="icon" type="image/png" sizes="32x32" href="{{ asset('assets/favicon/favicon-96x96.png') }}">
<link rel="shortcut icon" href="{{ asset('assets/favicon/favicon.ico') }}" type="image/x-icon">
<link rel="apple-touch-icon" href="{{ asset('assets/favicon/apple-touch-icon.png') }}">
<link rel="manifest" href="{{ asset('assets/favicon/site.webmanifest') }}">
<link rel="icon" type="image/png" sizes="192x192" href="{{ asset('assets/favicon/web-app-manifest-192x192.png') }}">
<link rel="icon" type="image/svg+xml" href="{{ asset('assets/favicon/favicon.svg') }}">

@if($seo)
    <meta name="title" Content="{{ $general->siteName(__($pageTitle)) }}">
    <meta name="description" content="{{ $seo->description }}">
    <meta name="keywords" content="{{ implode(',',$seo->keywords) }}">

    {{--<!-- Apple Stuff -->--}}
    {{-- Apple Touch Icon --}}
    <link rel="apple-touch-icon" href="{{ asset('assets/favicon/apple-touch-icon.png') }}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="{{ $general->siteName($pageTitle) }}">
    {{--<!-- Google / Search Engine Tags -->--}}
    <meta itemprop="name" content="{{ $general->siteName($pageTitle) }}">
    <meta itemprop="description" content="{{ $general->seo_description }}">
    <meta itemprop="image" content="{{ getImage(getFilePath('seo') .'/'. $seo->image) }}">
    {{--<!-- Facebook Meta Tags -->--}}
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $seo->social_title }}">
    <meta property="og:description" content="{{ $seo->social_description }}">
    <meta property="og:image" content="{{ getImage(getFilePath('seo') .'/'. $seo->image) }}"/>
    <meta property="og:image:type" content="image/{{ pathinfo(getImage(getFilePath('seo')) .'/'. $seo->image)['extension'] }}" />
    @php $socialImageSize = explode('x', getFileSize('seo')) @endphp
    <meta property="og:image:width" content="{{ $socialImageSize[0] }}" />
    <meta property="og:image:height" content="{{ $socialImageSize[1] }}" />
    <meta property="og:url" content="{{ url()->current() }}">
    {{--<!-- Twitter Meta Tags -->--}}
    <meta name="twitter:card" content="summary_large_image">
@endif

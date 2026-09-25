<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="theme-color" content="#111111" />
    <link rel="icon" href="{{ asset('favicon.ico') }}" />
    {{-- Server-rendered SEO meta tags --}}
    @if(isset($metaTitle))
      <title>{{ $metaTitle }}</title>
    @endif
    @if(isset($metaDescription))
      <meta name="description" content="{{ $metaDescription }}" data-inertia="description">
    @endif
    @if(isset($metaRobots))
      <meta name="robots" content="{{ $metaRobots }}" data-inertia="robots">
    @endif
    @if(isset($canonicalUrl))
      <link rel="canonical" href="{{ $canonicalUrl }}" data-inertia="canonical">
    @endif
    @if(isset($metaKeywords))
      <meta name="keywords" content="{{ $metaKeywords }}" data-inertia="keywords">
    @endif
    
    {{-- OpenGraph Tags --}}
    @php
      $normalizedOgImage = null;
      if (!empty($ogImage)) {
        if (filter_var($ogImage, FILTER_VALIDATE_URL)) {
          $normalizedOgImage = $ogImage;
        } elseif (str_starts_with($ogImage, '//')) {
          $normalizedOgImage = 'https:' . $ogImage;
        } elseif (str_starts_with($ogImage, '/')) {
          $normalizedOgImage = rtrim(request()->root(), '/') . $ogImage;
        } else {
          $normalizedOgImage = url($ogImage);
        }
      }
      $normalizedOgImage = $normalizedOgImage ?: asset('build/assets/hero.jpg');

      $normalizedOgUrl = null;
      if (!empty($ogUrl)) {
        $normalizedOgUrl = filter_var($ogUrl, FILTER_VALIDATE_URL) ? $ogUrl : (str_starts_with($ogUrl, '/') ? rtrim(request()->root(), '/') . $ogUrl : url($ogUrl));
      }
    @endphp
    @if(isset($ogType))
      <meta property="og:type" content="{{ $ogType }}" data-inertia="og:type">
    @endif
    @if(isset($ogTitle))
      <meta property="og:title" content="{{ $ogTitle }}" data-inertia="og:title">
    @endif
    @if(isset($ogDescription))
      <meta property="og:description" content="{{ $ogDescription }}" data-inertia="og:description">
    @endif
    @if(isset($ogImage))
      <meta property="og:image" content="{{ $normalizedOgImage }}" data-inertia="og:image">
    @endif
    @if(isset($ogUrl))
      <meta property="og:url" content="{{ $normalizedOgUrl ?? $ogUrl }}" data-inertia="og:url">
    @endif
    @if(isset($ogSiteName))
      <meta property="og:site_name" content="{{ $ogSiteName }}" data-inertia="og:site_name">
    @endif
    
    {{-- Twitter Card Tags --}}
    @if(isset($twitterCard))
      <meta name="twitter:card" content="{{ $twitterCard }}" data-inertia="twitter:card">
    @endif
    @if(isset($twitterTitle))
      <meta name="twitter:title" content="{{ $twitterTitle }}" data-inertia="twitter:title">
    @endif
    @if(isset($twitterDescription))
      <meta name="twitter:description" content="{{ $twitterDescription }}" data-inertia="twitter:description">
    @endif
    
    {{-- JSON-LD Schema --}}
    @if(isset($jsonLd))
      <script type="application/ld+json">{!! json_encode($jsonLd) !!}</script>
    @endif

    @php
      $seoSettings = \App\Models\Setting::get('seo', []);
      $gaId = $seoSettings['googleAnalyticsId'] ?? '';
    @endphp

    @if($gaId)
      <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', '{{ $gaId }}');
      </script>
    @endif
    
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
    @inertiaHead
  </head>
  <body>
    @inertia
  </body>
</html>
@php
    $content = getContent('ad_banner.content', true);
    $image = $content->data_values->banner_image ?? null;
    $targetUrl = $content->data_values->click_url ?? null;
@endphp

@if ($content && $image)
    <div class="ad-banner-modal" id="adBanner" style="display:none;">
        <div class="ad-banner-modal__backdrop"></div>
        <div class="ad-banner-modal__content">
            <button class="ad-banner-modal__close" type="button" aria-label="Close">
                <i class="las la-times"></i>
            </button>
            @if ($targetUrl)
                <a class="ad-banner-modal__image" href="{{ $targetUrl }}" target="_blank" rel="noopener">
                    <img src="{{ getImage('assets/images/frontend/ad_banner/' . $image, '900x600') }}" alt="Ad Banner">
                </a>
            @else
                <div class="ad-banner-modal__image">
                    <img src="{{ getImage('assets/images/frontend/ad_banner/' . $image, '900x600') }}" alt="Ad Banner">
                </div>
            @endif
        </div>
    </div>

    @push('style')
        <style>
            .ad-banner-modal__backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                z-index: 1040;
            }

            .ad-banner-modal__content {
                position: fixed;
                max-width: 820px;
                width: min(92vw, 820px);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
                z-index: 1041;
            }

            .ad-banner-modal__close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            .ad-banner-modal__close:hover {
                background: rgba(0, 0, 0, 0.75);
            }

            .ad-banner-modal__image {
                display: block;
                width: 100%;
            }

            .ad-banner-modal__image img {
                width: 100%;
                height: auto;
                display: block;
            }
        </style>
    @endpush

    @push('script')
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                var adModal = document.getElementById('adBanner');
                if (!adModal) return;

                var closeBtn = adModal.querySelector('.ad-banner-modal__close');
                var backdrop = adModal.querySelector('.ad-banner-modal__backdrop');
                var displayDelayMinutes = parseFloat('{{ $content->data_values->display_delay ?? 0 }}') || 0;

                function closeAdModal() {
                    adModal.style.display = 'none';
                }

                function showAdModal() {
                    adModal.style.display = 'block';
                }

                setTimeout(showAdModal, displayDelayMinutes * 60 * 1000);

                if (closeBtn) closeBtn.addEventListener('click', closeAdModal);
                if (backdrop) backdrop.addEventListener('click', closeAdModal);
            });
        </script>
    @endpush
@endif

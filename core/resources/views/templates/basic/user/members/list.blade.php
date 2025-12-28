@extends($activeTemplate . 'layouts.frontend')

@push('style')
<style>
    /* Keep Quick Search button color constant */
    .quick-search-toggle{display:block;margin:0 auto;}
    .filter-icon.btn:hover,
    .filter-icon.btn:focus {
        background-color: #e50914 !important; /* same red as btn--base */
        color: #fff !important;
    }
</style>
@endpush
@section('content')
    <!-- Search Result  -->
    <div class="section search">
        <div class="container">
            <div class="row g-4">
                <div class="col-xl-3 d-xl-block">
                    <div class="search__left">
                        <div class="search__left-btn d-xl-none d-block">
                            <i class="las la-times"></i>
                        </div>
                        <form class="form-search" action="{{ route('member.list') }}" autocomplete="off">
                            <div class="row">
                                <div class="col-sm-12">
                                    <div class="search__left-title">
                                        <h5 class="text mt-0 mb-0">@lang('Member Filter') </h5>
                                    </div>
                                </div>
                                <div class="col-sm-12">
                                    <div class="input--group">
                                        <input class="form-control form--control" id="member-id" name="member_id" type="text">
                                        <label class="form--label" for="member-id">@lang('Member ID')</label>
                                    </div>
                                </div>

                                <div class="col-md-12 mt-4">
                                    <div class="range-slider">
                                        <p>
                                            <label class="range-slider__label" for="height">@lang('Height'):</label>
                                            <input class="range-slider__number" id="height" name="height" type="text" readonly>
                                        </p>
                                        <div id="slider-range"></div>
                                    </div>
                                </div>

                                <!-- Age Range Filter -->
                                <div class="col-md-12 mt-4">
                                    <div class="range-slider">
                                        <p>
                                            <label class="range-slider__label" for="age">@lang('Age'):</label>
                                            <input class="range-slider__number" id="age" name="age" type="text" readonly>
                                        </p>
                                        <div id="age-slider-range"></div>
                                    </div>
                                </div>



                                <div class="col-sm-12 mt-4">
                                    <div class="input--group">
                                        <select class="form-control form--control" name="religion">
                                            <option value="">@lang('All')</option>
                                            @foreach ($religions as $religion)
                                                <option value="{{ $religion->name }}" data-relid="{{ $religion->id }}" @selected(request()->religion == $religion->name)>{{ __($religion->name) }}</option>
                                            @endforeach
                                        </select>
                                        <label class="form--label">@lang('Religion')</label>
                                    </div>
                                </div>

                                <!-- Caste Select -->
                                <div class="col-sm-12 mt-4">
                                    <div class="input--group">
                                        <select class="form-control form--control" id="caste" name="caste" data-old="{{ request()->caste }}">
                                            <option value="">@lang('All')</option>
                                        </select>
                                        <label class="form--label">@lang('Caste')</label>
                                    </div>
                                </div>


                            </div>
                            <input name="page" type="hidden">
                        </form>
                    </div>
                </div>
                <div class="col-xl-9 col-md-12">
                    <div class="position-relative">
                        <div class="search-overlay d-none">
                            <div class="search-overlay__inner">
                                <span class="search-overlay__spinner"></span>
                            </div>
                        </div>
                        <div class="search__left-bar mb-xl-0 d-flex justify-content-between mb-3 flex-wrap">
                            <button type="button" class="btn btn--base filter-icon d-xl-none d-block mb-3">@lang('Quick Search')</button>
                        </div>
                        <div class="row gy-4 member-wrapper">
                            @include($activeTemplate . 'partials.members')
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Search Result End -->

    <x-report-modal />
    <x-interest-express-modal />
    <x-confirmation-modal />
@endsection

@push('script')
    <script>
        (function($) {
            "use strict";

            let min = "{{ $height['min'] }}";
            let max = "{{ $height['max'] }}";

            let ageMinVal = 20;
            let ageMaxVal = 50;

            let minHeight = parseFloat(min);
            let maxHeight = Math.ceil(parseFloat(max));
            //height range
            $("#slider-range").slider({
                range: true,
                min: minHeight,
                max: maxHeight,

                values: [minHeight, maxHeight],
                slide: function(event, ui) {
                    $("#height").val("" + ui.values[0] + " - " + ui.values[1] + " Ft");
                },
                stop: function(event, ui) {
                    $('.form-search').submit();
                }
            });
            $("#height").val("" + $("#slider-range").slider("values", 0) +
                " - " + $("#slider-range").slider("values", 1) + " Ft");

            // age range
            $("#age-slider-range").slider({
                range: true,
                min: parseInt(ageMinVal),
                max: parseInt(ageMaxVal),
                values: [parseInt(ageMinVal), parseInt(ageMaxVal)],
                slide: function(event, ui) {
                    $("#age").val("" + ui.values[0] + " - " + ui.values[1] + " Years");
                },
                stop: function(event, ui) {
                    $('.form-search').submit();
                }
            });
            $("#age").val("" + $("#age-slider-range").slider("values", 0) +
                " - " + $("#age-slider-range").slider("values", 1) + " Years");

            // dynamic caste loading
            function loadCastes(relId, selected){
                const $caste = $('#caste');
                if(!relId){
                    $caste.html('<option value="">@lang('All')</option>');
                    return;
                }
                $caste.html('<option value="">@lang('Loading...')</option>');
                $.get('{{ url('castes') }}/'+encodeURIComponent(relId), function(data){
                    let opts = '<option value="">@lang('All')</option>';
                    $.each(data,function(i,n){ opts += `<option value="${n}" ${selected===n?'selected':''}>${n}</option>`; });
                    $caste.html(opts);
                });
            }

            const form = $('.form-search');
            // initial load if religion preselected
            const relSelect = form.find('select[name="religion"]');
            const getRelId = () => relSelect.find('option:selected').data('relid');
            const initialRel = getRelId();
            const initialCaste = $('#caste').data('old');
            loadCastes(initialRel, initialCaste);

            // change listener
            $(document).on('change','select[name="religion"]',function(){
                loadCastes(getRelId());
                form.submit();
            });

            // search by ajax

            form.find('.form--control').on('focusout, change', function() {
                form.find('[name=page]').val(0);
                form.submit();
            });

            $(document).on('click', '.pagination .page-link', function(e) {
                e.preventDefault();
                if ($(this).parents('.page-item').hasClass('active')) {
                    return false;
                }

                let page = $(this).attr('href').match(/page=([0-9]+)/)[1];
                form.find('[name=page]').val(page);
                form.submit();
            });

            form.on('submit', function(e) {
                e.preventDefault();
                let data = form.serialize();

                let url = form.attr('action');
                let wrapper = $('.member-wrapper');

                $.ajax({
                    type: "get",
                    url: url,
                    data: data,
                    dataType: "json",
                    beforeSend: function() {
                        $(document).find('.search-overlay').removeClass('d-none');
                    },
                    success: function(response) {
                        if (response.html) {
                            wrapper.html(response.html);
                        }
                    },
                    complete: function() {
                        $(document).find('.search-overlay').addClass('d-none');
                    },
                });

            })

        // Mobile quick search toggle
        $(document).on('click', '.quick-search-toggle', function(){
            $('.search__left').toggleClass('open');
        });

        })(jQuery);
    </script>

    <script>
        "use strict";

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

        let config = {
            routes: {
                addShortList: "{{ route('user.add.short.list') }}",
                removeShortList: "{{ route('user.remove.short.list') }}",
            },
            loadingText: {
                addShortList: "{{ trans('Shortlisting') }}",
                removeShortList: "{{ trans('Removing') }}",
                interestExpress: "{{ trans('Processing') }}",
            },
            buttonText: {
                addShortList: "{{ trans('Shortlist') }}",
                removeShortList: "{{ trans('Shortlisted') }}",
                interestExpressed: "{{ trans('Interested') }}",
                expressInterest: "{{ trans('Interest') }}",
            }
        }

        $('.express-interest-form').on('submit', function(e) {
            e.preventDefault();
            let formData = new FormData(this);
            let url = $(this).attr('action');
            let modal = $('#interestExpressModal');
            let id = modal.find('[name=interesting_id]').val();
            let li = $(`.interestExpressBtn[data-interesting_id="${id}"]`).parents('li');
            $.ajax({
                type: "post",
                url: url,
                data: formData,
                processData: false,
                contentType: false,
                beforeSend: function() {
                    $(li).find('a').html(`<i class="fas fa-heart"></i>${config.loadingText.interestExpress}..`);
                },
                success: function(response) {
                    modal.modal('hide');
                    if (response.success) {
                        notify('success', response.success);
                        li.find('a').remove();
                        li.html(`<a href="javascript:void(0)" class="base-color">
                            <i class="fas fa-heart"></i>${config.buttonText.interestExpressed}
                        </a>`);
                    } else {
                        notify('error', response.error);
                        li.html(`<a href="javascript:void(0)" class="interestExpressBtn" data-interesting_id="${id}">
                                <i class="fas fa-heart"></i>${config.buttonText.expressInterest}
                        </a>`);
                    }
                }
            });
        })
    </script>
    <script src="{{ asset($activeTemplateTrue . 'js/member.js') }}"></script>
@endpush

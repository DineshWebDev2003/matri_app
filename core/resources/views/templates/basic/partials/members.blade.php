@forelse ($members as $member)
    <div class="col-md-12">
        <div class="search__right">
            <div class="row">
                <div class="col-md-4">
                    <div class="search__right-thumb">
                        <a href="{{ route('user.member.profile.public', $member->id) }}"><img src="{{ userAvatar($member) }}" alt="@lang('Member')"></a>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="search__right-content">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="member-info d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <h5 class="member-info__name mt-0 mb-1"><a href="{{ route('user.member.profile.public', $member->id) }}"> {{ $member->fullname }}</a>
                                        </h5>
                                        <p class="member-info__id mb-0"> @lang('Member ID'):
                                            <span>
                                                {{ $member->profile_id }}
                                            </span>
                                        </p>
                                    </div>
                                    @if (@$member->limitation->package->price > 0)
                                        <span class="badge badge--green">{{ __('Premium') }}
                                        </span>
                                    @endif
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="search__right-details">
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Looking For')</span></label>
                                        <span class="col-7">
                                            @if ($member->looking_for == 1)
                                                @lang('Male')
                                            @elseif($member->looking_for == 2)
                                                @lang('Female')
                                            @endif
                                        </span>
                                    </div>
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Age')</span></label>
                                        <span class="col-7">
                                            @php
                                                if (@$member->basicInfo->birth_date) {
                                                    $age = \Carbon\Carbon::parse($member->basicInfo->birth_date)->age . ' '.__('Years');
                                                } else {
                                                    $age = __('N/A');
                                                }
                                            @endphp
                                            {{ __($age) }}
                                        </span>
                                    </div>
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Marital Status')</span></label>
                                        <span class="col-7">
                                            {{ __($member->basicInfo->marital_status ?? __('N/A')) }}
                                        </span>
                                    </div>
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Language')</span></label>
                                        <span class="col-7">
                                            @if ($member->basicInfo && count($member->basicInfo->language))
                                                {{ implode(', ', $member->basicInfo->language) }}
                                            @else
                                                @lang('N/A')
                                            @endif
                                        </span>
                                    </div>
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Profession')</span></label>
                                        <span class="col-7">
                                            {{ __(@$member->basicInfo->profession ?? __('N/A')) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="search__right-details">
                                    @if (@$member->basicInfo->gender)
                                        <div class="row member-details">
                                            <label class="col-5"><span>@lang('Gender')</span></label>
                                            <span class="col-7">
                                                @php
                                                     $g = strtolower(@$member->basicInfo->gender);
                                                     $displayGender = in_array($g,['m','male']) ? __('Male') : (in_array($g,['f','female']) ? __('Female') : __('N/A'));
                                                 @endphp
                                                 {{ $displayGender }}
                                            </span>
                                        </div>
                                    @endif
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Blood Group')</span></label>
                                        <span class="col-7">
                                            {{ __(@$member->physicalAttributes->blood_group ?? __('N/A')) }}
                                        </span>
                                    </div>
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Religion')</span></label>
                                        <span class="col-7">
                                            {{ __(@$member->basicInfo->religion ?? __('N/A')) }}
                                        </span>
                                    </div>
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Height')</span></label>
                                        <span class="col-7">
                                            {{ @$member->physicalAttributes->height ? __(@$member->physicalAttributes->height) . ' Ft.' : __('N/A') }}
                                        </span>
                                    </div>
                                    <div class="row member-details">
                                        <label class="col-5"><span>@lang('Weight')</span></label>
                                        <span class="col-7">
                                            {{ @$member->physicalAttributes->weight ? __(@$member->physicalAttributes->weight) . ' Kg' : __('N/A') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-12">
                                <div class="search__right-expression">
                                    <ul class="search__right-list m-0 p-0">
                                        <li>
                                            @if (@$user && $user->interests->where('interesting_id', $member->id)->first())
                                                <a class="base-color" href="javascript:void(0)">
                                                    <i class="fas fa-heart"></i>@lang('Interested')
                                                </a>
                                            @elseif(@$user &&
                                                $member->interests->where('interesting_id', @$user->id)->where('status', 0)->first())
                                                <a class="base-color" href="#">
                                                    <i class="fas fa-heart"></i>@lang('Response to Interest')
                                                </a>
                                            @elseif(@$user &&
                                                $member->interests->where('interesting_id', @$user->id)->where('status', 1)->first())
                                                <a class="base-color" href="#">
                                                    <i class="fas fa-heart"></i>@lang('You Accepted Interest')
                                                </a>
                                            @else
                                                <a class="interestExpressBtn" data-interesting_id="{{ $member->id }}" href="javascript:void(0)">
                                                    <i class="fas fa-heart"></i>@lang('Interest')
                                                </a>
                                            @endif
                                        </li>
                                        <li>
                                            <a class="confirmationBtn ignore" data-action="{{ route('user.ignore', $member->id) }}" data-question="@lang('Are you sure, you want to ignore this member?')" href="javascript:void(0)">
                                                <i class="fas fa-user-times text--danger"></i>@lang('Ignore')
                                            </a>
                                        </li>
                                        <li>
                                            @if (@$user && $user->shortListedProfile->where('profile_id', $member->id)->first())
                                                <a class="removeFromShortList" data-action="{{ route('user.remove.short.list') }}" data-profile_id="{{ $member->id }}" href="javascript:void(0)">
                                                    <i class="far fa-star"></i>@lang('Shortlisted')
                                                </a>
                                            @else
                                                <a class="addToShortList" data-action="{{ route('user.add.short.list') }}" data-profile_id="{{ $member->id }}" href="javascript:void(0)">
                                                    <i class="far fa-star"></i>@lang('Shortlist')
                                                </a>
                                            @endif
                                        </li>
                                        <li>
                                            @php
                                                $report = $user ? $user->reports->where('complaint_id', $member->id)->first() : null;
                                            @endphp
                                            @if (@$user && $report)
                                                <a class="text--danger reportedUser" data-report_reason="{{ __($report->reason) }}" data-report_title="{{ __($report->title) }}" href="javascript:void(0)">
                                                    <i class="fas fa-info-circle"></i>@lang('Reported')
                                                </a>
                                            @else
                                                <a href="javascript:void(0)" onclick="showReportModal({{ $member->id }})">
                                                    <i class="fas fa-info-circle"></i>@lang('Report')
                                                </a>
                                            @endif

                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@empty
    <div class="col-md-12">
        <div class="search__right">
            <div class="row">
                <div class="empty-table text-center">
                    <div class="empty-table__icon">
                        <i class="las la-frown"></i>
                    </div>
                    <h6 class="empty-table__text mt-1">{{ __($emptyMessage) }}</h6>
                </div>
            </div>
        </div>
    </div>
@endforelse

@if ($members->hasPages())
    <div class="mt-3">
        @if(isset($userType) && $userType!='premium')
            <ul class="pagination justify-content-center">
                {{-- Previous Btn --}}
                <li class="page-item {{ $members->onFirstPage() ? 'disabled' : '' }}">
                    <a class="page-link" href="{{ $members->previousPageUrl() ?? 'javascript:void(0)' }}" tabindex="-1">&laquo;</a>
                </li>

                {{-- First 1-5 --}}
                @for($i=1; $i<=min(5,$members->lastPage()); $i++)
                    <li class="page-item {{ $i==$members->currentPage() ? 'active' : '' }}">
                        <a class="page-link" href="{{ $members->url($i) }}">{{ $i }}</a>
                    </li>
                @endfor

                {{-- Ellipsis & last page number (hidden content) --}}
                @php $shouldShowLocked = (isset($userType) && $userType!='premium') ? true : ($members->lastPage() > 5); @endphp
                @if($shouldShowLocked)
                    <li class="page-item">
                        <a class="page-link buy-membership" href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#buyMembershipModal">...</a>
                    </li>
                    <li class="page-item">
                        <a class="page-link buy-membership" href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#buyMembershipModal">
                            {{ isset($userType) && $userType!='premium' ? 896 : $members->lastPage() }}
                        </a>
                    </li>
                @endif

                {{-- Next Btn --}}
                @php
                    $nextDisabled = $members->currentPage() >= 5 || $members->currentPage() == $members->lastPage();
                @endphp
                <li class="page-item {{ $nextDisabled ? '' : '' }}">
                    @if($nextDisabled)
                        <a class="page-link buy-membership" href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#buyMembershipModal">&raquo;</a>
                    @else
                        <a class="page-link" href="{{ $members->nextPageUrl() }}">&raquo;</a>
                    @endif
                </li>
            </ul>
        @else
            {{ paginateLinks($members) }}
        @endif
    </div>
@endif
<x-report-show-modal />

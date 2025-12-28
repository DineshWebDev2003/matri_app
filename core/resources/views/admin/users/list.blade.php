@extends('admin.layouts.app')
@section('panel')
    <div class="row">
        <div class="col-lg-12">
            <div class="card b-radius--10">
                <div class="card-body p-0">
                    <div class="table-responsive--md table-responsive">
                        <table class="table--light style--two table">
                            <thead>
                                <tr>
                                    <th>@lang('User')</th>
                                    <th>@lang('Email-Phone')</th>
                                    <th>@lang('Country')</th>
                                    <th>@lang('Joined At')</th>
                                    <th>@lang('Balance')</th>
                                    <th>@lang('Action')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($users as $user)
                                    <tr>
                                        <td>
                                            <span class="fw-bold">{{ $user->fullname }}</span>
                                            <br>
                                            <span class="small">
                                                <a href="{{ route('admin.users.detail', $user->id) }}"><span>@</span>{{ $user->username }}</a>
                                            </span>
                                        </td>

                                        <td>
                                            {{ $user->email }}<br>{{ $user->mobile }}
                                        </td>
                                        <td>
                                            <span class="fw-bold" title="{{ @$user->address->country }}">{{ $user->country_code }}</span>
                                        </td>

                                        <td>
                                            {{ showDateTime($user->created_at) }} <br> {{ diffForHumans($user->created_at) }}
                                        </td>

                                        <td>
                                            <span class="fw-bold">

                                                {{ $general->cur_sym }}{{ showAmount($user->balance) }}
                                            </span>
                                        </td>

                                        <td>
                                            <div class="button--group">
                                                <a class="btn btn-sm btn-outline--primary" href="{{ route('admin.users.detail', $user->id) }}">
                                                    <i class="las la-desktop"></i> @lang('Details')
                                                </a>
                                                @if (request()->routeIs('admin.users.kyc.pending'))
                                                    <a class="btn btn-sm btn-outline--dark" href="{{ route('admin.users.kyc.details', $user->id) }}" target="_blank">
                                                        <i class="las la-user-check"></i>@lang('KYC Data')
                                                    </a>
                                                @endif
                                                @if ($user->ev == 0)
                                                    <!-- Confirm Email Button -->
                                                    <button type="button" class="btn btn-sm btn-outline--success" data-bs-toggle="modal" data-bs-target="#confirmEmailModal-{{ $user->id }}">
                                                        <i class="las la-envelope"></i> @lang('Confirm Email')
                                                    </button>
                                                    <!-- Modal -->
                                                    <div class="modal fade" id="confirmEmailModal-{{ $user->id }}" tabindex="-1" aria-labelledby="confirmEmailModalLabel-{{ $user->id }}" aria-hidden="true">
                                                        <div class="modal-dialog">
                                                            <div class="modal-content">
                                                                <div class="modal-header">
                                                                    <h5 class="modal-title" id="confirmEmailModalLabel-{{ $user->id }}">@lang('Send Confirmation Email')</h5>
                                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                                </div>
                                                                <div class="modal-body">
                                                                    @lang('Are you sure you want to send a confirmation email to this user?')
                                                                </div>
                                                                <div class="modal-footer">
                                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">@lang('Cancel')</button>
                                                                    <form method="POST" action="{{ route('admin.users.send-confirmation-email', $user->id) }}" class="d-inline">
                                                                        @csrf
                                                                        <button type="submit" class="btn btn--success">@lang('Send Email')</button>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                @endif
                                            </div>
                                        </td>

                                    </tr>
                                @empty
                                    <tr>
                                        <td class="text-muted text-center" colspan="100%">{{ __($emptyMessage) }}</td>
                                    </tr>
                                @endforelse

                            </tbody>
                        </table><!-- table end -->
                    </div>
                </div>
                @if ($users->hasPages())
                    <div class="card-footer py-4">
                        {{ paginateLinks($users) }}
                    </div>
                @endif
            </div>
        </div>

    </div>
@endsection

@push('breadcrumb-plugins')
    <x-search-form placeholder="Username / Email" />
@endpush

@if(session('success'))
    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="successModalLabel">@lang('Email Confirmation')</h5>
                </div>
                <div class="modal-body">
                    {{ session('success') }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn--primary" data-bs-dismiss="modal">@lang('Okay')</button>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        });
    </script>
@endif

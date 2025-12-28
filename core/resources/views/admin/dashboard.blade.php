@extends('admin.layouts.app')

@section('panel')
    {{-- New Version Available banner removed --}}
    @if (@json_decode($general->system_info)->message)
        <div class="row">
            @foreach (json_decode($general->system_info)->message as $msg)
                <div class="col-md-12">
                    <div class="alert border--primary border" role="alert">
                        <div class="alert__icon bg--primary"><i class="far fa-bell"></i></div>
                        <p class="alert__message">@php echo $msg; @endphp</p>
                        <button class="close" data-bs-dismiss="alert" type="button" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    <div class="row gy-4">
        <div class="col-xxl-3 col-sm-6">
            <x-widget
                value="{{ $widget['total_users'] }}" title="Total Users" link="{{ route('admin.users.index') }}" icon="las la-users f-size--56" bg="primary" />
        </div>

        <div class="col-xxl-3 col-sm-6">
            <x-widget
                value="{{ $widget['unapproved_users'] }}" title="Unapproved Users" link="{{ route('admin.users.index', ['status' => 'unapproved']) }}" icon="las la-user-times f-size--56" bg="warning" />
        </div>
        <div class="col-xxl-3 col-sm-6">
            <x-widget
                value="{{ $widget['approved_users'] }}" title="Approved Users" link="{{ route('admin.users.index', ['status' => 'active']) }}" icon="las la-user-check f-size--56" bg="success" />
        </div>
        <div class="col-xxl-3 col-sm-6">
            <x-widget
                value="{{ $widget['paid_users'] }}" title="Paid Users" link="{{ route('admin.report.purchase.history') }}" icon="las la-money-bill-wave f-size--56" bg="primary" />
        </div>
    </div><!-- row end-->

    <div class="row gy-4 mt-2">
        <div class="col-xxl-3 col-sm-6">
            <x-widget-2
                value="{{ $general->cur_sym }}{{ showAmount($deposit['total_deposit_amount']) }}" title="Total Payment" link="{{ route('admin.deposit.list') }}" icon="las la-hand-holding-usd" icon_style="false" color="success" />
        </div>
        <div class="col-xxl-3 col-sm-6">
            <x-widget-2
                value="{{ $general->cur_sym }}{{ showAmount($deposit['total_deposit_pending']) }}" title="Pending Payments" link="{{ route('admin.deposit.pending') }}" icon="las la-spinner" icon_style="false" color="warning" />
        </div>
        <div class="col-xxl-3 col-sm-6">
            <x-widget-2
                value="{{ $general->cur_sym }}{{ showAmount($deposit['total_deposit_rejected']) }}" title="Rejected Payments" link="{{ route('admin.deposit.rejected') }}" icon="las la-ban" icon_style="false" color="danger" />
        </div>
        <div class="col-xxl-3 col-sm-6">
            <x-widget-2
                value="{{ $general->cur_sym }}{{ showAmount($deposit['total_deposit_charge']) }}" title="Payment Charge" link="{{ route('admin.deposit.rejected') }}" icon="las la-percentage" icon_style="false" color="primary" />
        </div>
    </div><!-- row end-->

    <div class="row gy-4 mt-2">
        <div class="col-xxl-3 col-sm-6">
            <x-widget-2
                value="{{ $general->cur_sym }}{{ showAmount($widget['purchasedAmount']) }}" title="Purchased Package" link="{{ route('admin.report.purchase.history') }}" icon="las la-cubes" icon_style="false" color="primary" />
        </div>
        <div class="col-xxl-3 col-sm-6">
            <x-widget-2
                value="{{ showAmount($widget['totalInterests']) }}" title="Total Interests" link="{{ route('admin.user.interests') }}" icon="las la-heart" icon_style="false" color="info" />
        </div>
        <div class="col-xxl-3 col-sm-6">
            <x-widget-2
                value="{{ showAmount($widget['totalIgnoredProfiles']) }}" title="Ignored Profiles" link="{{ route('admin.user.ignored.profile') }}" icon="las la-heart-broken" icon_style="false" color="warning" />
        </div>
        <div class="col-xxl-3 col-sm-6">
            <x-widget-2
                value="{{ showAmount($widget['totalReports']) }}" title="Reports" link="{{ route('admin.user.reports') }}" icon="las la-exclamation-triangle" icon_style="false" color="danger" />
        </div>
    </div><!-- row end-->

    <div class="row mb-none-30 mt-5">
        <div class="col-xl-4 col-lg-6 mb-30">
            <div class="card overflow-hidden">
                <div class="card-body">
                    <h5 class="card-title">@lang('Login By Browser') (@lang('Last 30 days'))</h5>
                    <canvas id="userBrowserChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-xl-4 col-lg-6 mb-30">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">@lang('Login By OS') (@lang('Last 30 days'))</h5>
                    <canvas id="userOsChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-xl-4 col-lg-6 mb-30">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">@lang('Login By Country') (@lang('Last 30 days'))</h5>
                    <canvas id="userCountryChart"></canvas>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('script')
    <script src="{{ asset('assets/admin/js/vendor/apexcharts.min.js') }}"></script>
    <script src="{{ asset('assets/admin/js/vendor/chart.js.2.8.0.js') }}"></script>

    <script>
        "use strict";

        var ctx = document.getElementById('userBrowserChart');
        var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: @json($chart['user_browser_counter']->keys()),
                datasets: [{
                    data: {{ $chart['user_browser_counter']->flatten() }},
                    backgroundColor: [
                        '#ff7675',
                        '#6c5ce7',
                        '#ffa62b',
                        '#ffeaa7',
                        '#D980FA',
                        '#fccbcb',
                        '#45aaf2',
                        '#05dfd7',
                        '#FF00F6',
                        '#1e90ff',
                        '#2ed573',
                        '#eccc68',
                        '#ff5200',
                        '#cd84f1',
                        '#7efff5',
                        '#7158e2',
                        '#fff200',
                        '#ff9ff3',
                        '#08ffc8',
                        '#3742fa',
                        '#1089ff',
                        '#70FF61',
                        '#bf9fee',
                        '#574b90'
                    ],
                    borderColor: [
                        'rgba(231, 80, 90, 0.75)'
                    ],
                    borderWidth: 0,

                }]
            },
            options: {
                aspectRatio: 1,
                responsive: true,
                maintainAspectRatio: true,
                elements: {
                    line: {
                        tension: 0 // disables bezier curves
                    }
                },
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                        display: false
                    }]
                },
                legend: {
                    display: false,
                }
            }
        });



        var ctx = document.getElementById('userOsChart');
        var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: @json($chart['user_os_counter']->keys()),
                datasets: [{
                    data: {{ $chart['user_os_counter']->flatten() }},
                    backgroundColor: [
                        '#ff7675',
                        '#6c5ce7',
                        '#ffa62b',
                        '#ffeaa7',
                        '#D980FA',
                        '#fccbcb',
                        '#45aaf2',
                        '#05dfd7',
                        '#FF00F6',
                        '#1e90ff',
                        '#2ed573',
                        '#eccc68',
                        '#ff5200',
                        '#cd84f1',
                        '#7efff5',
                        '#7158e2',
                        '#fff200',
                        '#ff9ff3',
                        '#08ffc8',
                        '#3742fa',
                        '#1089ff',
                        '#70FF61',
                        '#bf9fee',
                        '#574b90'
                    ],
                    borderColor: [
                        'rgba(0, 0, 0, 0.05)'
                    ],
                    borderWidth: 0,

                }]
            },
            options: {
                aspectRatio: 1,
                responsive: true,
                elements: {
                    line: {
                        tension: 0 // disables bezier curves
                    }
                },
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                        display: false
                    }]
                },
                legend: {
                    display: false,
                }
            },
        });


        // Donut chart
        var ctx = document.getElementById('userCountryChart');
        var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: @json($chart['user_country_counter']->keys()),
                datasets: [{
                    data: {{ $chart['user_country_counter']->flatten() }},
                    backgroundColor: [
                        '#ff7675',
                        '#6c5ce7',
                        '#ffa62b',
                        '#ffeaa7',
                        '#D980FA',
                        '#fccbcb',
                        '#45aaf2',
                        '#05dfd7',
                        '#FF00F6',
                        '#1e90ff',
                        '#2ed573',
                        '#eccc68',
                        '#ff5200',
                        '#cd84f1',
                        '#7efff5',
                        '#7158e2',
                        '#fff200',
                        '#ff9ff3',
                        '#08ffc8',
                        '#3742fa',
                        '#1089ff',
                        '#70FF61',
                        '#bf9fee',
                        '#574b90'
                    ],
                    borderColor: [
                        'rgba(231, 80, 90, 0.75)'
                    ],
                    borderWidth: 0,

                }]
            },
            options: {
                aspectRatio: 1,
                responsive: true,
                elements: {
                    line: {
                        tension: 0 // disables bezier curves
                    }
                },
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                        display: false
                    }]
                },
                legend: {
                    display: false,
                }
            }
        });
    </script>
@endpush

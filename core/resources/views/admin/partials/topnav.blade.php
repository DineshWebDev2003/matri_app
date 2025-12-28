<!-- navbar-wrapper start -->
<nav class="navbar-wrapper bg--dark">
    <div class="navbar__left">
        <button class="res-sidebar-open-btn me-3" type="button"><i class="las la-bars"></i></button>
        <form class="navbar-search">
            <input class="navbar-search-field" id="searchInput" name="#0" type="search" autocomplete="off" placeholder="@lang('Search here...')">
            <i class="las la-search"></i>
            <ul class="search-list"></ul>
        </form>
    </div>
    <div class="navbar__right">
        <ul class="navbar__action-list">

            <li>
                <form method="POST" action="{{ route('admin.quick-cache-clear') }}" class="d-inline">
                    @csrf
                    <input type="hidden" name="action" value="clear-cache">
                    <button type="submit" class="btn btn-sm btn--primary me-3">
                        <i class="las la-broom"></i> @lang('Clear Cache')
                    </button>
                </form>
            </li>

            <li class="dropdown">
                <button class="primary--layer" data-bs-toggle="dropdown" data-display="static" type="button" aria-haspopup="true" aria-expanded="false">
                    <i class="las la-bell text--primary @if ($adminNotificationCount > 0) icon-left-right @endif"></i>
                </button>
                <div class="dropdown-menu dropdown-menu--md box--shadow1 dropdown-menu-right border-0 p-0">
                    <div class="dropdown-menu__header">
                        <span class="caption">@lang('Notification')</span>
                        @if ($adminNotificationCount > 0)
                            <p>@lang('You have') {{ $adminNotificationCount }} @lang('unread notification')</p>
                        @else
                            <p>@lang('No unread notification found')</p>
                        @endif
                    </div>
                    <div class="dropdown-menu__body">
                        @foreach ($adminNotifications as $notification)
                            <a class="dropdown-menu__item" href="{{ route('admin.notification.read', $notification->id) }}">
                                <div class="navbar-notifi">
                                    <div class="navbar-notifi__left bg--green b-radius--rounded"><img
                                            src="{{ getImage(getFilePath('userProfile') . '/' . @$notification->user->image, getFileSize('userProfile')) }}" alt="@lang('Profile Image')"></div>
                                    <div class="navbar-notifi__right">
                                        <h6 class="notifi__title">{{ __($notification->title) }}</h6>
                                        <span class="time"><i class="far fa-clock"></i>
                                            {{ $notification->created_at->diffForHumans() }}</span>
                                    </div>
                                </div><!-- navbar-notifi end -->
                            </a>
                        @endforeach
                    </div>
                    <div class="dropdown-menu__footer">
                        <a class="view-all-message" href="{{ route('admin.notifications') }}">@lang('View all notification')</a>
                    </div>
                </div>
            </li>

            <li class="dropdown">
                <button class="" data-bs-toggle="dropdown" data-display="static" type="button" aria-haspopup="true" aria-expanded="false">
                    <span class="navbar-user">
                        <span class="navbar-user__thumb"><img
                                src="{{ getImage('assets/admin/images/profile/' .auth()->guard('admin')->user()->image) }}" alt="image"></span>
                        <span class="navbar-user__info">
                            <span
                                class="navbar-user__name">{{ auth()->guard('admin')->user()->username }}</span>
                        </span>
                        <span class="icon"><i class="las la-chevron-circle-down"></i></span>
                    </span>
                </button>
                <div class="dropdown-menu dropdown-menu--sm box--shadow1 dropdown-menu-right border-0 p-0">
                    <a class="dropdown-menu__item d-flex align-items-center px-3 py-2" href="{{ route('admin.profile') }}">
                        <i class="dropdown-menu__icon las la-user-circle"></i>
                        <span class="dropdown-menu__caption">@lang('Profile')</span>
                    </a>

                    <a class="dropdown-menu__item d-flex align-items-center px-3 py-2" href="{{ route('admin.password') }}">
                        <i class="dropdown-menu__icon las la-key"></i>
                        <span class="dropdown-menu__caption">@lang('Password')</span>
                    </a>

                    <a class="dropdown-menu__item d-flex align-items-center px-3 py-2" href="{{ route('admin.logout') }}">
                        <i class="dropdown-menu__icon las la-sign-out-alt"></i>
                        <span class="dropdown-menu__caption">@lang('Logout')</span>
                    </a>
                </div>
            </li>
        </ul>
    </div>
</nav>
<!-- navbar-wrapper end -->

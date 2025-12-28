
@extends('admin.layouts.app')

@section('panel')
<div class="card b-radius--10">
    <div class="card-body">
        
        <div class="row">
            @forelse($users as $user)
                <div class="col-12 mb-4">
                    <div class="card shadow-sm p-4" style="border-radius:12px; background:#fff; font-family:'Inter','Roboto',Arial,sans-serif;">
                        <div class="row g-0 align-items-center">
                            <div class="col-md-2 text-center d-flex flex-column align-items-center justify-content-center" style="padding-right:0;">
                                <img src="{{ $user->image ? getImage(getFilePath('userProfile').'/'.$user->image, getFileSize('userProfile')) : asset('assets/images/avatar.png') }}" class="rounded" width="120" height="120" alt="Photo" style="object-fit:cover; background:#f5f5f5; border:2px solid #e0e0e0; margin-bottom:10px;">
                            </div>
                            <div class="col-md-10" style="padding-left:24px;">
                                <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <div>
                                        <h5 class="mb-1">{{ $user->fullname ?? $user->username }}</h5>
                                        <p class="mb-0 text-muted">{{ $user->email }}</p>
                                        <p class="mb-0 text-muted">{{ $user->mobile }}</p>
                                        <p class="mb-0 text-muted">@lang('Plan'): {{ optional($user->limitation->package)->name ?? __('None') }}</p>
                                    </div>
                                    @admincan('users.change-membership.edit')
                                        <button class="btn btn--primary btn-sm cuModalBtn" data-bs-toggle="modal" data-bs-target="#planModal" data-modal_title="@lang('Change Plan for :user', ['user'=>$user->username])" data-user_id="{{ $user->id }}" data-current_package="{{ optional($user->limitation->package)->id }}"
                                            data-name="{{ $user->fullname ?? $user->username }}"
                                            data-email="{{ $user->email }}"
                                            data-mobile="{{ $user->mobile }}"
                                            data-photo="{{ $user->image ? getImage(getFilePath('userProfile').'/'.$user->image, getFileSize('userProfile')) : asset('assets/images/avatar.png') }}">@lang('Change Plan')</button>
                                    @endadmincan
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="col-12 text-center">
                    <p class="text-muted">@lang('No users found')</p>
                </div>
            @endforelse
        </div>

        @if($users->hasPages())
            <div class="card-footer py-4">
                {{ $users->links('pagination::bootstrap-4') }}
            </div>
        @endif
    </div>
</div>

{{-- Change Plan MODAL --}}
@admincan('users.change-membership.edit')
<div class="modal fade" id="planModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"></h5>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            </div>
            <form method="POST" id="planForm">
                @csrf
                <div class="modal-body">
                    <div class="d-flex mb-4 align-items-center gap-3">
                        <img id="modalUserImg" src="" class="rounded" width="80" height="80" style="object-fit:cover;background:#f5f5f5;border:2px solid #e0e0e0;">
                        <div>
                            <h6 id="modalUserName" class="mb-1"></h6>
                            <p id="modalUserEmail" class="mb-0 text-muted"></p>
                            <p id="modalUserMobile" class="mb-0 text-muted"></p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>@lang('Select Package')</label>
                        <select name="package_id" class="form-select" required>
                            @foreach($packages as $package)
                                <option value="{{ $package->id }}">{{ $package->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label>@lang('Payment Mode')</label>
                        <select name="payment_mode" class="form-select" required>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>@lang('Payment Note')</label>
                        <textarea name="payment_note" class="form-control" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn--primary w-100 h-45">@lang('Update')</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endadmincan
@endsection

@push('breadcrumb-plugins')
    <form method="GET" action="" class="d-inline-block me-2">
        <div class="input-group input-group-sm">
            <input type="text" name="search" value="{{ request('search') }}" class="form-control" placeholder="@lang('Search user...')">
            <button class="btn btn--primary" type="submit"><i class="la la-search"></i></button>
        </div>
    </form>
    <form method="GET" action="" class="d-inline-block">
        <input type="hidden" name="search" value="{{ request('search') }}">
        <select name="package" onchange="this.form.submit()" class="form-select form-select-sm">
            <option value="">@lang('Filter by Package')</option>
            @foreach($packages as $package)
                <option value="{{ $package->id }}" @selected(request('package')==$package->id)>{{ $package->name }}</option>
            @endforeach
        </select>
    </form>
@endpush

@push('script')
<script>
    (function ($){
        'use strict';
        const planModal = $('#planModal');
        planModal.on('show.bs.modal', function (event){
            const button = $(event.relatedTarget); // Button that triggered the modal
            if(!button.length) return;
            const userId = button.data('user_id');
            const currentPackage = button.data('current_package');
            const actionUrl = "{{ route('admin.users.change-plan', ':id') }}".replace(':id', userId);
            $('#planForm').attr('action', actionUrl);
            $('#planForm select[name="package_id"]').val(currentPackage);
            $('#modalUserName').text(button.data('name'));
            $('#modalUserEmail').text(button.data('email'));
            $('#modalUserMobile').text(button.data('mobile'));
            $('#modalUserImg').attr('src', button.data('photo'));
            planModal.find('.modal-title').text(button.data('modal_title'));
        });
    })(jQuery);
</script>
@endpush

@extends('admin.layouts.app')
@section('panel')
<div class="d-flex justify-content-between align-items-center mb-2">
    <h4 class="mb-0">@lang('Showcase Members')</h4>
    <span class="badge bg--primary">@lang('Now Showcased'): {{ $showcaseCount }}/40</span>
</div>

<div class="row justify-content-center">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-body">
                <form class="row mb-3" method="get">
                    <div class="col-md-4">
                        <input type="text" name="search" class="form-control" placeholder="Search name or ID" value="{{ $search }}">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn--primary w-100"><i class="las la-search"></i> Search</button>
                    </div>
                </form>

                <div class="table-responsive">
                    <table class="table cmn--table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Profile ID</th>
                                <th>Email</th>
                                <th>Showcased</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($users as $u)
                                <tr>
                                    <td>
                                        <span class="d-flex align-items-center">
                                            <img src="{{ getImage(getFilePath('userProfile').'/'.$u->image,null,'user') }}" class="rounded-circle me-2" width="40"/>
                                            {{ $u->fullname }}
                                        </span>
                                    </td>
                                    <td>{{ $u->profile_id }}</td>
                                    <td>{{ $u->email }}</td>
                                    <td>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input showcase-toggle" data-id="{{ $u->id }}" type="checkbox" {{ $u->is_showcased ? 'checked' : '' }}>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="4" class="text-center">@lang('No users found')</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                {{ paginateLinks($users) }}
            </div>
        </div>
    </div>
</div>
@endsection

@push('script')
<script>
    (function($){
        'use strict';
        $('.showcase-toggle').on('change', function(){
            let el = $(this);
            let id = el.data('id');
            $.post("{{ url('admin/showcase/toggle') }}/"+id, {_token: "{{ csrf_token() }}"}, function(res){
                if(res.success){
                    notify('success','Updated');
                }
            });
        });
    })(jQuery);
</script>
@endpush

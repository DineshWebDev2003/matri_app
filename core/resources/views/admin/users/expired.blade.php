@extends('admin.layouts.app')
@section('panel')
<div class="card">
    <div class="card-body">
        <div class="row mb-3 align-items-center">
            <div class="col-md-8">
                <form class="d-flex">
                    <input type="text" class="form-control me-2" placeholder="Search expired members...">
                    <button class="btn btn--base" type="submit"><i class="las la-search"></i></button>
                </form>
            </div>
            <div class="col-md-4 text-end">
                <button class="btn btn--info"><i class="las la-filter"></i> Filter</button>
            </div>
        </div>
        <div class="row">
            @forelse($users as $user)
            <div class="col-12 mb-4">
                <div class="card shadow-sm p-4" style="border-radius:12px; background:#fff; font-family:'Inter','Roboto',Arial,sans-serif;">
                    <div class="card-body">
                        <div class="row g-0 align-items-center">
                            <div class="col-md-2 text-center d-flex flex-column align-items-center justify-content-center" style="padding-right:0;">
                                <img src="{{ $user->image ? getImage(getFilePath('userProfile').'/'.$user->image, getFileSize('userProfile')) : asset('assets/images/avatar.png') }}" class="rounded" width="120" height="120" alt="Photo" style="object-fit:cover; background:#f5f5f5; border:2px solid #e0e0e0; margin-bottom:10px;">
                            </div>
                            <div class="col-md-8">
                                <div class="fw-bold">{{ $user->fullname ?? $user->username }}</div>
                                <div class="small text-muted">{{ $user->profile_id }}</div>
                                <div class="small text-muted">{{ optional($user->basicInfo)->gender ?? 'N/A' }} | {{ $user->mobile }}</div>
                            </div>
                            <div class="col-md-2 text-end">
                                <span class="badge bg-danger">Expired</span>
                            </div>
                        </div>
                        <div class="mb-2">
                            <span class="me-2"><i class="las la-crown"></i> {{ optional($user->limitation->package)->name ?? __('No Plan') }}</span>
                        </div>
                        <div class="d-flex gap-2 mt-2">
                            <a href="{{ route('admin.users.view-profile', $user->id) }}" class="btn btn--info btn-sm">View Profile</a>
                            <a href="{{ route('admin.users.edit', $user->id) }}" class="btn btn--primary btn-sm">Edit Profile</a>
                            <a href="{{ route('admin.users.view-comments', $user->id) }}" class="btn btn--dark btn-sm">Add/View Comment</a>
                        </div>
                    </div>
                </div>
            </div>
            @empty
            <p class="text-center">No expired members found</p>
            @endforelse
        </div>
        <div class="row mb-3">
            <div class="col-md-6">
                <div class="d-flex align-items-center">
                    <label class="me-2">Show</label>
                    <form method="get" class="d-inline-block">
                        <select name="per_page" class="form-select w-auto d-inline" onchange="this.form.submit()">
                            <option value="10" {{ request('per_page') == 10 ? 'selected' : '' }}>10</option>
                            <option value="25" {{ request('per_page') == 25 ? 'selected' : '' }}>25</option>
                            <option value="50" {{ request('per_page') == 50 ? 'selected' : '' }}>50</option>
                        </select>
                    </form>
                    <label class="ms-2">Entries</label>
                </div>
            </div>
        </div>
        <div class="mt-4 d-flex justify-content-center">
            {{ $users->links('pagination::bootstrap-4') }}
            {{-- Laravel pagination rendered above --}}
        </div>
    </div>
</div>
@endsection 
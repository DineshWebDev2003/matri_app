@extends($activeTemplate . 'layouts.master')

@section('content')
    <div class="col-md-12">
        <div class="card custom--card">
            <div class="card-body pt-3">
                <div class="card-wrapper mb-3"></div>
                <form action="{{ route('user.kyc.submit') }}" method="post" enctype="multipart/form-data">
                    @csrf
                    <div class="row gy-3">
                        <x-viser-form identifier="act" identifierValue="kyc" />
                    </div>
                    <div class="form-group mt-3">
                        <button class="btn btn--base w-100" type="submit">@lang('Submit')</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

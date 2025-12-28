@extends($activeTemplate . 'layouts.frontend')
@section('content')
    <div class="section">
        <div class="container">
            <div class="faq-bg">
                @php
                    echo $cookie->data_values->description;
                @endphp
            </div>
        </div>
    </div>
@endsection

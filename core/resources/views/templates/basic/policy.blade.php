@extends($activeTemplate . 'layouts.frontend')
@section('content')
    <div class="section">
        <div class="container">
            @php
                echo $policy->data_values->details;
            @endphp

            @php
                use Illuminate\Support\Str;
            @endphp

            @if(Str::contains(strtolower($pageTitle), ['terms', 'purchase']))
                <hr class="my-4">
                <h3 class="mb-3">Refund Policy</h3>
                <h5 class="fw-bold">Do we offer refunds?</h5>
                <p>All purchases made on 90’s Kalyanam are <strong>non-refundable</strong>. Once a user subscribes to a package and the payment is processed, we do not provide any refund under any circumstances.</p>
                <p>Please review all package details and terms before proceeding with payment. If you have any queries or need clarification, feel free to reach out to our support team before making a purchase.</p>
            @endif
        </div>
    </div>
@endsection

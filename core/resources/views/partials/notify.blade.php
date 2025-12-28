<link rel="stylesheet" href="{{ asset('assets/global/css/iziToast.min.css') }}">
<script src="{{ asset('assets/global/js/iziToast.min.js') }}"></script>
@php
    $__succ = session()->pull('success');
@endphp
@if($__succ)
    <script>
        "use strict";
        iziToast.success({
            message: @json($__succ),
            position: "topRight"
        });
    </script>
@endif
@if (session()->has('error'))
    <script>
        "use strict";
        iziToast.error({
            message: @json(session('error')),
            position: "topRight"
        });
    </script>
@endif

@if (session()->has('notify'))
    @foreach (session('notify') as $msg)
        <script>
            "use strict";
            iziToast.{{ $msg[0] }}({
                message: "{{ __($msg[1]) }}",
                position: "topRight"
            });
        </script>
    @endforeach
@endif

@if (isset($errors) && $errors->any())
    @php
        $collection = collect($errors->all());
        $errors = $collection->unique();
    @endphp

    <script>
        "use strict";
        @foreach ($errors as $error)
            iziToast.error({
                message: '{{ __($error) }}',
                position: "topRight"
            });
        @endforeach
    </script>
@endif
<script>
    "use strict";

    function notify(status, message) {
        if (typeof message == 'string') {
            iziToast[status]({
                message: message,
                position: "topRight"
            });
        } else {
            $.each(message, function(i, val) {
                iziToast[status]({
                    message: val,
                    position: "topRight"
                });
            });
        }
    }
</script>

@foreach ($formData as $data)
    <div class="input--group">
        @if ($data->type == 'text')
            <input class="form-control form--control" name="{{ $data->label }}" type="text" value="{{ old($data->label) }}" @if ($data->is_required == 'required') required @endif>
        @elseif($data->type == 'textarea')
            <textarea class="form-control form--control" name="{{ $data->label }}" @if ($data->is_required == 'required') required @endif>{{ old($data->label) }}</textarea>
        @elseif($data->type == 'select')
            <select class="form-control form--control" name="{{ $data->label }}" @if ($data->is_required == 'required') required @endif>
                <option value="">@lang('Select One')</option>
                @foreach ($data->options as $item)
                    <option value="{{ $item }}" @selected($item == old($data->label))>{{ __($item) }}</option>
                @endforeach
            </select>
        @elseif($data->type == 'checkbox')
            @foreach ($data->options as $option)
                <div class="form-check">
                    <input class="form-check-input" id="{{ $data->label }}_{{ titleToKey($option) }}" name="{{ $data->label }}[]" type="checkbox" value="{{ $option }}">
                    <label class="form-check-label" for="{{ $data->label }}_{{ titleToKey($option) }}">{{ $option }}</label>
                </div>
            @endforeach
        @elseif($data->type == 'radio')
            @foreach ($data->options as $option)
                <div class="form-check">
                    <input class="form-check-input" id="{{ $data->label }}_{{ titleToKey($option) }}" name="{{ $data->label }}" type="radio" value="{{ $option }}" @checked($option == old($data->label))>
                    <label class="form-check-label" for="{{ $data->label }}_{{ titleToKey($option) }}">{{ $option }}</label>
                </div>
            @endforeach
        @elseif($data->type == 'file')
            <input class="form-control form--control" name="{{ $data->label }}" type="file" @if ($data->is_required == 'required') required @endif accept="@foreach (explode(',', $data->extensions) as $ext) .{{ $ext }}, @endforeach">
            <pre class="text--base mt-1">@lang('Supported mimes'): {{ $data->extensions }}</pre>
        @endif
        @if ($data->type == 'text')
            <label class="form--label">{{ __($data->name) }}</label>
        @endif
    </div>
@endforeach

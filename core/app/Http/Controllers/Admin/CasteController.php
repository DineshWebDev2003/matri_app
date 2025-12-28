<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CasteInfo;
use App\Models\CasteInfo as Caste;
use App\Models\ReligionInfo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CasteController extends Controller
{
    /**
     * Display a listing of the castes.
     */
    public function index()
    {
        $pageTitle     = 'All Castes';
        $castes        = CasteInfo::with('religion')->get();
        $religions     = ReligionInfo::all();
        $emptyMessage  = 'No caste added yet';

        return view('admin.caste_info', compact('pageTitle', 'castes', 'religions', 'emptyMessage'));
    }

    /**
     * Store or update a caste.
     */
    public function save(Request $request, $id = 0)
    {
        $request->validate([
            'religion_id' => 'required|exists:religion_infos,id',
            'name'        => [
                'required',
                // unique within same religion; ignore current record when updating
                Rule::unique('caste_infos', 'name')->where('religion_id', $request->religion_id)->ignore($id),
            ],
        ]);

        $caste        = new CasteInfo();
        $notification = 'Caste added successfully';

        if ($id) {
            $caste        = CasteInfo::findOrFail($id);
            $notification = 'Caste updated successfully';
        }

        $caste->religion_id = $request->religion_id;
        $caste->name        = $request->name;
        $caste->save();

        $notify[] = ['success', __($notification)];
        return redirect()->route('admin.caste.all')->with($notify);
    }

    /**
     * Remove the specified caste from storage.
     */
    public function delete($id)
    {
        $caste = CasteInfo::findOrFail($id);
        $caste->delete();

        $notify[] = ['success', __('Caste deleted successfully')];
        return redirect()->route('admin.caste.all')->with($notify);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Caste  $caste
     * @return \Illuminate\Http\Response
     */
    public function show(Caste $caste)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Caste  $caste
     * @return \Illuminate\Http\Response
     */
    public function edit(Caste $caste)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Caste  $caste
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Caste $caste)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Caste  $caste
     * @return \Illuminate\Http\Response
     */
    public function destroy(Caste $caste)
    {
        //
    }
}

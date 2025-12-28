<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Profession;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfessionController extends Controller
{
    public function index()
    {
        $pageTitle    = 'Professions';
        $professions  = Profession::latest()->paginate(20);
        $emptyMessage = 'No profession added yet';
        return view('admin.profession_info', compact('pageTitle', 'professions', 'emptyMessage'));
    }

    public function save(Request $request, $id = 0)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('professions', 'name')->ignore($id)],
        ]);

        $profession = $id ? Profession::findOrFail($id) : new Profession();
        $profession->name = $request->name;
        $profession->save();

        $notify[] = ['success', $id ? 'Profession updated successfully' : 'Profession added successfully'];
        return back()->with($notify);
    }

    public function delete($id)
    {
        $profession = Profession::findOrFail($id);
        $profession->delete();
        $notify[] = ['success', 'Profession deleted successfully'];
        return back()->with($notify);
    }
}

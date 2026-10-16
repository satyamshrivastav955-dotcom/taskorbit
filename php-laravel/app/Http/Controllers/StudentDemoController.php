<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Student;

/**
 * StudentDemoController
 * Demonstrates Laravel MVC Controller handling request validation,
 * database interaction via Eloquent ORM / Query Builder, and returning Blade views.
 */
class StudentDemoController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index()
    {
        $students = DB::table('demo_students')->orderBy('id', 'desc')->get();
        return view('students.index', ['students' => $students]);
    }

    /**
     * Store a newly created student with validation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|min:2|max:100',
            'email' => 'required|email|max:150',
            'role'  => 'required|in:client,manager,assignee,reviewer',
        ]);

        DB::table('demo_students')->insert([
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'role'       => $validated['role'],
            'created_at' => now(),
        ]);

        return redirect('/students')->with('success', 'Student record created successfully.');
    }

    /**
     * Remove the specified student from storage.
     */
    public function destroy($id)
    {
        DB::table('demo_students')->where('id', $id)->delete();
        return redirect('/students')->with('success', 'Student record deleted.');
    }
}

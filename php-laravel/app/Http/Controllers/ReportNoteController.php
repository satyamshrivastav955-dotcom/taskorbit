<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReportNoteController extends Controller
{
    public function login(Request $request)
    {
        $request->validate(['email' => 'required|email', 'password' => 'required']);
        $row = DB::table('report_users')->where('email', $request->email)->first();
        if (!$row || !password_verify($request->password, $row->password_hash)) {
            return back()->withErrors(['email' => 'Invalid credentials']);
        }
        session(['manager' => $row->email]);
        return redirect('/notes');
    }

    public function index(Request $request)
    {
        $notes = DB::table('report_notes')->orderByDesc('created_at')->get();
        return view('notes.index', ['notes' => $notes]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|string',
            'title' => 'required|string|max:200',
            'body' => 'required|string',
            'attachment' => 'nullable|file|mimes:pdf,png,jpg,jpeg|max:5120',
        ]);
        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('notes', 'private');
        }
        DB::table('report_notes')->insert([
            'project_id' => $data['project_id'], 'title' => $data['title'],
            'body' => $data['body'], 'attachment_path' => $path,
        ]);
        return redirect('/notes')->with('ok', 'Note created.');
    }

    public function destroy(string $id)
    {
        $note = DB::table('report_notes')->where('id', $id)->first();
        if ($note && $note->attachment_path) Storage::disk('private')->delete($note->attachment_path);
        DB::table('report_notes')->where('id', $id)->delete();
        return redirect('/notes')->with('ok', 'Note deleted.');
    }

    public function download(string $id)
    {
        $note = DB::table('report_notes')->where('id', $id)->firstOrFail();
        abort_unless($note->attachment_path, 404);
        return Storage::disk('private')->download($note->attachment_path);
    }
}

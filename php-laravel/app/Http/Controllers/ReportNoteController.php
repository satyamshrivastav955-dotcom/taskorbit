<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class ReportNoteController extends Controller
{
    private function authUser(Request $request): ?array
    {
        $user = session('user');
        if (!$user || !isset($user['id'])) {
            return null;
        }
        return $user;
    }

    private function requireAuth(Request $request)
    {
        $user = $this->authUser($request);
        if (!$user) {
            abort(403, 'You must be signed in to use the report notes module.');
        }
        return $user;
    }

    private function ownNote(array $user, string $id): array
    {
        $note = DB::table('report_notes')->where('id', $id)->first();
        if (!$note) {
            abort(404, 'Note not found.');
        }
        if ((int) $note->user_id !== (int) $user['id']) {
            abort(403, 'You can only access your own notes.');
        }
        return (array) $note;
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string',
        ]);

        $row = DB::table('report_users')->where('email', $validated['email'])->first();
        if (!$row || !Hash::check($validated['password'], $row->password_hash)) {
            return back()->withErrors(['email' => 'Invalid email or password.'])->withInput($request->only('email'));
        }

        $request->session()->regenerate();
        $request->session()->put('user', [
            'id' => (int) $row->id,
            'name' => $row->name,
            'email' => $row->email,
            'role' => $row->role,
        ]);
        $request->session()->put('authenticated', true);

        // Non-sensitive preference cookie: remember the user's chosen view mode.
        $view = $request->cookie('taskorbit_notes_view', 'list');
        $secure = $request->secure();
        $cookie = cookie('taskorbit_notes_view', $view, 60 * 24 * 30, '/', null, $secure, true, 'lax');

        return redirect('/notes')->with('ok', 'Signed in successfully.')->withCookie($cookie);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:report_users,email',
            'password' => 'required|string|min:8|max:128',
            'role' => 'sometimes|string|in:manager,reviewer,assignee',
        ]);

        DB::table('report_users')->insert([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'manager',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect('/login')->with('ok', 'Account created. Please sign in.');
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login')->with('ok', 'Signed out safely.')->withCookie(cookie('taskorbit_notes_view', '', -1, '/', null, $request->secure(), true, 'lax'));
    }

    public function index(Request $request)
    {
        $user = $this->requireAuth($request);
        $view = $request->cookie('taskorbit_notes_view');
        if (!in_array($view, ['list', 'grid'], true)) {
            $view = 'list';
        }
        $notes = DB::table('report_notes')
            ->where('user_id', $user['id'])
            ->orderByDesc('created_at')
            ->get();
        return view('notes.index', [
            'notes' => $notes,
            'view' => $view,
            'ok' => session('ok'),
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = $this->requireAuth($request);
        $note = $this->ownNote($user, $id);
        $body = $note['body'] !== null ? $this->decryptBody($note['body']) : '';
        return view('notes.show', ['note' => (object) $note, 'body' => $body]);
    }

    public function store(Request $request)
    {
        $user = $this->requireAuth($request);
        $validated = $request->validate([
            'project_id' => 'required|string|max:128',
            'title' => 'required|string|max:200',
            'body' => 'required|string|max:10000',
            'attachment' => 'nullable|file|max:5120|mimes:pdf,png,jpg,jpeg',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $uploaded = $request->file('attachment');
            $mime = $uploaded->getMimeType();
            if (!in_array($mime, ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'], true)) {
                return back()->withErrors(['attachment' => 'Unsupported file type. Allowed: PDF, PNG, JPG.'])->withInput();
            }
            $attachmentPath = $uploaded->store('notes', 'private');
        }

        DB::table('report_notes')->insert([
            'user_id' => $user['id'],
            'project_id' => $validated['project_id'],
            'title' => $validated['title'],
            'body' => encrypt($validated['body']),
            'attachment_path' => $attachmentPath,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect('/notes')->with('ok', 'Note created and stored securely.');
    }

    public function edit(Request $request, string $id)
    {
        $user = $this->requireAuth($request);
        $note = $this->ownNote($user, $id);
        $body = $note['body'] !== null ? $this->decryptBody($note['body']) : '';
        return view('notes.edit', ['note' => (object) $note, 'body' => $body]);
    }

    public function update(Request $request, string $id)
    {
        $user = $this->requireAuth($request);
        $note = $this->ownNote($user, $id);

        $validated = $request->validate([
            'project_id' => 'sometimes|required|string|max:128',
            'title' => 'sometimes|required|string|max:200',
            'body' => 'sometimes|required|string|max:10000',
            'attachment' => 'nullable|file|max:5120|mimes:pdf,png,jpg,jpeg',
        ]);

        $update = [];
        if (isset($validated['project_id'])) $update['project_id'] = $validated['project_id'];
        if (isset($validated['title'])) $update['title'] = $validated['title'];
        if (isset($validated['body'])) $update['body'] = encrypt($validated['body']);
        if ($request->hasFile('attachment')) {
            $uploaded = $request->file('attachment');
            $mime = $uploaded->getMimeType();
            if (!in_array($mime, ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'], true)) {
                return back()->withErrors(['attachment' => 'Unsupported file type. Allowed: PDF, PNG, JPG.'])->withInput();
            }
            if (!empty($note['attachment_path'])) {
                Storage::disk('private')->delete($note['attachment_path']);
            }
            $update['attachment_path'] = $uploaded->store('notes', 'private');
        }
        $update['updated_at'] = now();

        if ($update) {
            DB::table('report_notes')->where('id', $id)->update($update);
        }

        return redirect('/notes/' . $id)->with('ok', 'Note updated.');
    }

    public function destroy(Request $request, string $id)
    {
        $user = $this->requireAuth($request);
        $note = $this->ownNote($user, $id);
        if (!empty($note['attachment_path'])) {
            Storage::disk('private')->delete($note['attachment_path']);
        }
        DB::table('report_notes')->where('id', $id)->delete();
        return redirect('/notes')->with('ok', 'Note deleted.');
    }

    public function download(Request $request, string $id)
    {
        $user = $this->requireAuth($request);
        $note = $this->ownNote($user, $id);
        if (empty($note['attachment_path'])) {
            abort(404, 'No attachment on this note.');
        }
        return Storage::disk('private')->download($note['attachment_path']);
    }

    public function preference(Request $request)
    {
        $this->requireAuth($request);
        $view = $request->input('view', 'list');
        if (!in_array($view, ['list', 'grid'], true)) {
            $view = 'list';
        }
        $secure = $request->secure();
        return redirect('/notes')
            ->withCookie(cookie('taskorbit_notes_view', $view, 60 * 24 * 30, '/', null, $secure, true, 'lax'));
    }

    private function decryptBody(string $encrypted): string
    {
        try {
            return decrypt($encrypted);
        } catch (\Throwable $e) {
            return $encrypted;
        }
    }
}

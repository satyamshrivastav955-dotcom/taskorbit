<html><head><title>Note #{{ $note->id }}</title><link rel="stylesheet" href="/notes.css" /></head>
<body>
<h1>Note #{{ $note->id }}</h1>
<p style="color:var(--muted);font-size:13px;"><a href="/notes">Back to notes</a> &middot; <a href="/logout" style="float:right;color:var(--muted);text-decoration:none;font-size:12px;">Sign out</a></p>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:18px;margin-bottom:16px;overflow-wrap:anywhere;">
<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
<div>
<div style="font-weight:600;font-size:16px;">{{ e($note->title) }}</div>
<div style="font-size:12px;color:var(--muted);">Project: {{ e($note->project_id) }} &middot; Created: {{ $note->created_at }} &middot; Updated: {{ $note->updated_at }}</div>
</div>
<div style="display:flex;gap:6px;">
<a href="/notes/{{ $note->id }}/edit">Edit</a>
@if(!empty($note->attachment_path))<a href="/notes/{{ $note->id }}/download">Download</a>@endif
<form method="POST" action="/notes/{{ $note->id }}" style="margin:0;display:inline;">@csrf @method('DELETE')
<button type="submit" style="background:#b3261e;" onclick="return confirm('Delete this note?')">Delete</button>
</form>
</div>
</div>
<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
<h3 style="margin:0 0 6px 0;font-size:14px;">Body (decrypted for viewing)</h3>
<div style="background:var(--pale);border-radius:6px;padding:12px;white-space:pre-wrap;">{{ e($body) }}</div>
</div>
</div>
</body></html>

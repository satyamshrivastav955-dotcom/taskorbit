<html><head><title>Edit note #{{ $note->id }}</title><link rel="stylesheet" href="/notes.css" /></head>
<body>
<h1>Edit note #{{ $note->id }}</h1>
<p style="color:var(--muted);font-size:13px;"><a href="/notes/{{ $note->id }}">Back</a> &middot; <a href="/logout" style="float:right;color:var(--muted);text-decoration:none;font-size:12px;">Sign out</a></p>
@if($errors->any())
<div style="color:#b3261e;background:#fdecea;border:1px solid #f5c2c7;border-radius:8px;padding:8px 12px;margin-bottom:12px;">
<ul style="margin:4px 0 0 0;padding-left:18px;">@foreach($errors->all() as $e)<li>{{ $e }}</li>@endforeach</ul>
</div>
@endif
<form method="POST" action="/notes/{{ $note->id }}" enctype="multipart/form-data">@csrf @method('PUT')
<label>Project id <input name="project_id" required value="{{ e($note->project_id) }}" /></label>
<label>Title <input name="title" required value="{{ e($note->title) }}" /></label>
<label>Body (encrypted at rest) <textarea name="body" required>{{ e($body) }}</textarea></label>
<label>Replace attachment <input type="file" name="attachment" accept=".pdf,.png,.jpg,.jpeg" />
<span style="font-size:11px;color:var(--muted);">PDF/PNG/JPG &mdash; max 5 MB. Leave empty to keep current.</span></label>
@if(!empty($note->attachment_path))
<p style="font-size:12px;color:var(--muted);">Current attachment: {{ basename($note->attachment_path) }}</p>
@endif
<div style="margin-top:12px;display:flex;gap:8px;">
<button type="submit">Update note</button>
<a href="/notes/{{ $note->id }}" style="margin-left:auto;color:var(--muted);text-decoration:none;">Cancel</a>
</div>
</form>
</body></html>

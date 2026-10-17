<html><head><title>Report notes</title><link rel="stylesheet" href="/notes.css" /></head>
<body>
<h1>Report notes</h1>
<p style="color:var(--muted);font-size:13px;">PHP + MySQL academic module &middot; all notes below belong to your session only.</p>
@if(session('ok'))<p style="color:#1e7a34;background:#eef7f1;border:1px solid #b7e4cd;border-radius:8px;padding:8px 12px;margin-bottom:12px;">{{ session('ok') }}</p>@endif
@if($errors->any())
<div style="color:#b3261e;background:#fdecea;border:1px solid #f5c2c7;border-radius:8px;padding:8px 12px;margin-bottom:12px;">
<ul style="margin:4px 0 0 0;padding-left:18px;">@foreach($errors->all() as $e)<li>{{ $e }}</li>@endforeach</ul>
</div>
@endif

<a href="/logout" style="float:right;color:var(--muted);text-decoration:none;font-size:12px;">Sign out</a>

<form method="POST" action="/notes" enctype="multipart/form-data" style="margin-bottom:16px;">@csrf
<h3 style="margin:0 0 8px 0;font-size:15px;">New note</h3>
<label>Project id <input name="project_id" placeholder="e.g. Brightline Logistics" required /></label>
<label>Title <input name="title" placeholder="Note title" required /></label>
<label>Body (encrypted at rest) <textarea name="body" placeholder="Sensitive note content…" required></textarea></label>
<label>Attachment <input type="file" name="attachment" accept=".pdf,.png,.jpg,.jpeg" />
<span style="font-size:11px;color:var(--muted);">PDF/PNG/JPG &mdash; max 5 MB</span></label>
<button type="submit">Save note</button>
</form>

<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
<span style="font-size:12px;color:var(--muted);">View:</span>
<form method="POST" action="/notes/preference" style="margin:0;" class="pref-form">@csrf
<button type="submit" name="view" value="list" class="view-btn <?= $view==='list'?'active':'' ?>">List</button>
<button type="submit" name="view" value="grid" class="view-btn <?= $view==='grid'?'active':'' ?>">Grid</button>
</form>
</div>

<?php $notesList = (array) $notes; ?>
<?php if (empty($notesList)): ?>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:40px 20px;text-align:center;color:var(--muted);">
<p>No notes yet. Create your first note above.</p>
</div>
<?php elseif ($view === 'grid'): ?>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">
@foreach($notes as $n)
<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px;overflow-wrap:anywhere;">
<div style="font-size:12px;color:var(--muted);">#{{ $n->id }} &middot; {{ $n->project_id }}</div>
<div style="font-weight:600;margin:4px 0;">{{ e($n->title) }}</div>
<div style="font-size:12px;color:var(--muted);">{{ $n->attachment_path ? 'Attachment' : 'No attachment' }}</div>
<div style="margin-top:10px;display:flex;gap:6px;">
<a href="/notes/{{ $n->id }}" style="flex:1;text-align:center;">View</a>
@if($n->attachment_path)<a href="/notes/{{ $n->id }}/download" style="flex:1;text-align:center;">Download</a>@endif
<form method="POST" action="/notes/{{ $n->id }}" style="margin:0;flex:1;">@csrf @method('DELETE')
<button type="submit" style="width:100%;" onclick="return confirm('Delete this note?')">Delete</button>
</form>
</div>
</div>
@endforeach
</div>
<?php else: ?>
<table>
<tr><th>Id</th><th>Title</th><th>Project</th><th>Attachment</th><th>Created</th><th>Actions</th></tr>
@foreach($notes as $n)
<tr>
<td style="font-size:11px;color:var(--muted);">#{{ $n->id }}</td>
<td>{{ e($n->title) }}</td>
<td>{{ e($n->project_id) }}</td>
<td>@if($n->attachment_path)<a href="/notes/{{ $n->id }}/download">{{ basename($n->attachment_path) }}</a>@else — @endif</td>
<td style="font-size:12px;color:var(--muted);">{{ $n->created_at }}</td>
<td>
<a href="/notes/{{ $n->id }}">View</a>
@if($n->attachment_path)&nbsp;<a href="/notes/{{ $n->id }}/download">Download</a>@endif
<form method="POST" action="/notes/{{ $n->id }}" style="display:inline;">@csrf @method('DELETE')
<button type="submit" onclick="return confirm('Delete this note?')">Delete</button>
</form>
</td>
</tr>
@endforeach
</table>
<?php endif; ?>

<style>
.pref-form{display:inline-flex;border:1px solid var(--border);border-radius:6px;overflow:hidden;background:var(--surface);}
.view-btn{background:transparent;border:0;padding:6px 12px;font:inherit;cursor:pointer;color:var(--muted);border-right:1px solid var(--border);}
.view-btn:last-child{border-right:none;}
.view-btn.active{background:var(--primary);color:#fff;}
.view-btn:hover{background:var(--action);color:#fff;}
</style>
</body></html>

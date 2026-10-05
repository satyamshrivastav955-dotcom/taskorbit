<html><head><title>Report notes</title><link rel="stylesheet" href="/notes.css" /></head>
<body>
<h1>Report notes</h1>
@if(session('ok'))<p>{{ session('ok') }}</p>@endif
<form method="POST" action="/notes" enctype="multipart/form-data">@csrf
<input name="project_id" placeholder="Project id" required />
<input name="title" placeholder="Title" required />
<textarea name="body" placeholder="Body" required></textarea>
<input type="file" name="attachment" accept=".pdf,.png,.jpg,.jpeg" />
<button type="submit">Save note</button>
</form>
<table>
<tr><th>Title</th><th>Project</th><th>Attachment</th><th>Action</th></tr>
@foreach($notes as $n)
<tr><td>{{ $n->title }}</td><td>{{ $n->project_id }}</td>
<td>@if($n->attachment_path)<a href="/notes/{{ $n->id }}/download">Download</a>@else — @endif</td>
<td><form method="POST" action="/notes/{{ $n->id }}">@csrf @method('DELETE')<button>Delete</button></form></td></tr>
@endforeach
</table>
</body></html>

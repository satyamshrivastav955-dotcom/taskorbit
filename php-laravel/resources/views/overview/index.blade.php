<html><head><title>Project overview</title><link rel="stylesheet" href="/notes.css" /></head>
<body>
<h1>Project overview</h1>
<form method="GET" action="/overview">
<label>Status
<select name="status" onchange="this.form.submit()">
<option value="">All</option>
<option value="active" @selected($status === 'active')>Active</option>
<option value="completed" @selected($status === 'completed')>Completed</option>
<option value="draft" @selected($status === 'draft')>Draft</option>
<option value="submitted" @selected($status === 'submitted')>Submitted</option>
</select>
</label>
</form>
<table>
<tr><th>Title</th><th>Status</th><th>Deadline</th></tr>
@foreach($projects as $p)
<tr><td>{{ $p->title }}</td><td>{{ $p->status }}</td><td>{{ $p->deadline }}</td></tr>
@endforeach
</table>
</body></html>

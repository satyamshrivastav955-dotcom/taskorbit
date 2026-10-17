<html><head><title>Create account</title><link rel="stylesheet" href="/notes.css" /></head>
<body>
<h1>Create account</h1>
<p style="color:var(--muted);font-size:13px;">Report notes module &mdash; session-based login, isolated from the core Firebase app.</p>
@if($errors->any())
<div style="color:#b3261e;background:#fdecea;border:1px solid #f5c2c7;border-radius:8px;padding:8px 12px;margin-bottom:12px;">
<ul style="margin:4px 0 0 0;padding-left:18px;">@foreach($errors->all() as $e)<li>{{ $e }}</li>@endforeach</ul>
</div>
@endif
<form method="POST" action="/register">@csrf
<label>Name <input name="name" required /></label>
<label>Email <input type="email" name="email" required /></label>
<label>Password <input type="password" name="password" required minlength="8" /></label>
<label>Role <select name="role"><option>manager</option><option>reviewer</option><option>assignee</option></select></label>
<button type="submit">Create account</button>
</form>
<p style="margin-top:12px;font-size:13px;color:var(--muted);">Already have an account? <a href="/login">Sign in</a></p>
</body></html>

<html><head><title>Sign in - Report notes</title><link rel="stylesheet" href="/notes.css" /></head>
<body>
<h1>Sign in</h1>
@if($errors->any())<p>{{ $errors->first() }}</p>@endif
<form method="POST" action="/login">@csrf
<label>Email <input type="email" name="email" required /></label>
<label>Password <input type="password" name="password" required /></label>
<button type="submit">Sign in</button>
</form>
</body></html>

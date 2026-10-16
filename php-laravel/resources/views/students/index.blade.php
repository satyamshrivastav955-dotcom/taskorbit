<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unit I — Laravel CRUD Demonstration</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; margin: 0; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #38bdf8; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }
        .alert-success { background: #065f46; color: #a7f3d0; padding: 12px; border-radius: 6px; margin-bottom: 1.5rem; }
        .error-list { background: #7f1d1d; color: #fecaca; padding: 12px; border-radius: 6px; margin-bottom: 1.5rem; }
        label { display: block; margin: 10px 0 5px; font-weight: 500; }
        input, select, button { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; box-sizing: border-box; }
        button { background: #2563eb; color: #fff; font-weight: 600; cursor: pointer; margin-top: 15px; border: none; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #334155; }
        th { color: #94a3b8; font-weight: 600; }
        .btn-delete { background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; width: auto; margin: 0; }
    </style>
</head>
<body>
<div class="container">
    <h1>Unit I: Laravel MVC & Blade CRUD Demonstration</h1>
    <p style="color: #94a3b8;">Demonstrating Laravel Routing, Validation, Blade Directives, and Database CRUD.</p>

    {{-- Session Flash Message Demonstration --}}
    @if(session('success'))
        <div class="alert-success">{{ session('success') }}</div>
    @endif

    {{-- Validation Errors Display --}}
    @if($errors->any())
        <div class="error-list">
            <ul>
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- CREATE Form --}}
    <div class="card">
        <h2>Add Student Record (CREATE)</h2>
        <form method="POST" action="/students">
            @csrf
            <label for="name">Student Name:</label>
            <input type="text" id="name" name="name" value="{{ old('name') }}" placeholder="Full Name" required>

            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" placeholder="student@taskorbit.local" required>

            <label for="role">Assigned Role:</label>
            <select id="role" name="role">
                <option value="assignee" selected>Assignee</option>
                <option value="reviewer">Reviewer</option>
                <option value="manager">Manager</option>
                <option value="client">Client</option>
            </select>

            <button type="submit">Save Student Record</button>
        </form>
    </div>

    {{-- READ & DELETE Table --}}
    <div class="card">
        <h2>Registered Students (READ & DELETE)</h2>
        @if(count($students) > 0)
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($students as $student)
                        <tr>
                            <td>{{ $student->id }}</td>
                            <td>{{ $student->name }}</td>
                            <td>{{ $student->email }}</td>
                            <td><span style="text-transform: capitalize;">{{ $student->role }}</span></td>
                            <td>
                                <form method="POST" action="/students/{{ $student->id }}" style="margin: 0;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn-delete" onclick="return confirm('Delete this record?');">Delete</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p style="color: #94a3b8;">No student records found. Submit the form above to add one.</p>
        @endif
    </div>
</div>
</body>
</html>

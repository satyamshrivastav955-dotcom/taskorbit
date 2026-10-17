# Laravel Report Notes module

PHP 8.2 + Laravel 11 + Blade + MySQL 8. Standalone academic/reporting module that
mirrors the TaskOrbit blue design system. It runs on its own session-based
authentication and is isolated from the core Firebase/React application.

## Features (academic requirements)

| # | Requirement | How it is demonstrated |
|---|-------------|------------------------|
| 1 | PHP | Server-side controllers, Blade views, middleware, routes (plain PHP/Laravel). |
| 2 | Database CRUD | `report_notes`: create (store), read (index/show), update, delete (destroy) with authorization. |
| 3 | Session | `auth.session` middleware; login regenerates the session id; logout invalidates + regenerates. |
| 4 | Cookie | `taskorbit_notes_view` preference cookie (list/grid) with expiration, path, HttpOnly, Secure (HTTPS), SameSite=Lax; validated before use. |
| 5 | Method | GET for reads (`/notes`, `/notes/{id}`, `/overview`), POST for create/login, PUT for update, DELETE for destroy. No destructive GET. |
| 6 | Encryption | Passwords hashed with `password_hash()`/`Hash::check()` (never plaintext). Note bodies encrypted at rest with Laravel `encrypt()`/`decrypt()` (AES-256-CBC, key from `APP_KEY` env). |
| 7 | Validation | Server-side Laravel validation (required, email, unique, min/max, mime, size) + client-side HTML5 (`required`, `accept`, `minlength`). CSRF tokens on every form. Parameterized queries via the query builder. Blade `{{ }}` output escaping. |
| 8 | Authentication & Authorization | Session-based login (isolated from Firebase). Role stored on the session. Every note operation checks `user_id` ownership server-side (403 for other users' records). |
| 9 | File/Image Upload & Download | Private disk storage (`storage/app/private`), randomized names, server-side MIME + size + extension validation, executable/blocked types rejected, no public exposure, authorized download, orphaned file cleanup on replace/delete. |

## Database

Run the migrations:

```powershell
cd php-laravel
composer install
cp .env.example .env
# edit .env with your MySQL credentials (never commit real values)
php artisan key:generate
php artisan migrate
php artisan db:seed   # creates a demo manager: manager@example.test / demo123456
```

Tables: `report_users`, `report_notes`, `projects`, `tasks` (read-only reporting tables populated by `node-backend/scripts/syncToMysql.js`).

## Environment variables

| Variable | Purpose |
|---|---|
| `APP_KEY` | Encryption key for `encrypt()`/`decrypt()` and session encryption. Generate with `php artisan key:generate`. Never commit. |
| `APP_URL` | Base URL used for secure cookie scheme detection. |
| `DB_*` | MySQL connection (host, port, database, username, password). |
| `SESSION_SECURE_COOKIE` | Set to `true` when serving over HTTPS so the session cookie is Secure-only. |

All secrets come from `.env` (git-ignored). Never commit credentials or `APP_KEY`.

## Running

```powershell
cd php-laravel
php artisan serve   # http://localhost:8000
```

- `/login` — sign in (session-based, isolated from Firebase).
- `/notes` — list/create your report notes (set view-mode cookie).
- `/notes/{id}` — view a note (body decrypted) / edit / delete / download.
- `/overview` — read-only project overview from the synced MySQL reporting tables.

## Security boundary

This module has its own session/identity and does **not** replace Firebase Auth for the React app. It does not write to Firestore or Firebase Storage. Files are stored locally under `storage/app/private` (not publicly readable) and downloads re-check ownership on every request.

## Tests

```powershell
cd php-laravel
vendor/bin/phpunit
```
Requires PHP 8.2 + Composer + a running MySQL instance; blocked in environments without PHP/MySQL.

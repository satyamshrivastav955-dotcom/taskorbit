# Unit I: PHP and Laravel Learning Module

This module provides complete, runnable examples for all **Unit I (PHP and Laravel)** topics from the Web Technology syllabus.

---

## Syllabus Topics Covered

| Script File | Topic Name | Key Concepts Demonstrated |
| :--- | :--- | :--- |
| `01_intro_syntax.php` | **PHP Introduction & Syntax** | Server-side execution, data types, `echo` vs `print`, constants, `var_dump()` |
| `02_variables_conditions_loops.php` | **Variables, Conditions & Loops** | `global`, `local`, `static` scopes, `if-elseif-else`, `match`, `for`, `while`, `do-while`, `foreach` |
| `03_functions.php` | **Functions in PHP** | Pass-by-value vs pass-by-reference (`&`), default arguments, closures (`use`), arrow functions (`fn`) |
| `04_string_manipulation.php` | **String Manipulation** | `strlen`, `strpos`, `str_replace`, `substr`, `trim`, `explode`, `implode`, XSS escaping |
| `05_arrays_and_functions.php` | **Arrays and Array Functions** | Indexed, associative, multidimensional, `array_push`, `array_filter`, `array_map`, `asort`, `ksort` |
| `06_forms_get_post.php` | **Form Handling (GET & POST)** | `$_GET`, `$_POST`, `$_SERVER['REQUEST_METHOD']`, URL query strings vs request bodies |
| `07_form_validation.php` | **Form & Email Validation** | `filter_var($email, FILTER_VALIDATE_EMAIL)`, sanitization, required fields, bcrypt hashing |
| `08_cookies_and_sessions.php` | **Cookies & Sessions** | `setcookie()`, `$_COOKIE`, cookie expiry, `session_start()`, `$_SESSION`, session destruction |
| `09_file_handling.php` | **File Handling** | `fopen`, `fwrite`, `fread`, `fgets`, `feof`, `fclose`, `file_get_contents`, `file_put_contents`, `unlink` |
| `10_exception_handling.php` | **Exception Handling** | `try`, `catch`, `finally`, `throw`, custom exception classes, exception methods |
| `11_mysql_prepared_statements.php` | **PHP with MySQL (CRUD)** | PDO connection, prepared statements, parameterized queries preventing SQL injection, CRUD operations |
| `12_laravel_crud_guide.php` | **Laravel Framework Overview** | Routing (`routes/web.php`), Controllers, Blade templates, Eloquent Models, Migrations, CRUD |

---

## Setup Instructions

### 1. PHP Installation
- **Option A (XAMPP - Recommended for Windows students)**:
  1. Download and install XAMPP from [apachefriends.org](https://www.apachefriends.org/).
  2. Add `C:\xampp\php` to your Windows System `PATH` environment variable.
  3. Verify by opening PowerShell and running: `php -v`.
- **Option B (Standalone PHP)**:
  1. Download PHP for Windows from [windows.php.net/download](https://windows.php.net/download/).
  2. Extract to `C:\php` and add `C:\php` to `PATH`.

### 2. MySQL Setup
1. In the XAMPP Control Panel, start the **MySQL** module (default port: `3306`).
2. The MySQL database credentials configured in TaskOrbit are:
   - Host: `127.0.0.1`
   - Port: `3306`
   - Username: `root`
   - Password: `""` (empty)
   - Database: `taskorbit_reports`

### 3. Laravel Setup
1. Install Composer from [getcomposer.org](https://getcomposer.org/).
2. In terminal, navigate to `php-laravel/`:
   ```bash
   cd d:\wt_cp\taskorbit\php-laravel
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan serve
   ```
3. Open `http://127.0.0.1:8000` in your browser.

---

## How to Run the Unit I Examples

### Run All 12 Topics at Once
```bash
cd d:\wt_cp\taskorbit\php-laravel\unit1_php
php run_all.php
```

### Run Individual Topics via CLI
```bash
cd d:\wt_cp\taskorbit\php-laravel\unit1_php
php 01_intro_syntax.php
php 02_variables_conditions_loops.php
php 03_functions.php
php 04_string_manipulation.php
php 05_arrays_and_functions.php
php 06_forms_get_post.php
php 07_form_validation.php
php 08_cookies_and_sessions.php
php 09_file_handling.php
php 10_exception_handling.php
php 11_mysql_prepared_statements.php
php 12_laravel_crud_guide.php
```

### Run Interactive Web Forms via Built-in Server
To test `06_forms_get_post.php`, `07_form_validation.php`, and `08_cookies_and_sessions.php` with actual browser HTML forms:
```bash
cd d:\wt_cp\taskorbit\php-laravel\unit1_php
php -S localhost:8000
```
Open `http://localhost:8000/06_forms_get_post.php` in your browser.

---

## Exam & Viva Questions Cheat Sheet

1. **What is the difference between GET and POST in PHP?**
   - GET appends form data to the URL query string, has length limitations (~2KB), is cached by browsers, and should never be used for sensitive credentials.
   - POST packages form data in the HTTP request body, supports arbitrarily large payloads and file uploads, and is not visible in browser address bars or history.

2. **How does PHP prevent SQL Injection?**
   - By using **Prepared Statements** with PDO or MySQLi. In a prepared statement, the SQL query is parsed and compiled before parameter values are injected. The database engine treats parameter values strictly as data, never as executable SQL commands, completely neutralizing injection strings such as `' OR '1'='1`.

3. **What is the difference between a Session and a Cookie?**
   - A **Cookie** is stored on the client's browser machine.
   - A **Session** stores data on the web server; only a small random session identifier (`PHPSESSID`) is stored on the client in a cookie. Sessions are significantly more secure for storing authentication state.

4. **What are the main components of the Laravel framework?**
   - **Routes** (`routes/web.php`): Directs requests to controllers.
   - **Controllers** (`app/Http/Controllers/`): Processes request logic.
   - **Blade Templates** (`resources/views/`): Views with lightweight PHP templating syntax.
   - **Eloquent ORM** (`app/Models/`): Active-record database abstraction.
   - **Migrations** (`database/migrations/`): Schema version control.

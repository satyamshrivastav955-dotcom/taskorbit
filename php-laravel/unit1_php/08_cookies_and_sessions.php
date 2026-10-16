<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 8: COOKIES AND SESSIONS IN PHP
 * ============================================================================
 * 
 * COOKIES:
 * - Small pieces of data stored on the client's browser.
 * - Set using setcookie(name, value, expire, path, domain, secure, httponly).
 * - Sent back to the server with every HTTP request in the 'Cookie' header.
 * - Accessible via $_COOKIE superglobal.
 * - Used for: Theme preferences, remember-me tokens, analytics tracking.
 * 
 * SESSIONS:
 * - Data stored securely on the server; client only holds a session ID cookie (PHPSESSID).
 * - Started with session_start().
 * - Accessible via $_SESSION superglobal.
 * - Destroyed with session_unset() and session_destroy().
 * - Used for: User authentication, shopping cart items, flash notifications.
 * ============================================================================
 */

$isCli = (php_sapi_name() === 'cli');

if ($isCli) {
    echo "======================================================\n";
    echo " TOPIC 8: Cookies & Sessions Demonstration\n";
    echo "======================================================\n\n";

    // 1. Cookies Concepts & Mechanics
    echo "1. Cookie Mechanics:\n";
    echo "   Syntax: setcookie('user_role', 'assignee', time() + 86400, '/', '', false, true);\n";
    echo "   - time() + 86400 sets expiry to 1 day in the future.\n";
    echo "   - httponly flag (last arg) protects cookie from XSS document.cookie theft.\n";

    // Simulate $_COOKIE
    $_COOKIE['preferred_theme'] = 'dark';
    $_COOKIE['last_visited_role'] = 'assignee';
    echo "   Simulated \$_COOKIE contents:\n";
    foreach ($_COOKIE as $k => $v) {
        echo "      [$k] => $v\n";
    }
    echo "\n";

    // 2. Session Concepts & Mechanics
    echo "2. Session Mechanics:\n";
    echo "   Step 1: session_start() initializes or resumes the session.\n";
    echo "   Step 2: Server generates/checks PHPSESSID cookie.\n";
    echo "   Step 3: Server stores session data in server-side storage (e.g. /tmp/sess_xyz).\n";

    // Simulate $_SESSION
    $_SESSION['auth_user'] = [
        'uid'   => 'dev-engineer-1',
        'email' => 'engineer1@taskorbit.local',
        'role'  => 'assignee',
        'login_time' => time(),
    ];
    $_SESSION['flash_message'] = 'Welcome back to TaskOrbit Workspace!';

    echo "   Simulated \$_SESSION contents:\n";
    echo "      User UID  : {$_SESSION['auth_user']['uid']}\n";
    echo "      User Email: {$_SESSION['auth_user']['email']}\n";
    echo "      User Role : {$_SESSION['auth_user']['role']}\n";
    echo "      Flash Msg : {$_SESSION['flash_message']}\n\n";

    // 3. Session Destruction (Logout)
    echo "3. Session Destruction (Logout procedure):\n";
    echo "   - session_unset();    // Clears all session variables in memory\n";
    echo "   - session_destroy();  // Destroys session file on server disk\n";
    echo "   - setcookie('PHPSESSID', '', time() - 3600, '/'); // Deletes client cookie\n\n";

    echo "--- Topic 8 Completed Successfully (CLI Mode) ---\n";
    exit(0);
}

// Web Mode
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$notice = "";

// Handle Cookie setting
if (isset($_POST['set_cookie'])) {
    $theme = htmlspecialchars($_POST['theme'] ?? 'dark');
    setcookie('taskorbit_theme', $theme, time() + (86400 * 7), "/");
    $_COOKIE['taskorbit_theme'] = $theme;
    $notice = "Cookie 'taskorbit_theme' set to '$theme' (valid for 7 days).";
}

// Handle Session Login
if (isset($_POST['login_session'])) {
    $_SESSION['user'] = [
        'name' => htmlspecialchars($_POST['name'] ?? 'Engineer 1'),
        'role' => htmlspecialchars($_POST['role'] ?? 'assignee'),
    ];
    $notice = "Session created for: " . $_SESSION['user']['name'] . " (" . $_SESSION['user']['role'] . ")";
}

// Handle Session Logout
if (isset($_POST['logout_session'])) {
    session_unset();
    session_destroy();
    $_SESSION = [];
    $notice = "Session destroyed successfully (Logged out).";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Unit I — Cookies & Sessions</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; max-width: 550px; }
        .alert { background: #0369a1; color: #e0f2fe; padding: 10px; border-radius: 6px; margin-bottom: 1rem; max-width: 550px; }
        button { background: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; margin-top: 10px; }
        input, select { width: 100%; padding: 8px; margin-top: 5px; background: #0f172a; color: #fff; border: 1px solid #475569; border-radius: 6px; box-sizing: border-box; }
    </style>
</head>
<body>
    <h1>Unit I: Cookies & Sessions in PHP</h1>

    <?php if ($notice): ?>
        <div class="alert"><?= $notice ?></div>
    <?php endif; ?>

    <div class="card">
        <h2>1. Cookie Preferences</h2>
        <p>Current Cookie (taskorbit_theme): <strong><?= htmlspecialchars($_COOKIE['taskorbit_theme'] ?? 'None set') ?></strong></p>
        <form method="POST">
            <select name="theme">
                <option value="dark">Dark Theme (Default)</option>
                <option value="light">Light Theme</option>
                <option value="high-contrast">High Contrast</option>
            </select>
            <button type="submit" name="set_cookie">Save Cookie Preference</button>
        </form>
    </div>

    <div class="card">
        <h2>2. Server-side Session Management</h2>
        <?php if (!empty($_SESSION['user'])): ?>
            <p>Active Session User: <strong><?= $_SESSION['user']['name'] ?></strong> | Role: <strong><?= $_SESSION['user']['role'] ?></strong></p>
            <form method="POST">
                <button type="submit" name="logout_session" style="background: #dc2626;">Destroy Session (Logout)</button>
            </form>
        <?php else: ?>
            <p>No active user session found.</p>
            <form method="POST">
                <input type="text" name="name" placeholder="User Name" value="Engineer 1">
                <select name="role">
                    <option value="client">Client</option>
                    <option value="manager">Manager</option>
                    <option value="assignee" selected>Assignee</option>
                    <option value="reviewer">Reviewer</option>
                </select>
                <button type="submit" name="login_session">Start Session (Login)</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>

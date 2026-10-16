<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 6: HTML FORM HANDLING USING GET AND POST
 * ============================================================================
 * 
 * GET vs POST METHODS:
 * 1. GET Method:
 *    - Data is sent via URL query parameters (?key=value).
 *    - Visible in browser address bar and history.
 *    - Limited data size (~2048 chars).
 *    - Idempotent: Used for fetching/searching (never for passwords or sensitive state).
 *    - Accessible via $_GET superglobal array.
 * 
 * 2. POST Method:
 *    - Data is sent inside the HTTP request body.
 *    - Not visible in URL address bar.
 *    - Supports large payloads, file uploads (multipart/form-data).
 *    - Used for creating or modifying resources.
 *    - Accessible via $_POST superglobal array.
 * 
 * CLI & WEB DUAL RUNNING:
 * - If run in browser, renders an interactive HTML form with styling.
 * - If run in CLI, executes an automated demonstration of GET and POST handling.
 * ============================================================================
 */

$isCli = (php_sapi_name() === 'cli');

// Simulated CLI execution for testing
if ($isCli) {
    echo "======================================================\n";
    echo " TOPIC 6: HTML Form Handling (GET vs POST)\n";
    echo "======================================================\n\n";

    // Simulate GET Request
    $_GET = ['search' => 'Supabase Migration', 'category' => 'Database'];
    $_SERVER['REQUEST_METHOD'] = 'GET';

    echo "1. Simulated GET Request:\n";
    echo "   Query Parameter 'search'  : " . htmlspecialchars($_GET['search']) . "\n";
    echo "   Query Parameter 'category': " . htmlspecialchars($_GET['category']) . "\n";
    echo "   Generated URL query string: ?" . http_build_query($_GET) . "\n\n";

    // Simulate POST Request
    $_POST = [
        'project_title' => 'TaskOrbit AI Copilot',
        'priority'      => 'high',
        'deadline'      => '2026-11-15'
    ];
    $_SERVER['REQUEST_METHOD'] = 'POST';

    echo "2. Simulated POST Request (Payload in Request Body):\n";
    echo "   POST 'project_title': " . htmlspecialchars($_POST['project_title']) . "\n";
    echo "   POST 'priority'     : " . htmlspecialchars($_POST['priority']) . "\n";
    echo "   POST 'deadline'     : " . htmlspecialchars($_POST['deadline']) . "\n\n";

    echo "--- Topic 6 Completed Successfully (CLI Mode) ---\n";
    exit(0);
}

// Web Mode: Self-contained HTML Form
$message = "";
$methodUsed = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($methodUsed === 'POST' && isset($_POST['submit_post'])) {
    $title = htmlspecialchars(trim($_POST['project_title'] ?? ''));
    $role  = htmlspecialchars(trim($_POST['role'] ?? ''));
    $message = "POST Received Successfully: Project '<strong>$title</strong>' created for role '<strong>$role</strong>'.";
} elseif ($methodUsed === 'GET' && isset($_GET['search_query'])) {
    $query = htmlspecialchars(trim($_GET['search_query'] ?? ''));
    $message = "GET Search Executed: Query string was '<strong>$query</strong>'.";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Unit I — Form Handling (GET & POST)</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; max-width: 600px; }
        h2 { color: #38bdf8; margin-top: 0; }
        label { display: block; margin: 10px 0 5px; font-weight: 500; }
        input, select, button { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; box-sizing: border-box; }
        button { background: #2563eb; color: #fff; font-weight: 600; cursor: pointer; margin-top: 15px; border: none; }
        button:hover { background: #1d4ed8; }
        .alert { background: #065f46; color: #a7f3d0; padding: 12px; border-radius: 6px; margin-bottom: 1.5rem; max-width: 600px; }
    </style>
</head>
<body>
    <h1>Unit I: HTML Form Handling with PHP</h1>

    <?php if (!empty($message)): ?>
        <div class="alert"><?= $message ?></div>
    <?php endif; ?>

    <!-- POST FORM DEMONSTRATION -->
    <div class="card">
        <h2>1. POST Form (Resource Creation)</h2>
        <form method="POST" action="">
            <label for="project_title">Project Title:</label>
            <input type="text" id="project_title" name="project_title" placeholder="e.g., TaskOrbit Unit II" required>

            <label for="role">Assignee Role:</label>
            <select id="role" name="role">
                <option value="client">Client</option>
                <option value="manager">Manager</option>
                <option value="assignee" selected>Assignee</option>
                <option value="reviewer">Reviewer</option>
            </select>

            <button type="submit" name="submit_post">Submit via HTTP POST</button>
        </form>
    </div>

    <!-- GET FORM DEMONSTRATION -->
    <div class="card">
        <h2>2. GET Form (Search Query)</h2>
        <form method="GET" action="">
            <label for="search_query">Search Keyword:</label>
            <input type="text" id="search_query" name="search_query" placeholder="e.g., React Playground" required>

            <button type="submit">Submit via HTTP GET</button>
        </form>
    </div>
</body>
</html>

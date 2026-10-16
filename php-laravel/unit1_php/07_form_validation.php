<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 7: FORM VALIDATION & EMAIL-FORMAT VALIDATION
 * ============================================================================
 * 
 * VALIDATION CONCEPTS:
 * 1. Data Sanitization:
 *    - trim(): Removes leading and trailing whitespace.
 *    - stripslashes(): Unquotes quoted strings.
 *    - htmlspecialchars(): Converts special characters to HTML entities (prevents XSS).
 * 
 * 2. Field Validation Rules:
 *    - Required check: empty() or strlen() === 0.
 *    - Email validation: filter_var($email, FILTER_VALIDATE_EMAIL).
 *    - Length constraints: strlen() bounds check.
 *    - RegEx Pattern matching: preg_match() for phone/alphanumeric.
 * ============================================================================
 */

function sanitizeInput(string $data): string {
    $data = trim($data);
    $data = stripslashes($data);
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

function validateRegistrationForm(array $input): array {
    $errors = [];
    $validData = [];

    // 1. Validate Name
    $name = sanitizeInput($input['name'] ?? '');
    if (empty($name)) {
        $errors['name'] = "Name is required.";
    } elseif (strlen($name) < 2 || strlen($name) > 50) {
        $errors['name'] = "Name must be between 2 and 50 characters.";
    } else {
        $validData['name'] = $name;
    }

    // 2. Validate Email using filter_var
    $email = trim($input['email'] ?? '');
    if (empty($email)) {
        $errors['email'] = "Email address is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = "Invalid email format. (e.g. user@domain.com)";
    } else {
        $validData['email'] = filter_var($email, FILTER_SANITIZE_EMAIL);
    }

    // 3. Validate Password Length
    $password = $input['password'] ?? '';
    if (empty($password)) {
        $errors['password'] = "Password is required.";
    } elseif (strlen($password) < 8) {
        $errors['password'] = "Password must be at least 8 characters long.";
    } else {
        $validData['password_hash'] = password_hash($password, PASSWORD_BCRYPT);
    }

    // 4. Validate Role
    $role = strtolower(trim($input['role'] ?? ''));
    $allowedRoles = ['client', 'manager', 'assignee', 'reviewer'];
    if (!in_array($role, $allowedRoles, true)) {
        $errors['role'] = "Please select a valid role (client, manager, assignee, reviewer).";
    } else {
        $validData['role'] = $role;
    }

    return ['isValid' => empty($errors), 'errors' => $errors, 'data' => $validData];
}

// ----------------------------------------------------------------------------
// CLI Execution Mode
// ----------------------------------------------------------------------------
if (php_sapi_name() === 'cli') {
    echo "======================================================\n";
    echo " TOPIC 7: Form Validation & Email Format Validation\n";
    echo "======================================================\n\n";

    echo "1. Testing with Invalid Input (Missing name, bad email, short password):\n";
    $badInput = [
        'name'     => '',
        'email'    => 'not-an-email@com',
        'password' => '123',
        'role'     => 'superadmin' // invalid role
    ];
    $result1 = validateRegistrationForm($badInput);
    echo "   Validation Passed: " . ($result1['isValid'] ? "Yes" : "No") . "\n";
    echo "   Errors Detected:\n";
    foreach ($result1['errors'] as $field => $errMsg) {
        echo "      - [$field]: $errMsg\n";
    }
    echo "\n";

    echo "2. Testing with Valid Input:\n";
    $goodInput = [
        'name'     => 'Alex Kumar',
        'email'    => 'engineer1@taskorbit.local',
        'password' => 'TaskOrbitDev123!',
        'role'     => 'assignee'
    ];
    $result2 = validateRegistrationForm($goodInput);
    echo "   Validation Passed: " . ($result2['isValid'] ? "Yes" : "No") . "\n";
    echo "   Sanitized Email  : {$result2['data']['email']}\n";
    echo "   Bcrypt Hash Gen  : " . substr($result2['data']['password_hash'], 0, 25) . "...\n";

    echo "\n--- Topic 7 Completed Successfully ---\n";
    exit(0);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Unit I — Form Validation</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; max-width: 500px; }
        .error { color: #f87171; font-size: 0.85rem; margin-top: 4px; }
        .success { background: #065f46; color: #a7f3d0; padding: 12px; border-radius: 6px; margin-bottom: 1rem; }
        label { display: block; margin-top: 10px; font-weight: 500; }
        input, select, button { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; box-sizing: border-box; }
        button { background: #2563eb; color: #fff; font-weight: 600; cursor: pointer; margin-top: 15px; border: none; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Student User Registration Validation</h2>
        <?php
        $validation = ['isValid' => false, 'errors' => []];
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $validation = validateRegistrationForm($_POST);
            if ($validation['isValid']) {
                echo "<div class='success'>Validation passed! Account registered for: " . $validation['data']['email'] . "</div>";
            }
        }
        ?>
        <form method="POST">
            <label for="name">Full Name:</label>
            <input type="text" id="name" name="name" value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
            <?php if (isset($validation['errors']['name'])): ?><div class="error"><?= $validation['errors']['name'] ?></div><?php endif; ?>

            <label for="email">Email Address (filter_var):</label>
            <input type="text" id="email" name="email" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
            <?php if (isset($validation['errors']['email'])): ?><div class="error"><?= $validation['errors']['email'] ?></div><?php endif; ?>

            <label for="password">Password (min 8 chars):</label>
            <input type="password" id="password" name="password">
            <?php if (isset($validation['errors']['password'])): ?><div class="error"><?= $validation['errors']['password'] ?></div><?php endif; ?>

            <label for="role">Role:</label>
            <select id="role" name="role">
                <option value="client">Client</option>
                <option value="manager">Manager</option>
                <option value="assignee" selected>Assignee</option>
                <option value="reviewer">Reviewer</option>
            </select>
            <?php if (isset($validation['errors']['role'])): ?><div class="error"><?= $validation['errors']['role'] ?></div><?php endif; ?>

            <button type="submit">Validate & Submit</button>
        </form>
    </div>
</body>
</html>

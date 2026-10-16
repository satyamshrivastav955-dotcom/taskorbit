<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 11: PHP WITH MYSQL & PREPARED STATEMENTS (CRUD)
 * ============================================================================
 * 
 * WHY PREPARED STATEMENTS?
 * Prepared statements separate the SQL query structure from the user-supplied data.
 * When a query is prepared, the database parses and compiles the query execution plan.
 * Parameters are later bound directly to compiled placeholders.
 * Therefore, user input CANNOT alter query logic, completely preventing SQL Injection (SQLi)!
 * 
 * PDO (PHP Data Objects):
 * - Database-independent abstraction layer.
 * - Supports named placeholders (:email) or positional placeholders (?).
 * - Exception handling via PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION.
 * - Prepared statement steps:
 *     1. $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
 *     2. $stmt->execute([':email' => $userInput]);
 *     3. $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 11: PHP with MySQL & Prepared Statements (CRUD)\n";
echo "======================================================\n\n";

// Environment-driven credentials (never hardcode in production)
$host = getenv('MYSQL_HOST') ?: '127.0.0.1';
$port = getenv('MYSQL_PORT') ?: '3306';
$user = getenv('MYSQL_USER') ?: 'root';
$pass = getenv('MYSQL_PASSWORD') ?: '';
$db   = getenv('MYSQL_DATABASE') ?: 'taskorbit_reports';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
$pdo = null;

try {
    // Attempt live MySQL connection
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 2,
    ]);
    echo "[Connected]: Successfully connected to MySQL database '$db'.\n\n";
} catch (Exception $e) {
    echo "[Notice]: Live MySQL server not currently reachable on $host:$port (" . $e->getMessage() . ").\n";
    echo "[Simulation]: Initializing in-memory SQLite PDO database to demonstrate prepared statements...\n\n";
    $pdo = new PDO('sqlite::memory:', null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

// 1. Table Setup
echo "1. Table Creation:\n";
$createTableSql = "
CREATE TABLE IF NOT EXISTS demo_students (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);";

// Handle SQLite difference for AUTOINCREMENT
if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
    $createTableSql = "
    CREATE TABLE IF NOT EXISTS demo_students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );";
}

$pdo->exec($createTableSql);
echo "   Table 'demo_students' verified.\n\n";

// 2. CREATE (INSERT) using Prepared Statements
echo "2. CREATE Operation (INSERT with Named Placeholders):\n";
$insertSql = "INSERT INTO demo_students (name, email, role) VALUES (:name, :email, :role)";
$insertStmt = $pdo->prepare($insertSql);

$studentsToInsert = [
    ['name' => 'Alice Sharma',  'email' => 'alice@taskorbit.local',   'role' => 'client'],
    ['name' => 'Rahul Verma',   'email' => 'rahul@taskorbit.local',   'role' => 'manager'],
    ['name' => 'Dev Engineer',  'email' => 'engineer1@taskorbit.local','role' => 'assignee'],
];

foreach ($studentsToInsert as $student) {
    try {
        $insertStmt->execute([
            ':name'  => $student['name'],
            ':email' => $student['email'],
            ':role'  => $student['role'],
        ]);
        echo "   Inserted: {$student['name']} ({$student['email']})\n";
    } catch (PDOException $pe) {
        // Handle duplicate key quietly
        echo "   Skipped duplicate: {$student['email']}\n";
    }
}
echo "\n";

// 3. READ (SELECT) with Positional Placeholder
echo "3. READ Operation (SELECT with Prepared Query):\n";
$searchRole = 'assignee';
$selectSql = "SELECT id, name, email, role FROM demo_students WHERE role = ?";
$selectStmt = $pdo->prepare($selectSql);
$selectStmt->execute([$searchRole]);
$assignees = $selectStmt->fetchAll();

echo "   Querying students with role = '$searchRole':\n";
foreach ($assignees as $row) {
    echo "   -> [ID: {$row['id']}] {$row['name']} | {$row['email']} | Role: {$row['role']}\n";
}
echo "\n";

// 4. UPDATE using Prepared Statement
echo "4. UPDATE Operation:\n";
$updateSql = "UPDATE demo_students SET role = :newRole WHERE email = :email";
$updateStmt = $pdo->prepare($updateSql);
$updateStmt->execute([
    ':newRole' => 'reviewer',
    ':email'   => 'engineer1@taskorbit.local'
]);
echo "   Updated role for 'engineer1@taskorbit.local' to 'reviewer'. Rows affected: " . $updateStmt->rowCount() . "\n\n";

// 5. Security Demonstration: SQL Injection Immunity
echo "5. SQL Injection Immunity Demonstration:\n";
// An attacker enters this malicious input into a search box:
$maliciousInput = "' OR '1'='1";
$secureQuery = "SELECT id, name, email FROM demo_students WHERE email = :email";
$secureStmt = $pdo->prepare($secureQuery);
$secureStmt->execute([':email' => $maliciousInput]);
$injectedResults = $secureStmt->fetchAll();

echo "   Attacker injected query parameter: \"$maliciousInput\"\n";
echo "   Results returned by prepared statement: " . count($injectedResults) . "\n";
echo "   EXPLANATION: Because the placeholder is treated as a literal string value,\n";
echo "   the attacker's quotes cannot break out of the SQL command syntax!\n\n";

// 6. DELETE Operation
echo "6. DELETE Operation:\n";
$deleteSql = "DELETE FROM demo_students WHERE email = :email";
$deleteStmt = $pdo->prepare($deleteSql);
$deleteStmt->execute([':email' => 'alice@taskorbit.local']);
echo "   Deleted 'alice@taskorbit.local'. Rows affected: " . $deleteStmt->rowCount() . "\n\n";

echo "--- Topic 11 Completed Successfully ---\n";

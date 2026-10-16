<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 2: VARIABLES, CONDITIONS & LOOPS
 * ============================================================================
 * 
 * VARIABLES & SCOPE:
 * - In PHP, all variables start with the '$' symbol.
 * - Local scope: Declared within a function, accessible only within it.
 * - Global scope: Declared outside functions, accessible with 'global' keyword.
 * - Static scope: Retains value between function invocations.
 * 
 * CONDITIONAL STATEMENTS:
 * - if, if-else, if-elseif-else
 * - switch statement
 * - match expression (PHP 8.0+)
 * 
 * LOOPS:
 * - while: Evaluates condition before each iteration.
 * - do-while: Executes code block at least once before checking condition.
 * - for: Standard initialization, condition, increment loop.
 * - foreach: Optimized for traversing arrays and collections.
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 2: Variables, Conditions & Loops\n";
echo "======================================================\n\n";

// 1. Variable Scopes
$globalCounter = 100;

function demonstrateScopes() {
    global $globalCounter; // Accessing global variable inside function
    $localMessage = "I am local";
    static $invocationCount = 0; // Retains value across calls

    $invocationCount++;
    echo "   [Call #$invocationCount] Local: $localMessage | Global: $globalCounter\n";
}

echo "1. Variable Scope Demonstration:\n";
demonstrateScopes();
demonstrateScopes();
demonstrateScopes();
echo "\n";

// 2. Conditional Statements (Grading System Demo)
echo "2. Conditional Statements (if-elseif-else & match):\n";
$studentScore = 85;

if ($studentScore >= 90) {
    $grade = "A+";
} elseif ($studentScore >= 80) {
    $grade = "A";
} elseif ($studentScore >= 70) {
    $grade = "B";
} elseif ($studentScore >= 60) {
    $grade = "C";
} else {
    $grade = "F";
}

echo "   Score: $studentScore -> Calculated Grade: $grade\n";

// PHP 8+ match expression
$statusRole = 'manager';
$dashboardRoute = match($statusRole) {
    'client'   => '/client',
    'manager'  => '/manager',
    'assignee' => '/assignee',
    'reviewer' => '/reviewer',
    default    => '/login',
};
echo "   Match Expression: Role '$statusRole' maps to '$dashboardRoute'\n\n";

// 3. Loops Demonstration
echo "3. Loops Demonstration:\n";

// 3a. for loop
echo "   a) for loop (Multiplication of 5):\n      ";
for ($i = 1; $i <= 5; $i++) {
    echo "5x$i=" . (5 * $i) . ($i < 5 ? ", " : "\n");
}

// 3b. while loop
echo "   b) while loop (Countdown):\n      ";
$count = 3;
while ($count > 0) {
    echo "$count... ";
    $count--;
}
echo "Go!\n";

// 3c. do-while loop
echo "   c) do-while loop (Guaranteed one execution):\n      ";
$num = 10;
do {
    echo "Executed with \$num = $num\n";
    $num++;
} while ($num < 10);

// 3d. foreach loop (Key => Value)
echo "   d) foreach loop over TaskOrbit Role Permissions:\n";
$rolePermissions = [
    "client"   => "Create projects, define requirements, view milestones",
    "manager"  => "Allocate tasks, manage team, export reports, resolve conflicts",
    "assignee" => "Start assigned tasks, track subtasks, submit deliverables",
    "reviewer" => "Review submissions, request revisions, approve deliverables",
];

foreach ($rolePermissions as $role => $permission) {
    echo "      * " . ucfirst($role) . ": $permission\n";
}

echo "\n--- Topic 2 Completed Successfully ---\n";

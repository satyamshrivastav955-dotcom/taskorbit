<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 5: ARRAYS AND ARRAY FUNCTIONS IN PHP
 * ============================================================================
 * 
 * TYPES OF ARRAYS:
 * 1. Indexed Array: Numeric index starting at 0.
 * 2. Associative Array: Named keys associated with values (key => value).
 * 3. Multidimensional Array: Array containing one or more arrays.
 * 
 * ESSENTIAL ARRAY FUNCTIONS:
 * - count(), sizeof(): Total number of elements.
 * - array_push(), array_pop(): Add to / remove from end.
 * - array_shift(), array_unshift(): Remove from / add to beginning.
 * - in_array(): Checks if a value exists in an array.
 * - array_keys(), array_values(): Retrieve all keys or values.
 * - array_merge(): Merges one or more arrays.
 * - array_filter(): Filters elements using a callback function.
 * - array_map(): Applies a callback to all elements.
 * - sort(), rsort(), asort(), ksort(): Various sorting mechanisms.
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 5: Arrays and Array Functions\n";
echo "======================================================\n\n";

// 1. Indexed Arrays
echo "1. Indexed Array:\n";
$frameworks = ["Laravel", "Express.js", "React", "Spring Boot"];
array_push($frameworks, "Next.js"); // Add to end

echo "   Elements count: " . count($frameworks) . "\n";
echo "   Contains 'Laravel': " . (in_array("Laravel", $frameworks) ? "Yes" : "No") . "\n";
echo "   Frameworks list: " . implode(", ", $frameworks) . "\n\n";

// 2. Associative Arrays
echo "2. Associative Array:\n";
$developerProfile = [
    "name"       => "Alice Sharma",
    "role"       => "Lead Assignee",
    "email"      => "engineer1@taskorbit.local",
    "tasksDone"  => 14,
    "rating"     => 4.9,
];

echo "   Developer: {$developerProfile['name']} ({$developerProfile['role']})\n";
echo "   Keys: " . implode(", ", array_keys($developerProfile)) . "\n";
echo "   Values: " . implode(", ", array_values($developerProfile)) . "\n\n";

// 3. Multidimensional Arrays
echo "3. Multidimensional Array (Task List):\n";
$tasks = [
    ["id" => "T-101", "title" => "Design Database Schema", "priority" => "high",   "hours" => 6],
    ["id" => "T-102", "title" => "Build Express Endpoints", "priority" => "high",   "hours" => 12],
    ["id" => "T-103", "title" => "Write Unit Tests",        "priority" => "medium", "hours" => 4],
    ["id" => "T-104", "title" => "Update Documentation",    "priority" => "low",    "hours" => 2],
];

foreach ($tasks as $t) {
    echo "   [{$t['id']}] {$t['title']} | Priority: {$t['priority']} | Est: {$t['hours']}h\n";
}
echo "\n";

// 4. Array Higher-Order Functions: array_filter & array_map
echo "4. Higher-Order Array Functions:\n";

// Filter: Get only 'high' priority tasks
$highPriorityTasks = array_filter($tasks, fn($t) => $t['priority'] === 'high');
echo "   High priority task count: " . count($highPriorityTasks) . "\n";

// Map: Extract only task titles in uppercase
$taskTitles = array_map(fn($t) => strtoupper($t['title']), $tasks);
echo "   Mapped Titles: " . implode(" | ", $taskTitles) . "\n\n";

// 5. Sorting Functions
echo "5. Sorting Demonstrations:\n";
$scores = ["Bob" => 75, "Alice" => 95, "Charlie" => 88];

// asort(): Sorts associative array by value in ascending order, keeping key association
asort($scores);
echo "   asort() by score (value):\n";
foreach ($scores as $student => $score) {
    echo "      $student => $score\n";
}

// ksort(): Sorts associative array by key in alphabetical order
ksort($scores);
echo "   ksort() by student name (key):\n";
foreach ($scores as $student => $score) {
    echo "      $student => $score\n";
}

echo "\n--- Topic 5 Completed Successfully ---\n";

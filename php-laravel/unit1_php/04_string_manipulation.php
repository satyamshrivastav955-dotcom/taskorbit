<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 4: STRING MANIPULATION IN PHP
 * ============================================================================
 * 
 * CORE STRING FUNCTIONS:
 * - strlen(): Returns length of a string.
 * - str_word_count(): Counts words in a string.
 * - strrev(): Reverses a string.
 * - strpos(): Finds the numeric position of the first occurrence of a substring.
 * - str_replace(): Replaces all occurrences of a search string with replacement.
 * - substr(): Extracts a portion of a string.
 * - strtolower(), strtoupper(), ucfirst(), ucwords(): Case transformation.
 * - trim(), ltrim(), rtrim(): Strips whitespace from beginning/end.
 * - explode(), implode(): Converts string to array and array to string.
 * - String interpolation (double quotes) vs literal string (single quotes).
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 4: String Manipulation in PHP\n";
echo "======================================================\n\n";

$text = "  TaskOrbit Project Workspace Management System  ";

// 1. Trimming & Length
$trimmed = trim($text);
echo "1. Trimming & Length:\n";
echo "   Original Length: " . strlen($text) . " chars\n";
echo "   Trimmed Length : " . strlen($trimmed) . " chars (value: '$trimmed')\n\n";

// 2. Case Conversions
echo "2. Case Conversions:\n";
echo "   Uppercase : " . strtoupper($trimmed) . "\n";
echo "   Lowercase : " . strtolower($trimmed) . "\n";
echo "   Title Case: " . ucwords(strtolower($trimmed)) . "\n\n";

// 3. Search and Extraction
echo "3. Search & Substring Extraction:\n";
$pos = strpos($trimmed, "Workspace");
echo "   Position of 'Workspace': $pos\n";
$extracted = substr($trimmed, 0, 9); // First 9 chars
echo "   Extracted (0 to 9)     : '$extracted'\n\n";

// 4. String Replacement
echo "4. String Replacement:\n";
$replaced = str_replace("System", "Platform v2.0", $trimmed);
echo "   Replaced 'System' with 'Platform v2.0':\n   '$replaced'\n\n";

// 5. Explode (Split) & Implode (Join)
echo "5. Explode & Implode:\n";
$csvRoles = "client,manager,assignee,reviewer";
$rolesArray = explode(",", $csvRoles);

echo "   Exploded into Array:\n";
foreach ($rolesArray as $index => $r) {
    echo "      [$index] => $r\n";
}

$rejoined = implode(" | ", array_map('ucfirst', $rolesArray));
echo "   Rejoined with Implode: $rejoined\n\n";

// 6. String Sanitization & Security Escaping
echo "6. Security Escaping for HTML Output (XSS prevention):\n";
$unsafeUserComment = "<script>alert('XSS Exploit!');</script>Great project!";
$safeHtml = htmlspecialchars($unsafeUserComment, ENT_QUOTES, 'UTF-8');
echo "   Raw Unsafe: $unsafeUserComment\n";
echo "   Safe HTML : $safeHtml\n\n";

echo "--- Topic 4 Completed Successfully ---\n";

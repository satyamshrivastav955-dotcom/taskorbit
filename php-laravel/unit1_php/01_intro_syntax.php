<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 1: PHP INTRODUCTION, FEATURES, SYNTAX & EXECUTION
 * ============================================================================
 * 
 * WHAT IS PHP?
 * PHP (Hypertext Preprocessor) is an open-source, server-side scripting language
 * widely used for web development. PHP code is executed on the server, and the
 * resulting plain HTML is sent to the client's browser.
 * 
 * KEY FEATURES:
 * 1. Server-side Execution: Client never sees PHP source code.
 * 2. Cross-Platform: Runs on Windows, Linux, macOS (via Apache, Nginx, or CLI).
 * 3. Loosely Typed: Variable data types do not need explicit declaration.
 * 4. Database Integration: Built-in drivers for MySQL, PostgreSQL, SQLite, etc.
 * 5. Open Source & Community-driven: Extensible with Composer and frameworks (Laravel).
 * 
 * HOW TO EXECUTE:
 * - Command Line (CLI): php 01_intro_syntax.php
 * - Built-in Web Server: php -S localhost:8000
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 1: PHP Syntax & Script Execution Demonstration\n";
echo "======================================================\n\n";

// 1. Basic Output: echo vs print
// echo can take multiple parameters and has no return value.
// print returns 1 and takes a single argument.
echo "1. Basic Output:\n";
echo "   Hello, TaskOrbit from PHP " . PHP_VERSION . "!\n";
print("   Print function output demonstration.\n\n");

// 2. Comments in PHP
// Single-line comment using double-slash
# Single-line comment using hash/pound
/* Multi-line comment block */

// 3. Data Types Overview
$stringVar  = "Web Technology Unit I";   // String
$intVar     = 2026;                     // Integer
$floatVar   = 98.5;                     // Float (Double)
$boolVar    = true;                     // Boolean
$nullVar    = null;                     // NULL

echo "2. Data Types & var_dump() Inspection:\n";
echo "   String : $stringVar\n";
echo "   Integer: $intVar\n";
echo "   Float  : $floatVar\n";
echo "   Boolean: " . ($boolVar ? "true" : "false") . "\n";
echo "   Type inspection with var_dump:\n   ";
var_dump($floatVar);
echo "\n";

// 4. Constants
// Defined using define() or const keyword (compile-time)
define("APP_NAME", "TaskOrbit Syllabus Module");
const COURSE_CODE = "WT-CS301";

echo "3. Constants:\n";
echo "   APP_NAME   : " . APP_NAME . "\n";
echo "   COURSE_CODE: " . COURSE_CODE . "\n\n";

// 5. Embedded HTML Simulation (PHP in HTML)
$embeddedOutput = <<<HTML
4. Simulated Embedded HTML Output:
   <!DOCTYPE html>
   <html>
   <body>
       <h1>Welcome to {$stringVar}</h1>
       <p>Current Year: {$intVar}</p>
   </body>
   </html>
HTML;

echo $embeddedOutput . "\n\n";

echo "--- Topic 1 Completed Successfully ---\n";

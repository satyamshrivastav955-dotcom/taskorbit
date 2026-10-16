<?php
/**
 * ============================================================================
 * UNIT I: PHP & LARAVEL MASTER SYLLABUS RUNNER
 * ============================================================================
 * Runs all 12 topic scripts in sequence and displays structured console output.
 * Usage: php run_all.php
 * ============================================================================
 */

echo "######################################################################\n";
echo "#  TASKORBIT WEB TECHNOLOGY SYLLABUS — UNIT I: PHP & LARAVEL RUNNER   #\n";
echo "######################################################################\n\n";

$scripts = [
    '01_intro_syntax.php'              => '1. PHP Intro, Features, Syntax & Execution',
    '02_variables_conditions_loops.php' => '2. Variables, Scopes, Conditions & Loops',
    '03_functions.php'                  => '3. Functions, Arguments, Closures & Arrow Functions',
    '04_string_manipulation.php'        => '4. String Manipulation & Security Escaping',
    '05_arrays_and_functions.php'       => '5. Indexed, Associative & Multidimensional Arrays',
    '06_forms_get_post.php'             => '6. HTML Form Handling using GET and POST',
    '07_form_validation.php'            => '7. Form Validation & Email Format Validation',
    '08_cookies_and_sessions.php'       => '8. Cookies and Sessions Lifecycle',
    '09_file_handling.php'              => '9. File Handling (open, read, write, append, close)',
    '10_exception_handling.php'         => '10. Exception Handling (try, catch, finally, custom)',
    '11_mysql_prepared_statements.php'  => '11. PHP with MySQL CRUD & Prepared Statements',
    '12_laravel_crud_guide.php'         => '12. Laravel Framework (Routes, MVC, Blade & CRUD)',
];

$dir = __DIR__;
$passed = 0;
$total = count($scripts);

foreach ($scripts as $file => $title) {
    echo "\n>>> RUNNING: $title ($file) <<<\n";
    echo str_repeat("-", 70) . "\n";
    $filePath = $dir . DIRECTORY_SEPARATOR . $file;
    if (file_exists($filePath)) {
        require $filePath;
        $passed++;
    } else {
        echo "ERROR: File $file not found!\n";
    }
    echo str_repeat("=", 70) . "\n";
}

echo "\nSummary: $passed / $total Unit I syllabus topics executed successfully.\n";

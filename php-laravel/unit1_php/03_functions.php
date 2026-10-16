<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 3: FUNCTIONS IN PHP
 * ============================================================================
 * 
 * CONCEPTS:
 * 1. User-defined functions vs built-in functions.
 * 2. Function parameters and return values.
 * 3. Default argument values.
 * 4. Pass by value vs Pass by reference (using the '&' operator).
 * 5. Type declarations (type hinting & return types).
 * 6. Anonymous functions (closures) and Arrow functions (PHP 7.4+).
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 3: Functions in PHP\n";
echo "======================================================\n\n";

// 1. Basic Function with Type Hinting and Return Type
function calculateProgress(int $completedTasks, int $totalTasks): int {
    if ($totalTasks <= 0) {
        return 0;
    }
    return (int) round(($completedTasks / $totalTasks) * 100);
}

echo "1. Typed Function:\n";
$pct = calculateProgress(4, 5);
echo "   Progress for 4/5 tasks: $pct%\n\n";

// 2. Default Argument Values
function generateTaskSummary(string $title, string $priority = "Medium", string $status = "todo"): string {
    return "[Task: $title | Priority: $priority | Status: $status]";
}

echo "2. Default Arguments:\n";
echo "   With defaults: " . generateTaskSummary("Design Landing UI") . "\n";
echo "   With custom  : " . generateTaskSummary("API Integration", "High", "in_progress") . "\n\n";

// 3. Pass by Value vs Pass by Reference (&)
function doubleByValue(int $val): void {
    $val = $val * 2;
}

function doubleByReference(int &$val): void {
    $val = $val * 2;
}

echo "3. Pass by Value vs Pass by Reference:\n";
$original = 25;
doubleByValue($original);
echo "   After doubleByValue: $original (unchanged)\n";

doubleByReference($original);
echo "   After doubleByReference: $original (modified in-place)\n\n";

// 4. Anonymous Functions (Closures) & Arrow Functions
$taxRate = 0.18; // 18% GST

// Closure with 'use' keyword to bind outer variable
$calculateTotal = function(float $subtotal) use ($taxRate): float {
    return $subtotal + ($subtotal * $taxRate);
};

// Arrow Function (auto-captures outer variables by value)
$applyDiscount = fn(float $amount, float $discount) => $amount - ($amount * ($discount / 100));

echo "4. Closures and Arrow Functions:\n";
$basePrice = 1000.0;
$withTax = $calculateTotal($basePrice);
$withDiscount = $applyDiscount($withTax, 10.0);

echo "   Base Price   : INR $basePrice\n";
echo "   With 18% GST : INR $withTax\n";
echo "   With 10% Off : INR $withDiscount\n\n";

// 5. Variadic Functions (... operator)
function sumEstimates(int ...$hours): int {
    return array_sum($hours);
}

echo "5. Variadic Function (Sum of sprint estimates):\n";
echo "   Sprint total hours: " . sumEstimates(4, 8, 12, 16, 6) . " hours\n\n";

echo "--- Topic 3 Completed Successfully ---\n";

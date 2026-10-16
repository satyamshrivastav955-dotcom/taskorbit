<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 10: EXCEPTION HANDLING IN PHP
 * ============================================================================
 * 
 * CORE CONCEPTS:
 * 1. try block: Encloses code that may throw an exception.
 * 2. throw keyword: Triggers an exceptional condition with an Exception object.
 * 3. catch block: Catches and gracefully recovers from specific exception types.
 * 4. finally block: Always executes regardless of whether an exception was thrown.
 * 5. Custom Exceptions: Extending the built-in \Exception class.
 * 6. Exception Methods:
 *    - getMessage(): Error description.
 *    - getCode(): Numeric error code.
 *    - getFile(): File where exception was thrown.
 *    - getLine(): Line number of throw statement.
 *    - getTraceAsString(): Stack trace representation.
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 10: Exception Handling in PHP\n";
echo "======================================================\n\n";

// 1. Custom Exception Class
class TaskValidationException extends Exception {
    private array $validationErrors;

    public function __construct(string $message, array $errors = [], int $code = 422) {
        parent::__construct($message, $code);
        $this->validationErrors = $errors;
    }

    public function getValidationErrors(): array {
        return $this->validationErrors;
    }
}

class AuthorizationException extends Exception {}

// 2. Business Logic with Exception Guards
function validateAndAssignTask(string $title, string $role, int $hours): void {
    if (trim($title) === "") {
        throw new TaskValidationException("Validation failed", ["title" => "Title cannot be empty."]);
    }
    if ($hours <= 0 || $hours > 100) {
        throw new TaskValidationException("Validation failed", ["hours" => "Estimated hours must be between 1 and 100."]);
    }
    if ($role !== 'manager') {
        throw new AuthorizationException("Forbidden: Only a 'manager' can assign tasks to team members.", 403);
    }
}

// 3. Testing Standard Exception (Division by Zero)
echo "1. Handling Standard Built-in Exceptions:\n";
try {
    $dividend = 100;
    $divisor = 0;
    if ($divisor === 0) {
        throw new InvalidArgumentException("Division by zero is not permissible in mathematics.", 1001);
    }
    $result = $dividend / $divisor;
    echo "   Result: $result\n";
} catch (InvalidArgumentException $e) {
    echo "   Caught InvalidArgumentException!\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   Code   : " . $e->getCode() . "\n";
} finally {
    echo "   [Finally block executed]: Cleaned up arithmetic resources.\n\n";
}

// 4. Testing Custom Validation Exception
echo "2. Handling Custom TaskValidationException:\n";
try {
    validateAndAssignTask("", "manager", 0);
} catch (TaskValidationException $e) {
    echo "   Caught TaskValidationException!\n";
    echo "   Message: " . $e->getMessage() . " (HTTP " . $e->getCode() . ")\n";
    echo "   Detailed Field Errors:\n";
    foreach ($e->getValidationErrors() as $field => $msg) {
        echo "      * $field: $msg\n";
    }
} catch (AuthorizationException $e) {
    echo "   Caught AuthorizationException: " . $e->getMessage() . "\n";
} finally {
    echo "   [Finally block]: Validation audit log recorded.\n\n";
}

// 5. Testing Authorization Exception
echo "3. Handling AuthorizationException (Role Gate):\n";
try {
    validateAndAssignTask("Implement Unit II React", "client", 8);
} catch (AuthorizationException $e) {
    echo "   Access Denied Exception Caught!\n";
    echo "   Message: " . $e->getMessage() . " (Status: " . $e->getCode() . ")\n";
} catch (Exception $e) {
    echo "   Generic fallback catch: " . $e->getMessage() . "\n";
} finally {
    echo "   [Finally block]: Security transaction finished.\n\n";
}

echo "--- Topic 10 Completed Successfully ---\n";

<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 9: FILE HANDLING IN PHP
 * ============================================================================
 * 
 * CORE CONCEPTS:
 * 1. File Modes:
 *    - 'r' : Read only. Starts at beginning of file.
 *    - 'w' : Write only. Overwrites existing file or creates new file.
 *    - 'a' : Append only. Starts at end of file; preserves existing content.
 * 
 * 2. File Functions:
 *    - fopen($filename, $mode): Opens a file pointer stream.
 *    - fwrite($handle, $data): Writes bytes to file stream.
 *    - fread($handle, $length): Reads bytes from file stream.
 *    - fgets($handle): Reads a single line from file stream.
 *    - feof($handle): Checks if end-of-file has been reached.
 *    - fclose($handle): Closes the active file handle.
 *    - file_get_contents($filename): Fast one-liner to read entire file into string.
 *    - file_put_contents($filename, $data, FILE_APPEND): Fast one-liner to write.
 *    - file_exists($filename), filesize($filename), unlink($filename).
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 9: File Handling in PHP\n";
echo "======================================================\n\n";

$demoDir = sys_get_temp_dir();
$demoFile = $demoDir . DIRECTORY_SEPARATOR . "taskorbit_sample_log.txt";

echo "Working Demo File: $demoFile\n\n";

// 1. Writing to a file using fopen() and fwrite()
echo "1. Writing to file using fopen() and fwrite():\n";
$handle = fopen($demoFile, "w");
if ($handle === false) {
    die("Failed to open file for writing.\n");
}

$initialData = "LOG [2026-10-16 10:00:00]: Workspace initialized.\n" .
               "LOG [2026-10-16 10:05:00]: Project 'TaskOrbit' created by Client.\n";
fwrite($handle, $initialData);
fclose($handle);
echo "   Successfully wrote initial log entries.\n\n";

// 2. Appending to a file using 'a' mode
echo "2. Appending new entry using 'a' mode:\n";
$appendHandle = fopen($demoFile, "a");
fwrite($appendHandle, "LOG [2026-10-16 10:15:00]: Task 'Syllabus Integration' approved by Reviewer.\n");
fclose($appendHandle);
echo "   Appended 1 additional entry.\n\n";

// 3. Reading line-by-line using fgets() and feof()
echo "3. Reading line-by-line using fgets() & feof():\n";
$readHandle = fopen($demoFile, "r");
$lineNumber = 1;
while (!feof($readHandle)) {
    $line = fgets($readHandle);
    if ($line !== false && trim($line) !== "") {
        echo "   Line $lineNumber: " . trim($line) . "\n";
        $lineNumber++;
    }
}
fclose($readHandle);
echo "\n";

// 4. One-Liner Helpers: file_get_contents() and file_put_contents()
echo "4. Convenient file_get_contents() & file_put_contents():\n";
file_put_contents($demoFile, "LOG [2026-10-16 10:30:00]: Automated backup completed.\n", FILE_APPEND);
$fullContent = file_get_contents($demoFile);
$fileSize = filesize($demoFile);

echo "   Total File Size: $fileSize bytes\n";
echo "   Total Lines    : " . substr_count($fullContent, "\n") . "\n\n";

// 5. Cleanup
echo "5. File Cleanup (unlink):\n";
if (file_exists($demoFile)) {
    unlink($demoFile);
    echo "   File successfully deleted. Exists now: " . (file_exists($demoFile) ? "Yes" : "No") . "\n";
}

echo "\n--- Topic 9 Completed Successfully ---\n";

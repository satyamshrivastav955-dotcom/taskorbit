<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportNoteController;
use App\Http\Controllers\ProjectOverviewController;
use App\Http\Controllers\StudentDemoController;

Route::get('/login', fn() => view('auth.login'))->name('login');
Route::post('/login', [ReportNoteController::class, 'login']);

Route::middleware('auth.session')->group(function () {
    Route::get('/notes', [ReportNoteController::class, 'index']);
    Route::post('/notes', [ReportNoteController::class, 'store']);
    Route::delete('/notes/{id}', [ReportNoteController::class, 'destroy']);
    Route::get('/notes/{id}/download', [ReportNoteController::class, 'download']);
    Route::get('/overview', [ProjectOverviewController::class, 'index']);
});

// --- Unit I: Syllabus Learning Routes (Accessible for demo) ---
Route::get('/students', [StudentDemoController::class, 'index']);
Route::post('/students', [StudentDemoController::class, 'store']);
Route::delete('/students/{id}', [StudentDemoController::class, 'destroy']);

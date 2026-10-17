<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportNoteController;
use App\Http\Controllers\ProjectOverviewController;

Route::get('/login', fn() => view('auth.login'))->name('login');
Route::post('/login', [ReportNoteController::class, 'login']);
Route::post('/logout', [ReportNoteController::class, 'logout'])->name('logout');

Route::get('/register', fn() => view('auth.register'))->name('register');
Route::post('/register', [ReportNoteController::class, 'register']);

Route::middleware('auth.session')->group(function () {
    Route::get('/notes', [ReportNoteController::class, 'index'])->name('notes.index');
    Route::get('/notes/{id}/edit', [ReportNoteController::class, 'edit'])->name('notes.edit');
    Route::get('/notes/{id}/download', [ReportNoteController::class, 'download'])->name('notes.download');
    Route::get('/notes/{id}', [ReportNoteController::class, 'show'])->name('notes.show');
    Route::post('/notes', [ReportNoteController::class, 'store'])->name('notes.store');
    Route::put('/notes/{id}', [ReportNoteController::class, 'update'])->name('notes.update');
    Route::delete('/notes/{id}', [ReportNoteController::class, 'destroy'])->name('notes.destroy');
    Route::post('/notes/preference', [ReportNoteController::class, 'preference'])->name('notes.preference');
    Route::get('/overview', [ProjectOverviewController::class, 'index'])->name('overview.index');
});

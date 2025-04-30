<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\NotebookController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NoteAttachmentController;
use App\Http\Controllers\CommunityController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/users/search', [UserController::class, 'search'])->name('users.search');

    Route::resource('notebooks', NotebookController::class);
    Route::post('notebooks/{notebook}/share', [NotebookController::class, 'share'])->name('notebooks.share');
    Route::get('/notebooks/{id}', [NotebookController::class, 'show'])->name('notebooks.show');
    Route::get('/notes/{note}/attachments', [NoteAttachmentController::class, 'index']);

    Route::get('/notebooks/{notebook}/notes/create', [NoteController::class, 'editor'])->name('notes.editor');
    Route::get('/notebooks/{notebook}/notes/{note}', [NoteController::class, 'editor'])->name('notes.edit');
    Route::post('/notes/attachments', [NoteAttachmentController::class, 'store']);
    Route::post('/notebooks/{notebook}/notes', [NoteController::class, 'store'])->name('notes.store');
    Route::put('/notes/{note}', [NoteController::class, 'update'])->name('notes.update');
    Route::get('/notes/{note}', [NoteController::class, 'show'])->name('notes.show');
    Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');




    Route::get('/community',  [CommunityController::class, 'index'])->name('community.index');
    Route::post('/community', [CommunityController::class, 'store'])->name('community.store');
    

    Route::get('/sketch', fn () => Inertia::render('Sketch/SketchPad'))
     ->name('sketch');

});




require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

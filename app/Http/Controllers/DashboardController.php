<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Notebook;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $latestNote = Note::with(['notebook'])
            ->where('created_by', auth()->id())
            ->latest('modified_at')
            ->first([
                'id',
                'content',
                'title',
                'notebook_id',
                'modified_at',
            ]);

        $publicNotes = Note::with(['notebook', 'creator'])
            ->whereHas('notebook', fn($q) => $q->where('is_public', true))
            ->latest('modified_at')
            ->paginate(10, [
                'id',
                'title',
                'content',
                'notebook_id',
                'modified_at',
                'created_by',
            ]);

        return Inertia::render('dashboard', [
            'latestNote'     => $latestNote,
            'publicNotes'    => $publicNotes,
        ]);
    }
}
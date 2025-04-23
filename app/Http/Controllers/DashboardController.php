<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Notebook;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
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

        $latestNotebooks = Notebook::where('created_by', auth()->id())
            ->latest('updated_at')
            ->take(4)
            ->get([
                'id',
                'title',
                'description',
                'updated_at',
            ]);

        $publicNotes = Note::with(['notebook', 'creator'])
            ->whereHas('notebook', fn($q) => $q->where('is_public', true))
            ->latest('modified_at')
            ->get([
                'id',
                'title',
                'content',
                'notebook_id',
                'modified_at',
                'created_by',        
            ]);

        return Inertia::render('dashboard', [
            'latestNote'     => $latestNote,
            'latestNotebooks'=> $latestNotebooks,
            'publicNotes'    => $publicNotes,
        ]);
    }
}

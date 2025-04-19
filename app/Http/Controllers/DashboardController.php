<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Note;
Use App\Models\Notebook;

class DashboardController extends Controller
{
    public function index()
    {
        $latestNote = Note::with('notebook')
            ->where('created_by', auth()->id())
            ->latest('modified_at')
            ->first(['id', 'content', 'title', 'notebook_id', 'modified_at']);
    
        $latestNotebooks = Notebook::where('created_by', auth()->id())
            ->latest('updated_at') // or 'created_at'
            ->take(4)
            ->get(['id', 'title', 'description', 'updated_at']); // send only what's needed
    
        return Inertia::render('dashboard', [
            'latestNote' => $latestNote,
            'latestNotebooks' => $latestNotebooks,
        ]);
    }
    

}

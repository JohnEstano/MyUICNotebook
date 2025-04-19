<?php

namespace App\Http\Controllers;

use App\Models\Notebook;
use Illuminate\Http\Request;
use App\Enums\NotebookPermission;
use Inertia\Inertia;

class CommunityController extends Controller
{

    public function index()
    {
        $publicNotebooks = Notebook::where('is_public', true)
            ->with('creator')
            ->latest()
            ->get(); 
    
        return Inertia::render('Community/Index', [
            'notebooks' => $publicNotebooks,
        ]);
    }

    /**
     * Store a newly created public notebook.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
        
        ]);
        
       
        $notebook = Notebook::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'color' => $validated['color'],
            'created_by' => auth()->id(),
            'modified_at' => now(),
            'is_public' => true, 
        ]);

      
        $notebook->users()->attach(auth()->id(), [
            'permission' => NotebookPermission::OWNER->value,
        ]);

        return redirect()
            ->route('community.index')
            ->with('success', 'Community notebook created!');
    }
}

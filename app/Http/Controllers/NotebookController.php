<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notebook;
use Inertia\Inertia;
use App\Enums\NotebookPermission;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class NotebookController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $notebooks = auth()->user()->notebooks()->with(['creator', 'users'])->get();

        return Inertia::render('Notebooks/Index', [
            'notebooks' => $notebooks,
        ]);
    }
    public function share(Request $request, $notebookId)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'permission' => 'required|in:viewer,editor,remove',
        ]);

        $notebook = Notebook::with('users')->findOrFail($notebookId);

        $currentUser = auth()->user();
        $currentUserId = $currentUser->id;


        $isOwner = $notebook->created_by === $currentUserId;

        $userPermission = $notebook->users
            ->firstWhere('id', $currentUserId)
            ?->pivot
                ?->permission;

        $isEditor = $userPermission === NotebookPermission::EDITOR->value;

        if (!($isOwner || $isEditor)) {
            abort(403, 'You are not authorized to share this notebook.');
        }

        if ($data['permission'] === 'remove') {
            $notebook->users()->detach($data['user_id']);
            return redirect()->back()->with('success', 'User removed successfully.');
        }

        $notebook->users()->syncWithoutDetaching([
            $data['user_id'] => ['permission' => $data['permission']],
        ]);

        return redirect()->back()->with('success', 'Notebook shared successfully.');
    }

    public function show(Request $request, Notebook $notebook)
    {
        $this->authorize('view', $notebook);

        $notebook->load(['creator', 'users', 'notes']);
        $userId = auth()->id();

        $permission = null;

        if ($notebook->created_by === $userId) {
            $permission = NotebookPermission::OWNER->value;
        } else {
            $userAccess = $notebook->users->firstWhere('id', $userId);


            $permission = $userAccess?->pivot->permission ??
                ($notebook->is_public ? NotebookPermission::VIEWER->value : null);
        }

        return Inertia::render('Notebooks/Show', [
            'notebook' => [
                'id' => $notebook->id,
                'title' => $notebook->title,
                'description' => $notebook->description,
                'is_public' => $notebook->is_public,
                'creator' => $notebook->creator,
                'users' => $notebook->users,
                'notes' => $notebook->notes,
                'permission' => $permission,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Notebooks/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string',
            'is_public' => 'boolean' 
        ]);

        $notebook = Notebook::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'color' => $validated['color'],
            'is_public' => $request->boolean('is_public'), 
            'created_by' => auth()->id(),
            'modified_at' => now(),
        ]);

        $notebook->users()->attach(auth()->id(), [
            'permission' => NotebookPermission::OWNER->value,
        ]);

        return redirect()->route('notebooks.index')->with('success', 'Notebook created!');
    }

    public function edit(Notebook $notebook)
    {
        return Inertia::render('Notebooks/Edit', [
            'notebook' => $notebook->load('tags'),
        ]);
    }

    public function update(Request $request, Notebook $notebook)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'is_public' => 'boolean' 
         
        ]);

        $notebook->update([
            ...$data,
            'is_public' => $request->boolean('is_public'), 
            'modified_at' => now(),
        ]);

        if ($request->has('tag_ids')) {
            $notebook->tags()->sync($request->input('tag_ids'));
        }

        return redirect()->route('notebooks.index')->with('message', 'Notebook updated successfully!');
    }

    public function destroy(Notebook $notebook)
    {
        $this->authorize('delete', $notebook);

        $notebook->delete();

        return redirect()->route('notebooks.index');
    }
}

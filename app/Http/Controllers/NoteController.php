<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Notebook;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Storage;

class NoteController extends Controller
{
    use AuthorizesRequests;

    public function editor(Notebook $notebook, Request $request, Note $note = null)
    {
        $notes = $notebook->notes()
            ->orderByDesc('updated_at')
            ->get();

        $attachments = collect([]);
        if ($note) {
            $attachments = $note->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'url' => Storage::url($attachment->file_url),
                ];
            });
        }
        $membership = auth()->user()
            ->notebooks()
            ->find($notebook->id);

        $permission = $membership
            ? ($membership->pivot->permission ?? 'viewer')
            : 'viewer';

        return Inertia::render('Notes/Editor', [
            'notebook' => $notebook,
            'notes' => $notes,
            'selectedNote' => $note,
            'attachments' => $attachments,
            'permission' => $permission,
        ]);

    }

    public function store(Request $request, Notebook $notebook)
    {
        $this->authorize('createNote', $notebook);

        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
        ]);

        $note = $notebook->notes()->create([
            'created_by' => auth()->id(),
            'title' => $data['title'] ?? '',
            'content' => $data['content'] ?? '',
            'modified_at' => now(),
        ]);

        return redirect()->route('notes.editor', $notebook->id);
    }

    public function update(Request $request, Note $note)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
        ]);

        $note->update([
            'title' => $data['title'] ?? '',
            'content' => $data['content'] ?? '',
            'modified_at' => now(),
        ]);

        return back()->with('message', 'Note updated');
    }

    public function show(Note $note)
    {
        return response()->json($note);
    }

    /**
     * Delete a note along with its associated attachments.
     *
     * @param Request $request
     * @param Note $note
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request, Note $note)
    {
        try {
            $this->authorize('delete', $note);

            \Log::info("Deleting attachments for Note ID: {$note->id}");

            foreach ($note->attachments as $attachment) {
                \Log::info("Processing attachment ID: {$attachment->id}");
                if (Storage::disk('public')->exists($attachment->file_url)) {
                    Storage::disk('public')->delete($attachment->file_url);
                }
                $attachment->delete();
            }

            $notebookId = $note->notebook_id;
            $note->delete();

            return response()->json([
                'message' => 'Note deleted successfully.',
                'redirect' => route('notes.editor', $notebookId)
            ]);
        } catch (\Exception $e) {
            \Log::error("Deletion error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

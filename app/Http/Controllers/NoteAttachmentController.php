<?php
namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\NoteAttachment;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class NoteAttachmentController extends Controller
{

    use AuthorizesRequests; // Add this line

    public function index(Note $note)
    {
        // Remove or modify this line if you're not using policies
        // $this->authorize('view', $note); // Only keep if you have policies set up
        
        return $note->attachments()->get()->map(function ($attachment) {
            return [
                'id' => $attachment->id,
                'url' => Storage::url($attachment->file_url)
            ];
        });
    }
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'file' => 'required|image',
            'note_id' => 'required|exists:notes,id',
        ]);
    
        // Store the uploaded file
        $file = $request->file('file');
        $path = $file->store('note-attachments', 'public'); // Ensure the 'public' disk is configured
    
        // Create the attachment record in the database
        $attachment = NoteAttachment::create([
            'file_url' => $path,
            'note_id' => $request->note_id,
        ]);
    
        // Return a JSON response with the attachment data
        return response()->json([
            'attachment' => [
                'id' => $attachment->id,
                'url' => Storage::url($path), // Return the URL of the image
            ]
        ]);
    }
}

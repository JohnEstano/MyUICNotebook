<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Note;

class NotePolicy
{
    /**
     * Determine if the user can delete the note.
     */

     
    public function delete(User $user, Note $note): bool
    {
        // Only allow deletion if the user created the note
        return $user->id === $note->created_by;
    }
}
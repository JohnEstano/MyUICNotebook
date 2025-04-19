<?php
namespace App\Policies;

use App\Enums\NotebookPermission;
use App\Models\Notebook;
use App\Models\User;

class NotebookPolicy
{
    public function view(User $user, Notebook $notebook)
    {
        // Public notebooks are viewable by anyone
        if ($notebook->is_public) {
            return true;
        }

        // Private notebooks require explicit access
        return $notebook->users()
            ->where('user_id', $user->id)
            ->whereIn('permission', [
                NotebookPermission::VIEWER->value,
                NotebookPermission::EDITOR->value,
                NotebookPermission::OWNER->value
            ])
            ->exists();
    }

    public function edit(User $user, Notebook $notebook)
    {
        // Editing requires explicit permissions (even for public notebooks)
        return $notebook->users()
            ->where('user_id', $user->id)
            ->whereIn('permission', [
                NotebookPermission::EDITOR->value,
                NotebookPermission::OWNER->value
            ])
            ->exists();
    }

    public function delete(User $user, Notebook $notebook): bool
    {
        // Only owner can delete
        return $notebook->created_by === $user->id;
    }

    public function createNote(User $user, Notebook $notebook)
    {
        // Note creation follows edit permissions
        return $this->edit($user, $notebook);
    }

    public function access(User $user, Notebook $notebook)
    {
        return $this->view($user, $notebook);
    }
}
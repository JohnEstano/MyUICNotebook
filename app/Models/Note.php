<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\NoteAttachment;

class Note extends Model
{
    protected $fillable = ['notebook_id', 'created_by', 'title', 'content'];

    public function notebook()
    {
        return $this->belongsTo(Notebook::class);
    }

   
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    protected static function booted(): void
{
    static::saving(function ($note) {
        if ($note->isDirty('content') || $note->isDirty('title')) {
            $note->modified_at = now();
        }
    });
}
public function attachments()
{
    return $this->hasMany(NoteAttachment::class);
}
}

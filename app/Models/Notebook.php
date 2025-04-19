<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Note;
use App\Models\User;
use App\Models\Tag;

class Notebook extends Model
{
    use HasFactory; 

    protected $fillable = [
        'title',
        'description',
        'created_by',
        'color', 
        'is_public' 
    ];

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    
    public function users()
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('permission')
                    ->withTimestamps();
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    protected static function booted(): void
{
    static::saving(function ($notebook) {
        if ($notebook->isDirty()) {
            $notebook->modified_at = now();
        }
    });
}

}

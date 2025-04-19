<?php


// app/Models/Tag.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['name'];

    public function notebooks()
    {
        return $this->belongsToMany(Notebook::class);
    }
}

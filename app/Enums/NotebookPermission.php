<?php

// app/Enums/NotebookPermission.php
namespace App\Enums;

enum NotebookPermission: string
{
    case OWNER = 'owner';
    case VIEWER = 'viewer';
    case EDITOR = 'editor';
}

<?php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Notebook;
use App\Policies\NotebookPolicy;
use App\Models\Note;
use App\Policies\NotePolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     */
    protected $policies = [
        Notebook::class => NotebookPolicy::class,
        Note::class => NotePolicy::class,
    ];

   
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

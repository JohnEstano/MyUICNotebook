<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notebook;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create 10 dummy notebooks
        Notebook::factory()->count(10)->create();
    }
}

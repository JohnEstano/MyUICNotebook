<?php

namespace Database\Factories;

use App\Models\Notebook;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotebookFactory extends Factory
{
    protected $model = Notebook::class;

    public function definition()
    {
        return [
            'title'       => $this->faker->sentence(3),
            'description' => $this->faker->paragraph,
            'color'       => $this->faker->hexColor,
            'created_by'  => 1, // adjust this if needed
        ];
    }
}

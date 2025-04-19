<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notebook_tag', function (Blueprint $table) {
            $table->foreignId('notebook_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->primary(['notebook_id', 'tag_id']); // Composite key
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notebook_tag');
    }
};

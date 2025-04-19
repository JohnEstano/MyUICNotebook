<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE `notebook_user` MODIFY `permission` ENUM('viewer', 'editor', 'owner') NOT NULL DEFAULT 'viewer'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `notebook_user` MODIFY `permission` ENUM('viewer', 'editor') NOT NULL DEFAULT 'viewer'");
    }
};
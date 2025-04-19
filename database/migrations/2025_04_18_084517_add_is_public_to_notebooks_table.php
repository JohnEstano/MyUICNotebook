<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('notebooks', function (Blueprint $table) {
            $table->boolean('is_public')->default(false)->after('title'); // Or after any appropriate column
        });
    }
    
    public function down()
    {
        Schema::table('notebooks', function (Blueprint $table) {
            $table->dropColumn('is_public');
        });
    }
    
};

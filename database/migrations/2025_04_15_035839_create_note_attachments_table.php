<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNoteAttachmentsTable extends Migration
{
    public function up()
    {
        Schema::create('note_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('note_id');
            $table->string('file_url');
            $table->string('file_type')->nullable();
            $table->timestamps();
            
            // Set a foreign key constraint so that attachments are removed when a note is deleted.
            $table->foreign('note_id')->references('id')->on('notes')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('note_attachments');
    }
}


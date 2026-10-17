<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('client_id')->nullable();
            $table->string('manager_id')->nullable();
            $table->string('status')->default('draft');
            $table->string('priority')->default('medium');
            $table->date('start_date')->nullable();
            $table->date('deadline')->nullable();
            $table->integer('progress')->default(0);
            $table->timestamps();
        });
        Schema::create('tasks', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('project_id');
            $table->string('title');
            $table->string('assignee_id')->nullable();
            $table->string('reviewer_id')->nullable();
            $table->date('start_date')->nullable();
            $table->date('deadline')->nullable();
            $table->string('priority')->default('medium');
            $table->string('status')->default('todo');
            $table->integer('revision_count')->default(0);
            $table->boolean('has_conflict')->default(false);
            $table->timestamps();
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('projects');
    }
};

<?php
/**
 * ============================================================================
 * UNIT I — TOPIC 12: LARAVEL AS A PHP FRAMEWORK (MVC, CRUD & VALIDATION)
 * ============================================================================
 * 
 * WHAT IS LARAVEL?
 * Laravel is an open-source PHP web framework following the Model-View-Controller (MVC)
 * architectural pattern. It provides developer tooling for routing, authentication,
 * object-relational mapping (Eloquent ORM), database migrations, and templating (Blade).
 * 
 * CORE LARAVEL ARCHITECTURE COMPONENTS:
 * 1. Routes (routes/web.php):
 *    - Maps HTTP verbs and URIs to Controller actions or closures.
 *    - Route::get('/students', [StudentController::class, 'index']);
 *    - Route::post('/students', [StudentController::class, 'store']);
 * 
 * 2. Controllers (app/Http/Controllers/):
 *    - Handles incoming HTTP requests, orchestrates business logic and models,
 *      and returns responses or views.
 * 
 * 3. Models (app/Models/):
 *    - Eloquent ORM active-record classes representing database tables.
 *    - Supports relations (hasMany, belongsTo) and query builder syntax:
 *      Student::where('status', 'active')->orderBy('name')->get();
 * 
 * 4. Blade Templates (resources/views/):
 *    - Lightweight templating engine with template inheritance (@extends, @section, @yield),
 *      control structures (@if, @foreach), and automatic XSS escaping ({{ $var }}).
 * 
 * 5. Migrations (database/migrations/):
 *    - Version control for database schemas using Blueprint methods (string, text, foreignId).
 * 
 * 6. Validation:
 *    - $request->validate(['email' => 'required|email|unique:students']);
 * ============================================================================
 */

echo "======================================================\n";
echo " TOPIC 12: Laravel Framework (MVC, CRUD & Architecture)\n";
echo "======================================================\n\n";

// 1. Routes Demonstration
echo "1. Routing Architecture (routes/web.php):\n";
$sampleRoutes = [
    ['METHOD' => 'GET',    'URI' => '/notes',            'ACTION' => 'ReportNoteController@index',  'PURPOSE' => 'List all notes'],
    ['METHOD' => 'POST',   'URI' => '/notes',            'ACTION' => 'ReportNoteController@store',  'PURPOSE' => 'Validate & create note'],
    ['METHOD' => 'DELETE', 'URI' => '/notes/{id}',       'ACTION' => 'ReportNoteController@destroy','PURPOSE' => 'Delete note & attachments'],
    ['METHOD' => 'GET',    'URI' => '/students',         'ACTION' => 'StudentDemoController@index', 'PURPOSE' => 'List students with Blade'],
    ['METHOD' => 'POST',   'URI' => '/students',         'ACTION' => 'StudentDemoController@store', 'PURPOSE' => 'Validate & store student'],
];

printf("   %-8s %-20s %-30s %s\n", "METHOD", "URI", "CONTROLLER ACTION", "PURPOSE");
echo "   " . str_repeat("-", 85) . "\n";
foreach ($sampleRoutes as $r) {
    printf("   %-8s %-20s %-30s %s\n", $r['METHOD'], $r['URI'], $r['ACTION'], $r['PURPOSE']);
}
echo "\n";

// 2. Controller Validation Architecture
echo "2. Controller & Request Validation (app/Http/Controllers/ReportNoteController.php):\n";
echo '   Code snippet from TaskOrbit ReportNoteController:
   public function store(Request $request) {
       $data = $request->validate([
           "project_id" => "required|string",
           "title"      => "required|string|max:200",
           "body"       => "required|string",
           "attachment" => "nullable|file|mimes:pdf,png,jpg,jpeg|max:5120",
       ]);
       DB::table("report_notes")->insert($data);
       return redirect("/notes")->with("ok", "Note created.");
   }' . "\n\n";

// 3. Eloquent Model Architecture
echo "3. Eloquent ORM Model (app/Models/ReportNote.php):\n";
echo '   class ReportNote extends Model {
       protected $table = "report_notes";
       protected $fillable = ["project_id", "title", "body", "attachment_path"];
       public function project() {
           return $this->belongsTo(Project::class);
       }
   }' . "\n\n";

// 4. Blade Templating Engine Syntax
echo "4. Blade Template Syntax (resources/views/notes/index.blade.php):\n";
echo '   @extends("layouts.app")
   @section("content")
       <h1>Project Delivery Notes</h1>
       @if(session("ok"))
           <div class="alert alert-success">{{ session("ok") }}</div>
       @endif
       @foreach($notes as $note)
           <article class="card">
               <h3>{{ $note->title }}</h3>
               <p>{{ $note->body }}</p>
           </article>
       @endforeach
   @endsection' . "\n\n";

// 5. Database Migrations
echo "5. Database Migration Example (database/migrations/...):\n";
echo '   Schema::create("report_notes", function (Blueprint $table) {
       $table->id();
       $table->string("project_id", 64);
       $table->string("title", 200);
       $table->text("body");
       $table->string("attachment_path")->nullable();
       $table->timestamps();
   });' . "\n\n";

echo "6. How to Run this Laravel App:\n";
echo "   1. Ensure PHP and Composer are installed.\n";
echo "   2. cd php-laravel\n";
echo "   3. composer install\n";
echo "   4. php artisan migrate\n";
echo "   5. php artisan serve (Launches at http://127.0.0.1:8000)\n\n";

echo "--- Topic 12 Completed Successfully ---\n";

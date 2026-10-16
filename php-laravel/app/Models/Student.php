<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Student Model for Syllabus Unit I demonstration
 */
class Student extends Model
{
    protected $table = 'demo_students';

    protected $fillable = [
        'name',
        'email',
        'role',
    ];

    public $timestamps = false;
}

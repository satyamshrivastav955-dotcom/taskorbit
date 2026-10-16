<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * ReportNote Eloquent Model
 * Demonstrates Laravel Eloquent Active Record pattern.
 */
class ReportNote extends Model
{
    protected $table = 'report_notes';

    protected $fillable = [
        'project_id',
        'title',
        'body',
        'attachment_path',
    ];

    public $timestamps = true;
}

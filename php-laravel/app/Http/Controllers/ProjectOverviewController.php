<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectOverviewController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', '');
        $query = DB::table('projects')->orderBy('deadline');
        if (in_array($status, ['draft', 'submitted', 'active', 'completed'], true)) {
            $query->where('status', $status);
        }
        $projects = $query->get();
        return view('overview.index', ['projects' => $projects, 'status' => $status]);
    }
}

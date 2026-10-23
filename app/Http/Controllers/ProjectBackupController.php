<?php

namespace App\Http\Controllers;

use App\Models\ProjectBackup;
use App\Services\ProjectBackups;
use Illuminate\Http\Request;

class ProjectBackupController extends Controller
{
    public function index(Request $request)
    {
        return response()->view('backups.index', ['backups' => ProjectBackup::where('user_id', $request->user()->id)->latest()->paginate(20),
            'events' => \Illuminate\Support\Facades\DB::table('project_backup_events')->where('user_id', $request->user()->id)->latest('id')->limit(20)->get()])
            ->header('Cache-Control', 'private, no-store');
    }

    public function store(Request $request, ProjectBackups $service)
    {
        $service->create($request->user());
        $service->prune($request->user());

        return back()->with('success', 'Copia privada creada. Incluye los proyectos guardados en el servidor.');
    }

    public function preview(Request $request, ProjectBackup $backup, ProjectBackups $service)
    {
        abort_unless($backup->user_id === $request->user()->id, 404);

        return response()->view('backups.preview', ['backup' => $backup, 'preview' => $service->preview($request->user(), $backup)])
            ->header('Cache-Control', 'private, no-store');
    }

    public function download(Request $request, ProjectBackup $backup, ProjectBackups $service)
    {
        $copy = $service->read($request->user(), $backup);
        $file = gzencode(json_encode($copy, JSON_THROW_ON_ERROR), 6);
        $service->event($request->user(), $backup, 'download');

        return response($file)->header('Content-Type', 'application/gzip')->header('Cache-Control', 'private, no-store')
            ->header('Content-Disposition', 'attachment; filename="proyectos-'.$backup->id.'.json.gz"');
    }

    public function restore(Request $request, ProjectBackup $backup, ProjectBackups $service)
    {
        abort_unless($backup->user_id === $request->user()->id, 404);
        $data = $request->validate(['revision' => 'required|string|size:64', 'confirm' => 'required|accepted', 'password' => 'required|current_password']);
        $safety = $service->restore($request->user(), $backup, $data['revision']);

        return redirect()->route('backups.index')->with('success', 'Restauración terminada. La copia #'.$safety->id.' conserva el estado anterior. Cierra y vuelve a abrir los proyectos para cargar los datos restaurados.');
    }
}

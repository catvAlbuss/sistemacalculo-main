<?php

namespace Tests\Feature;

use App\Models\CadModel;
use App\Models\MemoriaCalculo;
use App\Models\MemoriaDescriptiva;
use App\Models\MemoriaImagen;
use App\Models\ProjectBackup;
use App\Models\User;
use App\Services\ProjectBackups;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class ProjectBackupsTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Storage::fake('local');
    }

    private function project(User $user, string $name): array
    {
        $cad = CadModel::create(['user_id' => $user->id, 'name' => $name, 'data' => '{"nodes":[1,2]}',
            'is_compressed' => false, 'node_count' => 2, 'version' => 5, 'last_saved_at' => now()]);
        $memory = MemoriaCalculo::create(['user_id' => $user->id, 'cad_model_id' => $cad->id,
            'project_code' => (string) Str::uuid(), 'project_name' => $name, 'cover_data' => ['title' => $name]]);
        $image = MemoriaImagen::create(['memoria_calculo_id' => $memory->id, 'group_key' => 'coverImage',
            'index' => 0, 'image_base64' => 'data:image/png;base64,VEVTVA==']);
        $description = MemoriaDescriptiva::create(['user_id' => $user->id, 'cad_model_id' => $cad->id,
            'project_name' => $name, 'data' => ['notes' => 'Contenido descriptivo'], 'file_path' => '/archivo-generado.docx']);
        return [$cad, $memory, $image, $description];
    }

    public function test_backup_contains_only_owned_projects_and_images_and_is_encrypted_at_rest(): void
    {
        $user = User::factory()->create(); $other = User::factory()->create();
        $this->project($user, 'Proyecto propio'); $this->project($other, 'Proyecto ajeno');
        $service = app(ProjectBackups::class);
        $backup = $service->create($user);
        $copy = $service->read($user, $backup);
        $this->assertSame(['cad_models' => 1, 'memoria_calculos' => 1, 'memorias_descriptivas' => 1, 'memoria_imagenes' => 1], $backup->counts);
        $json = json_encode($copy);
        $this->assertStringContainsString('Proyecto propio', $json);
        $this->assertStringNotContainsString('Proyecto ajeno', $json);
        $this->assertStringNotContainsString($user->password, $json);
        $this->assertStringNotContainsString('file_path', $json);
        $this->assertStringNotContainsString('Proyecto propio', Storage::disk('local')->get($backup->path));
        $this->assertSame('data:image/png;base64,VEVTVA==', $copy['tables']['memoria_imagenes'][0]['image_base64']);
    }

    public function test_all_backup_endpoints_reject_other_owners(): void
    {
        $owner = User::factory()->create(); $other = User::factory()->create();
        $this->project($owner, 'Privado');
        $backup = app(ProjectBackups::class)->create($owner);
        $this->get(route('backups.index'))->assertRedirect(route('login'));
        $this->actingAs($other)->get(route('backups.download', $backup))->assertNotFound();
        $this->get(route('backups.preview', $backup))->assertNotFound();
        $this->post(route('backups.restore', $backup), [])->assertNotFound();
    }

    public function test_restore_recovers_deleted_rows_removes_later_projects_and_can_be_undone(): void
    {
        $user = User::factory()->create(); $other = User::factory()->create();
        [$cad, $memory, $image, $description] = $this->project($user, 'Original');
        [$foreign] = $this->project($other, 'Ajeno');
        $service = app(ProjectBackups::class); $backup = $service->create($user);
        $cad->update(['name' => 'Modificado', 'version' => 9]);
        $memory->delete(); $description->delete();
        [$later] = $this->project($user, 'Posterior');
        $preview = $service->preview($user, $backup);
        $this->assertSame(2, $preview['current']['cad_models']);
        $this->assertSame('Original', $preview['projects']['cad_models']['restore'][0]['name']);
        $this->assertSame('Posterior', $preview['projects']['cad_models']['remove'][0]['name']);
        $safety = $service->restore($user, $backup, $preview['revision']);
        $this->assertTrue($safety->safety);
        $this->assertSame('Original', $cad->fresh()->name);
        $this->assertGreaterThan(9, $cad->fresh()->version);
        $this->assertDatabaseHas('memoria_imagenes', ['id' => $image->id]);
        $this->assertDatabaseHas('memorias_descriptivas', ['id' => $description->id]);
        $this->assertDatabaseMissing('cad_models', ['id' => $later->id]);
        $this->assertSame('Ajeno', $foreign->fresh()->name);
        $this->assertSame($user->email, $user->fresh()->email);
        $beforeUndo = $service->preview($user, $safety);
        $service->restore($user, $safety, $beforeUndo['revision']);
        $this->assertSame('Modificado', $cad->fresh()->name);
        $this->assertDatabaseHas('cad_models', ['id' => $later->id]);
        $this->assertDatabaseMissing('memoria_calculos', ['id' => $memory->id]);
        $this->assertDatabaseCount('project_backup_events', 2);
        $this->assertDatabaseCount('users', 2);
    }

    public function test_stale_preview_and_corrupted_backup_do_not_modify_projects(): void
    {
        $user = User::factory()->create(); [$cad] = $this->project($user, 'Original');
        $service = app(ProjectBackups::class); $backup = $service->create($user);
        $revision = $service->preview($user, $backup)['revision'];
        $cad->update(['name' => 'Cambio posterior']);
        try { $service->restore($user, $backup, $revision); $this->fail('Debe rechazar una vista previa obsoleta.'); }
        catch (\Illuminate\Validation\ValidationException) { $this->assertSame('Cambio posterior', $cad->fresh()->name); }
        Storage::disk('local')->put($backup->path, 'contenido alterado');
        try { $service->restore($user, $backup, $revision); $this->fail('Debe rechazar una copia alterada.'); }
        catch (\Illuminate\Validation\ValidationException) { $this->assertSame('Cambio posterior', $cad->fresh()->name); }
        $this->assertDatabaseCount('project_backup_events', 0);
    }

    public function test_restore_requires_confirmation_and_current_password_and_download_is_audited(): void
    {
        $user = User::factory()->create(['password' => 'test-password']); $this->project($user, 'Original');
        $service = app(ProjectBackups::class); $backup = $service->create($user);
        $this->actingAs($user)->get(route('backups.index'))->assertOk()->assertSee('Mis respaldos');
        $this->get(route('backups.preview', $backup))->assertOk()->assertSee('Contraseña actual');
        $revision = $service->preview($user, $backup)['revision'];
        $this->post(route('backups.restore', $backup), ['revision' => $revision])->assertSessionHasErrors(['confirm', 'password']);
        $this->post(route('backups.restore', $backup), ['revision' => $revision, 'confirm' => '1', 'password' => 'incorrecta'])->assertSessionHasErrors('password');
        $download = $this->get(route('backups.download', $backup))->assertOk()->assertHeader('Content-Type', 'application/gzip');
        $this->assertSame($user->id, json_decode(gzdecode($download->getContent()), true)['owner']);
        $this->assertDatabaseHas('project_backup_events', ['user_id' => $user->id, 'kind' => 'download']);
        $this->post(route('backups.restore', $backup), ['revision' => $revision, 'confirm' => '1', 'password' => 'test-password'])
            ->assertSessionHasNoErrors()->assertRedirect(route('backups.index'));
        $this->assertDatabaseHas('project_backup_events', ['user_id' => $user->id, 'kind' => 'restore']);
    }

    public function test_daily_command_dry_run_writes_nothing_and_real_run_is_once_per_day(): void
    {
        $user = User::factory()->create(); $this->project($user, 'Original');
        $this->artisan('project-backups:daily', ['--dry-run' => true])->assertSuccessful();
        $this->assertDatabaseCount('project_backups', 0);
        $this->artisan('project-backups:daily')->assertSuccessful();
        $this->artisan('project-backups:daily')->assertSuccessful();
        $this->assertDatabaseCount('project_backups', 1);
    }

    public function test_retention_preserves_seven_days_four_sundays_and_safety_copies(): void
    {
        $user = User::factory()->create(); $this->project($user, 'Original');
        $service = app(ProjectBackups::class);
        for ($days = 35; $days >= 0; $days--) {
            $this->travelTo(\Illuminate\Support\Carbon::parse('2026-10-22 12:00', 'UTC')->subDays($days));
            $service->create($user);
        }
        $safety = $service->create($user, true);
        $service->prune($user);
        $kept = ProjectBackup::where('safety', false)->get();
        $this->assertGreaterThanOrEqual(7, $kept->count());
        $this->assertLessThanOrEqual(11, $kept->count());
        $this->assertSame(4, $kept->filter(fn ($backup) => $backup->created_at->isSunday())->count());
        $this->assertDatabaseHas('project_backups', ['id' => $safety->id]);
        $this->assertCount(ProjectBackup::count(), Storage::disk('local')->allFiles('project-backups/'.$user->id));
    }

    public function test_cross_owner_cad_reference_is_not_restored_as_another_users_link(): void
    {
        $user = User::factory()->create(); $other = User::factory()->create();
        [$foreign] = $this->project($other, 'Ajeno');
        [, $memory] = $this->project($user, 'Propio');
        $memory->update(['cad_model_id' => $foreign->id]);
        $service = app(ProjectBackups::class); $backup = $service->create($user);
        $this->assertNull($service->read($user, $backup)['tables']['memoria_calculos'][0]['cad_model_id']);
    }

    public function test_failed_restore_rolls_back_projects_and_preserves_the_safety_copy(): void
    {
        $user = User::factory()->create(); [$cad] = $this->project($user, 'Original');
        $service = app(ProjectBackups::class); $backup = $service->create($user);
        $cad->update(['name' => 'Estado actual']);
        $revision = $service->preview($user, $backup)['revision'];
        DB::listen(function ($query) {
            if (str_starts_with($query->sql, 'insert into "memoria_calculos"')) {
                throw new \RuntimeException('Fallo de escritura simulado.');
            }
        });
        try { $service->restore($user, $backup, $revision); $this->fail('Debe revertirse la transacción.'); }
        catch (\RuntimeException) {
            $this->assertSame('Estado actual', $cad->fresh()->name);
            $this->assertSame(1, ProjectBackup::where('safety', true)->count());
            $this->assertSame(1, CadModel::where('user_id', $user->id)->count());
            $this->assertSame(1, MemoriaCalculo::where('user_id', $user->id)->count());
        }
    }
}

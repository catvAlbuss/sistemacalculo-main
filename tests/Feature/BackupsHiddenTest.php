<?php

namespace Tests\Feature;

use App\Models\ProjectBackup;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Versión 2.0: con el interruptor apagado no queda rastro visible y ninguna copia se pierde.
class BackupsHiddenTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function nightlyBackupRuns(): bool
    {
        $event = collect(app(Schedule::class)->events())->first(fn ($item) => str_contains($item->command, 'project-backups:daily'));

        return $event->filtersPass($this->app);
    }

    public function test_the_switch_is_off_unless_it_is_enabled_in_the_environment(): void
    {
        $this->assertFalse(config('features.project_backups'));
    }

    public function test_every_backup_route_answers_not_found_while_hidden(): void
    {
        $user = User::factory()->create();
        $backup = ProjectBackup::forceCreate(['user_id' => $user->id, 'path' => 'copias/1', 'bytes' => 1, 'counts' => '{}', 'checksum' => str_repeat('a', 64)]);
        $this->actingAs($user);

        $this->get(route('backups.index'))->assertNotFound();
        $this->post(route('backups.store'))->assertNotFound();
        $this->get(route('backups.preview', $backup))->assertNotFound();
        $this->get(route('backups.download', $backup))->assertNotFound();
        $this->post(route('backups.restore', $backup))->assertNotFound();

        $this->assertDatabaseHas('project_backups', ['id' => $backup->id]);
    }

    public function test_the_nightly_copy_follows_the_switch(): void
    {
        $this->assertFalse($this->nightlyBackupRuns());

        config(['features.project_backups' => true]);

        $this->assertTrue($this->nightlyBackupRuns());
    }

    public function test_account_pages_and_legal_texts_do_not_promise_backups_while_hidden(): void
    {
        $this->actingAs(User::factory()->create());

        foreach ([route('dashboard'), route('plans.mine'), route('profile'), route('legal.terminos'), route('legal.privacidad')] as $url) {
            $this->assertStringNotContainsStringIgnoringCase('respaldos', $this->get($url)->getContent(), $url);
        }
    }

    public function test_enabling_the_switch_brings_the_published_conditions_back(): void
    {
        config(['features.project_backups' => true]);

        $this->get(route('legal.terminos'))->assertSee('Mis respaldos');
        $this->get(route('legal.privacidad'))->assertSee('Los respaldos de proyectos');
    }
}

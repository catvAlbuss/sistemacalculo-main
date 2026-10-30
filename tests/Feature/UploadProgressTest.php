<?php

namespace Tests\Feature;

use App\Mail\FormularioEnviado;
use App\Models\ShowcaseVideo;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class UploadProgressTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private const HEADER = ['X-Upload-Progress' => '1'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Role::create(['name' => 'root', 'guard_name' => 'web']);
    }

    private function administrator(): User
    {
        $user = User::factory()->create();
        $user->assignRole('root');

        return $user;
    }

    private function youtube(array $overrides = []): array
    {
        return $overrides + ['slot' => 'home', 'title' => 'Resumen', 'source_type' => 'youtube', 'youtube_url' => 'https://youtu.be/M7lc1UVf-VE'];
    }

    public function test_the_video_form_carries_the_dialog_with_the_real_upload_limit(): void
    {
        $html = $this->actingAs($this->administrator())->get(route('showcase.admin'))->assertOk()->getContent();

        $document = new \DOMDocument;
        @$document->loadHTML($html);
        $dialog = (new \DOMXPath($document))->query('//form[contains(@action,"administracion/videos")]//dialog[@data-upload-dialog]')->item(0);

        $this->assertNotNull($dialog);
        $this->assertCount(2, (new \DOMXPath($document))->query('//form[contains(@action,"administracion/videos")]//input[@type="radio"][@name="source_type"]'));
        $this->assertGreaterThan(0, (int) $dialog->getAttribute('data-max-bytes'));
        $this->assertLessThanOrEqual(config('showcase.max_upload_mb') * 1024 * 1024, (int) $dialog->getAttribute('data-max-bytes'));
    }

    public function test_a_finished_upload_answers_with_the_destination_and_keeps_the_message_for_the_next_page(): void
    {
        $this->actingAs($this->administrator())->from(route('showcase.admin'));

        $response = $this->post(route('showcase.upload'), $this->youtube(), self::HEADER);

        $response->assertOk()->assertExactJson(['redirect' => route('showcase.admin')]);
        $this->assertDatabaseCount('showcase_videos', 1);
        $this->get(route('showcase.admin'))->assertSee('Enlace guardado para revisión');
    }

    public function test_validation_errors_reach_the_form_after_the_upload(): void
    {
        $this->actingAs($this->administrator())->from(route('showcase.admin'));

        $this->post(route('showcase.upload'), $this->youtube(['title' => '']), self::HEADER)
            ->assertOk()->assertExactJson(['redirect' => route('showcase.admin')]);

        $this->get(route('showcase.admin'))->assertSee('wk-notice', false);
        $this->assertSame(0, ShowcaseVideo::count());
    }

    public function test_a_form_sent_without_javascript_keeps_the_normal_redirect(): void
    {
        $this->actingAs($this->administrator())->from(route('showcase.admin'));

        $this->post(route('showcase.upload'), $this->youtube())->assertRedirect(route('showcase.admin'));
    }

    public function test_the_quote_form_also_reports_its_destination(): void
    {
        Mail::fake();
        Storage::fake();

        $this->from('/')->post(route('cotizarplano'), ['nombre' => 'Ana', 'celular' => '999999999', 'email' => 'ana@example.com',
            'archivo' => UploadedFile::fake()->create('plano.pdf', 100, 'application/pdf')], self::HEADER)
            ->assertOk()->assertExactJson(['redirect' => url('/')]);

        Mail::assertSent(FormularioEnviado::class, function (FormularioEnviado $mail) {
            $html = $mail->render();

            return $mail->hasTo(config('mail.admin_email')) && $mail->hasReplyTo('ana@example.com')
                && $mail->hasAttachmentFromStorage($mail->datos['archivo_path'], 'plano.pdf')
                && str_contains($html, 'ana@example.com');
        });
    }
}

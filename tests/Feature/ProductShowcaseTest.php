<?php

namespace Tests\Feature;

use App\Jobs\ProcessShowcaseVideo;
use App\Models\ShowcaseVideo;
use App\Models\Subscription;
use App\Models\User;
use App\Services\VideoProcessor;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Symfony\Component\Process\Process;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class ProductShowcaseTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp(); $this->withoutVite();
        foreach (['root', 'gerencia', 'cliente'] as $role) Role::create(['name' => $role, 'guard_name' => 'web']);
        Storage::fake('local'); Storage::fake('showcase_public'); Queue::fake();
    }

    private function administrator(string $role = 'root'): User
    {
        $user = User::factory()->create(); $user->assignRole($role); return $user;
    }

    private function ready(string $slot = 'home', bool $published = false): ShowcaseVideo
    {
        $video = ShowcaseVideo::create(['slot' => $slot, 'title' => 'Presentación', 'status' => 'ready', 'is_published' => $published]);
        foreach (['desktop', 'mobile', 'poster'] as $collection) {
            $video->addMediaFromString('test-'.$collection)->usingFileName($collection.($collection === 'poster' ? '.jpg' : '.mp4'))->toMediaCollection($collection);
        }
        return $video;
    }

    public function test_the_media_queue_is_emptied_by_the_scheduler_without_a_daemon(): void
    {
        $event = collect(app(Schedule::class)->events())->first(fn ($item) => str_contains($item->command, 'queue:work'));

        $this->assertStringContainsString('--stop-when-empty', $event->command);
        $this->assertStringContainsString('--queue=media', $event->command);
        $this->assertSame('* * * * *', $event->expression);
    }

    public function test_the_published_home_video_is_served_as_a_static_file(): void
    {
        $video = $this->ready('home', true);

        $html = $this->get('/')->assertOk()->getContent();

        $this->assertStringContainsString('data-src="'.$video->getFirstMediaUrl('desktop').'"', $html);
        $this->assertStringNotContainsString(route('showcase.home-video', ['variant' => 'desktop', 'format' => 'mp4']), $html);
        $this->assertSame('/media', config('filesystems.disks.showcase_public.url'));
    }

    public function test_a_video_can_be_edited_and_moving_it_withdraws_it_from_its_place(): void
    {
        $this->actingAs($this->administrator());
        $video = $this->ready('home', true);

        $this->put(route('showcase.update', $video), ['slot' => 'home', 'title' => 'Nuevo título', 'transcript' => 'Texto'])->assertSessionHasNoErrors();
        $this->assertSame('Nuevo título', $video->fresh()->title);
        $this->assertTrue($video->fresh()->is_published);

        $this->put(route('showcase.update', $video), ['slot' => 'vigas', 'title' => 'Nuevo título'])->assertSessionHasNoErrors();
        $this->assertSame('vigas', $video->fresh()->slot);
        $this->assertFalse($video->fresh()->is_published);
    }

    public function test_deleting_a_video_removes_its_files_and_the_home_returns_to_the_default_animation(): void
    {
        $this->actingAs($this->administrator());
        $video = $this->ready('home', true);
        $path = $video->getFirstMedia('desktop')->getPathRelativeToRoot();
        Storage::disk('showcase_public')->assertExists($path);

        $this->delete(route('showcase.destroy', $video))->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('showcase_videos', ['id' => $video->id]);
        Storage::disk('showcase_public')->assertMissing($path);
        $this->get(route('showcase.home-video', ['variant' => 'desktop', 'format' => 'mp4']))->assertOk();
    }

    public function test_a_video_being_processed_cannot_be_deleted_and_a_queued_one_leaves_no_failed_job(): void
    {
        $this->actingAs($this->administrator());
        $processing = ShowcaseVideo::create(['slot' => 'home', 'title' => 'En curso', 'status' => 'processing']);
        $this->delete(route('showcase.destroy', $processing))->assertSessionHasErrors('video');
        $this->assertDatabaseHas('showcase_videos', ['id' => $processing->id]);

        $queued = ShowcaseVideo::create(['slot' => 'home', 'title' => 'En cola', 'status' => 'queued']);
        $job = new ProcessShowcaseVideo($queued->id);
        $this->delete(route('showcase.destroy', $queued))->assertSessionHasNoErrors();

        $job->handle(app(VideoProcessor::class));
        $this->assertDatabaseMissing('showcase_videos', ['id' => $queued->id]);
    }

    public function test_only_administrators_can_change_videos(): void
    {
        $video = $this->ready();
        $this->actingAs($this->administrator('cliente'));

        $this->delete(route('showcase.destroy', $video))->assertForbidden();
        $this->put(route('showcase.update', $video), ['slot' => 'home', 'title' => 'X'])->assertForbidden();
    }

    public function test_all_products_render_without_login_and_use_existing_tool_routes(): void
    {
        $this->get('/')->assertOk()->assertSee('Ingeniería.')->assertSee('Sin pago al iniciar.')->assertDontSee('wire:submit="login"', false);
        $this->get(route('login'))->assertOk()->assertSee('Iniciar sesión');
        $this->get(route('showcase.index'))->assertOk()->assertSee('data-product-search', false);
        foreach (config('showcase.products') as $slug => $product) {
            $this->assertNotEmpty(route($product['route']));
            $this->assertFileExists(resource_path(str_replace('resources/', '', $product['image'])));
            $this->get(route('showcase.show', $slug))->assertOk()->assertSee($product['name'])->assertSee('5 días');
        }
        $this->get('/programas/no-existe')->assertNotFound(); $this->assertGuest();
    }

    public function test_each_program_has_specific_inputs_outputs_and_a_resolvable_calculation_view(): void
    {
        $products = config('showcase.products');
        $details = config('program-details');
        $this->assertSame([], array_values(array_diff(array_keys($products), array_keys($details))));
        foreach ($products as $slug => $product) {
            $this->assertGreaterThanOrEqual(3, count($details[$slug]['inputs']), $slug);
            $this->assertGreaterThanOrEqual(2, count($details[$slug]['outputs']), $slug);
            $this->assertGreaterThan(100, mb_strlen($details[$slug]['purpose']), $slug);
            $route = \Illuminate\Support\Facades\Route::getRoutes()->getByName($product['route']);
            if ($view = $route->defaults['view'] ?? null) $this->assertTrue(view()->exists($view), $slug.': '.$view);
            $response = $this->get(route('showcase.show', $slug))->assertOk();
            $response->assertSee($details[$slug]['inputs'][0])->assertSee($details[$slug]['outputs'][0]);
            $this->assertStringNotContainsString('sc-demo"', $response->getContent());
        }
    }

    public function test_home_has_a_first_party_animation_and_informative_program_cards_without_a_published_video(): void
    {
        $html = $this->get('/')->assertOk()->getContent();
        $document = new \DOMDocument();
        @$document->loadHTML('<?xml encoding="UTF-8">'.$html);
        $xpath = new \DOMXPath($document);
        $this->assertCount(1, $xpath->query('//header[contains(@class,"lh-hero")]//video[@muted][@loop][@playsinline]'));
        $this->assertCount(6, $xpath->query('//article[contains(@class,"lh-program-card")]'));
        $this->assertCount(18, $xpath->query('//article[contains(@class,"lh-program-card")]//li'));
        $this->assertCount(0, $xpath->query('//header[contains(@class,"lh-hero")]//iframe'));
        foreach (['system-overview.mp4', 'system-overview-mobile.mp4', 'system-overview-poster.jpg'] as $asset) {
            $this->assertFileExists(public_path('assets/marketing/'.$asset));
        }
        $this->assertStringContainsString(route('showcase.home-video', ['variant' => 'desktop', 'format' => 'mp4']), $html);
    }

    public function test_trial_entry_is_free_and_cannot_restart_after_expiry(): void
    {
        $trial = Subscription::create(['name' => 'Prueba', 'slug' => 'prueba', 'type' => 'trial', 'price' => 0, 'duration_days' => 5, 'is_active' => true]);
        $this->get(route('showcase.trial'))->assertRedirect(route('planes.register', ['plan' => $trial->id]));
        $user = $this->administrator('cliente');
        $user->subscriptions()->create(['subscription_plan_id' => $trial->id, 'status' => 'active', 'payment_method' => 'trial', 'starts_at' => now()->subDays(6), 'ends_at' => now()->addMonth(), 'amount_paid' => 0]);
        $this->actingAs($user)->get(route('showcase.trial'))->assertRedirect(route('plans.mine'));
        $this->get(route('software.aligerados-v2'))->assertRedirect(route('plans.mine'));
        $this->get(route('predim_v2'))->assertRedirect(route('plans.mine'));
        $this->get(route('calculadora.estudiante.arco_techo'))->assertRedirect(route('plans.mine'));
    }

    public function test_home_video_stream_supports_ranges_and_published_uploads_without_exposing_originals(): void
    {
        foreach (['mp4', 'webm'] as $format) {
            $response = $this->withHeader('Range', 'bytes=0-63')->get(route('showcase.home-video', ['variant' => 'desktop', 'format' => $format]));
            $response->assertStatus(206)->assertHeader('Content-Type', 'video/'.$format);
            $this->assertStringStartsWith('bytes 0-63/', $response->headers->get('Content-Range'));
        }
        $upload = $this->ready('home', true);
        $response = $this->withHeader('Range', 'bytes=0-3')->get(route('showcase.home-video', ['variant' => 'mobile', 'format' => 'mp4']));
        $response->assertStatus(206);
        $this->assertSame($upload->getFirstMediaPath('mobile'), $response->baseResponse->getFile()->getPathname());
        $this->get('/portada/video/original.mp4')->assertNotFound();
        $this->get('/portada/video/desktop.php')->assertNotFound();
    }

    public function test_youtube_urls_are_normalized_without_uploads_processing_or_external_requests(): void
    {
        \Illuminate\Support\Facades\Http::preventStrayRequests();
        $this->actingAs($this->administrator());
        $old = $this->ready('aligerados-v2', true);
        $this->post(route('showcase.upload'), ['slot' => 'aligerados-v2', 'title' => 'Tráiler de YouTube', 'source_type' => 'youtube',
            'youtube_url' => 'https://youtu.be/M7lc1UVf-VE?si=shared', 'publish_when_ready' => 1])->assertSessionHasNoErrors();
        $video = ShowcaseVideo::latest('id')->firstOrFail();
        $this->assertSame('youtube', $video->source_type); $this->assertSame('M7lc1UVf-VE', $video->youtube_id);
        $this->assertTrue($video->isReady()); $this->assertTrue($video->is_published);
        $this->assertFalse($old->fresh()->is_published); $this->assertFileExists($old->getFirstMediaPath('desktop'));
        $this->assertCount(0, $video->media);
        Queue::assertNothingPushed(); \Illuminate\Support\Facades\Http::assertNothingSent();
        $this->get(route('showcase.show', 'aligerados-v2'))->assertOk()->assertSee('data-youtube="M7lc1UVf-VE"', false)->assertSee('https://www.youtube-nocookie.com/embed/M7lc1UVf-VE', false)->assertSee('Ver en YouTube')->assertDontSee('Reproducir en YouTube');
        $this->get(route('showcase.admin'))->assertOk()->assertSee('data-youtube="M7lc1UVf-VE"', false);
        $this->get(route('showcase.index'))->assertOk()->assertSee('Ver tráiler');
    }

    public function test_inline_product_demo_is_manual_and_home_montage_is_muted_and_looped(): void
    {
        ShowcaseVideo::create(['slot' => 'vigas', 'title' => 'Demostración', 'source_type' => 'youtube', 'youtube_id' => 'M7lc1UVf-VE', 'status' => 'ready', 'is_published' => true]);
        $this->get(route('showcase.show', 'vigas'))->assertOk()->assertSee('Mira cómo funciona, directamente en esta página.')
            ->assertSee('data-youtube-frame', false)->assertSee('loading="lazy"', false)
            ->assertSee('Ver en YouTube')->assertDontSee('autoplay=1')->assertDontSee('data-youtube-hero', false);
        ShowcaseVideo::create(['slot' => 'home', 'title' => 'Resumen del sistema', 'source_type' => 'youtube', 'youtube_id' => 'M7lc1UVf-VE', 'status' => 'ready', 'is_published' => true]);
        $this->get('/')->assertOk()->assertSee('data-youtube-hero', false)->assertSee('mute=1', false)->assertSee('loop=1', false)->assertSee('playlist=M7lc1UVf-VE', false);
    }

    public function test_youtube_requires_a_valid_video_url_and_preserves_the_current_publication_on_error(): void
    {
        $this->actingAs($this->administrator()); $old = $this->ready('home', true);
        foreach (['https://evil.test/watch?v=M7lc1UVf-VE', 'https://youtube.com.evil.test/watch?v=M7lc1UVf-VE',
            'https://youtube.com@evil.test/M7lc1UVf-VE', 'javascript:alert(1)', 'https://youtube.com/playlist?list=abc',
            'https://youtube.com/watch?v[]=M7lc1UVf-VE', 'https://youtube.com/watch?v=short'] as $url) {
            $this->post(route('showcase.upload'), ['slot' => 'home', 'title' => 'Nuevo', 'source_type' => 'youtube', 'youtube_url' => $url])->assertSessionHasErrors('youtube_url');
        }
        $this->assertDatabaseCount('showcase_videos', 1); $this->assertTrue($old->fresh()->is_published);
        foreach (['https://www.youtube.com/watch?v=M7lc1UVf-VE&t=10', 'https://youtube.com/shorts/M7lc1UVf-VE',
            'https://m.youtube.com/live/M7lc1UVf-VE', 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE'] as $url) {
            $this->assertSame('M7lc1UVf-VE', \App\Services\YouTubeVideo::id($url));
        }
    }

    public function test_only_administrators_can_manage_uploads_and_processing_is_queued(): void
    {
        $this->get(route('showcase.admin'))->assertRedirect(route('login'));
        $this->actingAs($this->administrator('cliente'))->get(route('showcase.admin'))->assertForbidden();
        $this->post(route('showcase.upload'), [])->assertForbidden();
        $this->actingAs($this->administrator('gerencia'))->get(route('showcase.admin'))->assertOk();
        $this->post(route('showcase.upload'), ['slot' => 'aligerados-v2', 'title' => 'Diseño de aligerados', 'publish_when_ready' => 1,
            'video' => UploadedFile::fake()->create('trailer.mp4', 100, 'video/mp4')])->assertSessionHasNoErrors();
        $video = ShowcaseVideo::firstOrFail();
        $this->assertSame('queued', $video->status); $this->assertFalse($video->is_published);
        $this->assertTrue($video->publish_when_ready); $this->assertFileExists($video->getFirstMediaPath('original'));
        $this->assertSame('local', $video->getFirstMedia('original')->disk);
        Queue::assertPushed(ProcessShowcaseVideo::class, fn ($job) => $job->videoId === $video->id && $job->queue === 'media');
        $this->get(route('showcase.show', 'aligerados-v2'))->assertDontSee('data-src=', false);
        $this->post(route('showcase.upload'), ['slot' => 'unknown', 'title' => 'Video', 'video' => UploadedFile::fake()->create('bad.php', 1)])->assertSessionHasErrors(['slot', 'video']);
    }

    public function test_publishing_requires_all_derivatives_and_replaces_without_deleting_previous_video(): void
    {
        $this->actingAs($this->administrator());
        $old = $this->ready('home', true); $next = $this->ready();
        $this->post(route('showcase.publish', $next))->assertSessionHasNoErrors();
        $this->assertFalse($old->fresh()->is_published); $this->assertTrue($next->fresh()->is_published);
        $this->assertFileExists($old->getFirstMediaPath('desktop'));
        $pending = ShowcaseVideo::create(['slot' => 'home', 'title' => 'Pendiente']);
        $this->post(route('showcase.publish', $pending))->assertUnprocessable();
        $this->assertTrue($next->fresh()->is_published);
        $html = $this->get('/')->assertOk()->getContent();
        $this->assertStringContainsString($next->getFirstMediaUrl('desktop'), $html);
        $this->assertStringNotContainsString($old->getFirstMediaUrl('desktop'), $html);
        $this->post(route('showcase.unpublish', $next))->assertSessionHasNoErrors();
        $this->get('/')->assertOk()->assertSee(route('showcase.home-video', ['variant' => 'desktop', 'format' => 'mp4']), false)->assertDontSee($next->getFirstMediaUrl('desktop'));
    }

    public function test_failed_processing_preserves_original_and_current_published_video(): void
    {
        $old = $this->ready('home', true);
        $video = ShowcaseVideo::create(['slot' => 'home', 'title' => 'Nuevo']);
        $video->addMediaFromString('not-a-video')->usingFileName('original.mp4')->toMediaCollection('original');
        $processor = $this->mock(VideoProcessor::class);
        $processor->shouldReceive('encode')->once()->andThrow(new \RuntimeException('Invalid video'));
        try { (new ProcessShowcaseVideo($video->id))->handle($processor); $this->fail('Expected failure'); }
        catch (\RuntimeException $exception) { $this->assertSame('Invalid video', $exception->getMessage()); }
        $this->assertSame('failed', $video->fresh()->status);
        $this->assertTrue($old->fresh()->is_published);
        $this->assertFileExists($video->getFirstMediaPath('original'));
        $this->actingAs($this->administrator())->post(route('showcase.retry', $video))->assertSessionHasNoErrors();
        Queue::assertPushed(ProcessShowcaseVideo::class);
    }

    public function test_an_older_job_cannot_overwrite_a_newer_publication_but_manual_rollback_is_possible(): void
    {
        $older = $this->ready(); $newer = $this->ready('home', true);
        (new ProcessShowcaseVideo($older->id))->handle(app(VideoProcessor::class));
        $this->assertTrue($newer->fresh()->is_published);
        $this->assertFalse($older->fresh()->is_published);
        $older->publish();
        $this->assertTrue($older->fresh()->is_published);
        $this->assertFalse($newer->fresh()->is_published);
    }

    public function test_real_video_processing_keeps_original_and_produces_playable_versions_and_poster(): void
    {
        if (!is_file(config('showcase.ffmpeg')) || !is_file(config('showcase.ffprobe'))) $this->markTestSkipped('FFmpeg binaries are not configured.');
        $directory = storage_path('framework/testing/showcase-'.\Illuminate\Support\Str::uuid());
        mkdir($directory, 0777, true);
        try {
            $source = $directory.'/fixture.mp4';
            (new Process([config('showcase.ffmpeg'), '-nostdin', '-y', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=24', '-t', '1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', $source], timeout: 30))->mustRun();
            $hash = hash_file('sha256', $source);
            $video = ShowcaseVideo::create(['slot' => 'home', 'title' => 'Test real', 'publish_when_ready' => true]);
            $video->addMedia($source)->toMediaCollection('original');
            (new ProcessShowcaseVideo($video->id))->handle(app(VideoProcessor::class));
            $video->refresh();
            $this->assertTrue($video->isReady()); $this->assertTrue($video->is_published);
            $this->assertSame($hash, hash_file('sha256', $video->getFirstMediaPath('original')));
            foreach (['desktop', 'mobile'] as $collection) {
                $metadata = app(VideoProcessor::class)->inspect($video->getFirstMediaPath($collection));
                $this->assertSame(320, $metadata['width']); $this->assertSame(180, $metadata['height']);
                $this->assertEqualsWithDelta(1, $metadata['duration'], 0.1);
            }
            $this->assertSame(IMAGETYPE_JPEG, exif_imagetype($video->getFirstMediaPath('poster')));
        } finally {
            $root = realpath(storage_path('framework/testing'));
            if (is_dir($directory) && str_starts_with(realpath($directory), $root.DIRECTORY_SEPARATOR)) \Illuminate\Support\Facades\File::deleteDirectory($directory);
        }
    }
}

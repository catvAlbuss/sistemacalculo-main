<?php

namespace Tests\Feature;

use App\Services\MailConfiguration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\TransportException;
use Tests\TestCase;

class HostingerMailTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
        config(['mail.default' => 'hostinger', 'mail.from.address' => 'ventas@example.com',
            'mail.from.name' => 'Ventas', 'mail.admin_email' => 'admin@example.com',
            'mail.mailers.hostinger' => ['transport' => 'hostinger', 'token' => 'private-token',
                'mailbox_id' => 'AC123', 'address' => 'ventas@example.com', 'timeout' => 20]]);
    }

    public function test_laravel_messages_use_the_hostinger_api_with_attachments_and_hidden_recipients(): void
    {
        Http::fake(['api.mail.hostinger.com/*' => Http::response('', 204)]);
        Mail::html('<p>Ticket confirmado</p>', function ($mail) {
            $mail->to('cliente@example.com')->bcc('audit@example.com')->subject('Ticket')
                ->replyTo('soporte@example.com')->attachData('ticket-data', 'ticket.txt', ['mime' => 'text/plain']);
        });
        Http::assertSentCount(1);
        Http::assertSent(fn ($request) => $request->url() === 'https://api.mail.hostinger.com/api/v1/mailboxes/AC123/send'
            && $request->hasHeader('Authorization', 'Bearer private-token')
            && $request['to'] === ['cliente@example.com'] && $request['bcc'] === ['audit@example.com']
            && $request['subject'] === 'Ticket' && str_contains($request['html'], 'Ticket confirmado')
            && str_contains($request['html'], 'mailto:soporte@example.com')
            && $request['attachments'][0]['content'] === base64_encode('ticket-data'));
    }

    public function test_hostinger_errors_do_not_expose_tokens_or_provider_response_bodies(): void
    {
        Http::fake(['*' => Http::response(['error' => 'private-token provider-secret'], 401)]);
        try {
            Mail::raw('Mensaje', fn ($mail) => $mail->to('cliente@example.com')->subject('Prueba'));
            $this->fail('A rejected message was accepted.');
        } catch (TransportException $exception) {
            $this->assertStringContainsString('HTTP 401', $exception->getMessage());
            $this->assertStringNotContainsString('private-token', (string) $exception);
            $this->assertStringNotContainsString('provider-secret', (string) $exception);
        }
    }

    public function test_hostinger_requires_credentials_and_a_matching_sender_before_sending(): void
    {
        config(['mail.mailers.hostinger.token' => null, 'mail.from.address' => 'otro@example.com']);
        $this->assertNotEmpty(app(MailConfiguration::class)->errors());
        $this->artisan('correo:verificar')->assertFailed();
        Http::assertNothingSent();
    }

    public function test_readiness_checks_the_selected_provider_instead_of_requiring_smtp(): void
    {
        config(['mail.mailers.smtp.password' => null]);
        $this->assertSame([], app(MailConfiguration::class)->errors());
        $this->artisan('correo:verificar')->assertSuccessful();
        config(['mail.default' => 'log']);
        $this->assertNotEmpty(app(MailConfiguration::class)->errors());
    }

    public function test_network_errors_are_sanitized_and_never_retried_inside_the_transport(): void
    {
        Http::fake(['*' => Http::failedConnection('private-token')]);
        try {
            Mail::raw('Mensaje', fn ($mail) => $mail->to('cliente@example.com')->subject('Prueba'));
            $this->fail('A network failure was accepted.');
        } catch (TransportException $exception) {
            $this->assertStringNotContainsString('private-token', (string) $exception);
        }
        Http::assertSentCount(1);
    }

    public function test_online_verification_checks_both_mailbox_id_and_address_without_sending(): void
    {
        Http::fake(['*/me' => Http::sequence()->push(['data' => ['mailboxes' => [
            ['resourceId' => 'AC123', 'address' => 'ventas@example.com'],
        ]]])->push(['data' => ['mailboxes' => [
            ['resourceId' => 'AC123', 'address' => 'otro@example.com'],
        ]]])]);
        $this->artisan('correo:verificar --online')->assertSuccessful();
        Http::assertSent(fn ($request) => $request->method() === 'GET' && $request->url() === 'https://api.mail.hostinger.com/api/v1/me');
        $this->artisan('correo:verificar --online')->assertFailed();
        Http::assertNotSent(fn ($request) => $request->method() === 'POST');
    }

    public function test_password_reset_notifications_render_and_send_through_hostinger(): void
    {
        Http::fake(['*' => Http::response('', 204)]);
        $user = \App\Models\User::factory()->make(['email' => 'cliente@example.com']);
        $user->sendPasswordResetNotification('test-reset-link');
        Http::assertSent(fn ($request) => $request['to'] === ['cliente@example.com']
            && str_contains($request['html'], '/reset-password/test-reset-link')
            && str_contains($request['html'], 'Restablecer contraseña'));
    }

    public function test_plain_text_with_a_reply_address_keeps_the_complete_body(): void
    {
        Http::fake(['*' => Http::response('', 204)]);
        Mail::raw('Contenido completo', fn ($mail) => $mail->to('cliente@example.com')->replyTo('soporte@example.com')->subject('Prueba'));
        Http::assertSent(fn ($request) => !isset($request['html'])
            && str_contains($request['text'], 'Contenido completo') && str_contains($request['text'], 'soporte@example.com'));
    }
}

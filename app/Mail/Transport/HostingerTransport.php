<?php

namespace App\Mail\Transport;

use App\Services\MailConfiguration;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

class HostingerTransport extends AbstractTransport
{
    public function __construct(private array $settings)
    {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = $message->getOriginalMessage();
        $from = $email instanceof Email ? $email->getFrom() : [];
        if (app(MailConfiguration::class)->errors('hostinger') !== [] || count($from) !== 1
            || strcasecmp($from[0]->getAddress(), (string) ($this->settings['address'] ?? '')) !== 0) {
            throw new TransportException('Revisa la configuración del buzón y remitente Hostinger.');
        }
        $addresses = fn (array $items) => array_map(fn (Address $address) => $address->getAddress(), $items);
        $payload = [
            'to' => $addresses($email->getTo()), 'cc' => $addresses($email->getCc()), 'bcc' => $addresses($email->getBcc()),
            'displayName' => $from[0]->getName(), 'subject' => $email->getSubject(),
            'html' => $email->getHtmlBody(), 'text' => $email->getTextBody(),
        ];
        // Honor envelope-only recipients without exposing blind copies in the body.
        $recipients = $addresses($message->getEnvelope()->getRecipients());
        $extra = array_diff($recipients, $payload['to'], $payload['cc'], $payload['bcc']);
        $payload['bcc'] = array_values(array_unique(array_merge($payload['bcc'], $extra)));
        // The API has no Reply-To field. Keep an explicit reply link in both bodies.
        foreach ($email->getReplyTo() as $reply) {
            $address = htmlspecialchars($reply->getAddress(), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            if ($payload['html'] !== null) {
                $payload['html'] .= '<p>Responder a: <a href="mailto:'.$address.'">'.$address.'</a></p>';
            }
            if ($payload['text'] !== null || $payload['html'] === null) {
                $payload['text'] = ($payload['text'] ?? '')."\nResponder a: ".$reply->getAddress();
            }
        }
        foreach ($email->getAttachments() as $attachment) {
            $body = $attachment->getBody();
            if (is_resource($body)) { $body = stream_get_contents($body); }
            $item = ['filename' => $attachment->getFilename() ?? 'adjunto', 'content' => base64_encode($body),
                'contentType' => $attachment->getMediaType().'/'.$attachment->getMediaSubtype(), 'encoding' => 'base64'];
            if ($attachment->getDisposition() === 'inline') { $item['cid'] = $attachment->getContentId(); }
            $payload['attachments'][] = $item;
        }
        $payload = array_filter($payload, fn ($value) => $value !== null && $value !== []);
        try {
            // Retries belong to the durable task queue, never hidden HTTP retries.
            $response = Http::withToken($this->settings['token'])->acceptJson()->connectTimeout(10)
                ->timeout(max(1, min(30, (int) ($this->settings['timeout'] ?? 20))))
                ->post('https://api.mail.hostinger.com/api/v1/mailboxes/'.rawurlencode($this->settings['mailbox_id']).'/send', $payload);
        } catch (\Throwable) {
            throw new HostingerMailException('No se obtuvo respuesta de Hostinger Mail. Verifica el envío antes de reintentarlo.', 'delivery_uncertain');
        }
        if ($response->status() !== 204) {
            $uncertain = $response->status() >= 500;
            throw new HostingerMailException('Hostinger Mail no confirmó el envío (HTTP '.$response->status().').',
                $uncertain ? 'delivery_uncertain' : 'provider_rejected', $response->status() === 429);
        }
    }

    public function __toString(): string
    {
        return 'hostinger://api.mail.hostinger.com';
    }
}

<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendProfileOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $firstName;
    public string $otp;
    public string $type;

    public function __construct(string $firstName, string $otp, string $type)
    {
        $this->firstName = $firstName;
        $this->otp = $otp;
        $this->type = $type;
    }

    public function envelope(): Envelope
    {
        $subjects = [
            'email_change' => 'İmtahanVer — Email dəyişdirilməsi üçün OTP kodu',
            'password_change' => 'İmtahanVer — Şifrə dəyişdirilməsi üçün OTP kodu',
        ];

        return new Envelope(
            subject: $subjects[$this->type] ?? 'İmtahanVer — Təsdiqləmə Kodu',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.profile_otp',
        );
    }
}

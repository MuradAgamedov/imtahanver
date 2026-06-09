<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test {email}', function ($email) {
    $this->info("Sending test email to {$email}...");
    try {
        $fromAddress = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'noreply@avicom.az');
        $fromName = config('mail.from.name') ?: env('MAIL_FROM_NAME', 'Imtahanver');
        
        \Illuminate\Support\Facades\Mail::raw('Bu bir test mailidir. İmtahanVer SMTP ayarlarının düzgün işlədiyini yoxlamaq üçün göndərilmişdir.', function ($message) use ($email, $fromAddress, $fromName) {
            $message->to($email)
                ->from($fromAddress, $fromName)
                ->subject('İmtahanVer SMTP Test Maili');
        });
        $this->info("Test email sent successfully!");
    } catch (\Exception $e) {
        $this->error("Failed to send email: " . $e->getMessage());
    }
})->purpose('Send a test email to verify SMTP configuration');

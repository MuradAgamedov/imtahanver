<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test {email}', function ($email) {
    $this->info("Sending test email to {$email}...");
    try {
        \Illuminate\Support\Facades\Mail::raw('Bu bir test mailidir. İmtahanVer SMTP ayarlarının düzgün işlədiyini yoxlamaq üçün göndərilmişdir.', function ($message) use ($email) {
            $message->to($email)
                ->subject('İmtahanVer SMTP Test Maili');
        });
        $this->info("Test email sent successfully!");
    } catch (\Exception $e) {
        $this->error("Failed to send email: " . $e->getMessage());
    }
})->purpose('Send a test email to verify SMTP configuration');

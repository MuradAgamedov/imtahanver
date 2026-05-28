<?php

namespace App\Jobs;

use App\Mail\SendOtpMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOtpEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $email;
    protected string $firstName;
    protected string $otp;

    public function __construct(string $email, string $firstName, string $otp)
    {
        $this->email = $email;
        $this->firstName = $firstName;
        $this->otp = $otp;
    }

    public function handle(): void
    {
        Mail::to($this->email)->send(new SendOtpMail($this->firstName, $this->otp));
    }
}

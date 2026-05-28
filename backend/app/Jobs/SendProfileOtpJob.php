<?php

namespace App\Jobs;

use App\Mail\SendProfileOtpMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendProfileOtpJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;
    public $backoff = 5;

    protected string $email;
    protected string $firstName;
    protected string $otp;
    protected string $type;

    public function __construct(string $email, string $firstName, string $otp, string $type)
    {
        $this->email = $email;
        $this->firstName = $firstName;
        $this->otp = $otp;
        $this->type = $type;
    }

    public function handle(): void
    {
        Mail::to($this->email)->send(new SendProfileOtpMail($this->firstName, $this->otp, $this->type));
    }
}

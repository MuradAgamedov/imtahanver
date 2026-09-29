<?php
/**
 * Google reCAPTCHA v2 (checkbox) for public-facing forms. Reads keys from
 * env vars (docker-compose); if RECAPTCHA_SITE_KEY is unset, verification
 * is skipped entirely so forms keep working before keys are configured.
 */
function recaptcha_site_key(): string {
    return getenv('RECAPTCHA_SITE_KEY') ?: '';
}

function recaptcha_verify(string $token): bool {
    $secret = getenv('RECAPTCHA_SECRET_KEY') ?: '';
    if ($secret === '' || $token === '') {
        return false;
    }

    $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    if ($response === false) {
        return false;
    }

    $data = json_decode($response, true);
    return !empty($data['success']);
}

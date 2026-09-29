<?php
/**
 * Contact email/phone/WhatsApp are admin-managed (Əlaqə → Əlaqə Məlumatları
 * screen). Read straight from MySQL. Used by the Əlaqə page and the shared
 * header/footer (floating chat button).
 */
function site_contact_fetch(): array {
    $fallback = ['email' => 'agamedov94@mail.ru', 'phone' => null, 'whatsapp' => null];

    try {
        $pdo = imtahanver_db();
        $row = $pdo->query('SELECT email, phone, whatsapp FROM site_contact ORDER BY id ASC LIMIT 1')->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return $fallback;
    }

    return $row ?: $fallback;
}

/**
 * Build a wa.me link from an admin-entered WhatsApp number, stripping
 * everything but digits (wa.me expects the country code with no "+" or
 * leading zeros/spaces).
 */
function whatsapp_link(string $number): string {
    $digits = preg_replace('/\D+/', '', $number);
    return 'https://wa.me/' . $digits;
}

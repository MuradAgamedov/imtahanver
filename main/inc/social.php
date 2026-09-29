<?php
/**
 * Footer "Sosial şəbəkələr" section is admin-managed (Əlaqə → Sosial Şəbəkələr
 * screen). Read straight from MySQL — no HTTP hop through the API.
 * Falls back to an empty list if the database is unreachable (the section
 * simply doesn't render rather than showing stale/fake links).
 */
function home_social_links_fetch(): array {
    try {
        $pdo = imtahanver_db();
        $rows = $pdo->query('SELECT platform, url FROM social_links ORDER BY `order` ASC')->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return [];
    }

    return $rows ?: [];
}

function social_platform_label(string $platform): string {
    $labels = [
        'facebook' => 'Facebook',
        'instagram' => 'Instagram',
        'youtube' => 'YouTube',
        'tiktok' => 'TikTok',
        'telegram' => 'Telegram',
        'whatsapp' => 'WhatsApp',
        'linkedin' => 'LinkedIn',
        'x' => 'X (Twitter)',
    ];
    return $labels[$platform] ?? ucfirst($platform);
}

function social_platform_icon_svg(string $platform): string {
    $icons = [
        'facebook' => '<path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1z"/>',
        'instagram' => '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
        'youtube' => '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10.5 9.5v5l4.5-2.5-4.5-2.5z" fill="currentColor" stroke="none"/>',
        'tiktok' => '<path d="M14 4v10.2a2.8 2.8 0 1 1-2-2.68V9.4a5 5 0 1 0 4 4.9V9.6a6.4 6.4 0 0 0 3 .8V8.3a3.9 3.9 0 0 1-3-1.4A4 4 0 0 1 15 4h-1z"/>',
        'telegram' => '<path d="M21 4L3 11.5l6 2m12-9.5l-4 16-8-6.5m12-9.5L9 13.5"/>',
        'whatsapp' => '<path d="M7 17l-3 1 1-3a8 8 0 1 1 2 2z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/>',
        'linkedin' => '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7.5" y1="9.5" x2="7.5" y2="17"/><circle cx="7.5" cy="6.7" r="1" fill="currentColor" stroke="none"/><path d="M11.5 17v-4.5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5V17"/>',
        'x' => '<path d="M4 4l16 16M20 4L4 20"/>',
    ];
    return $icons[$platform] ?? '<circle cx="12" cy="12" r="9"/>';
}

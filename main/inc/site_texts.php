<?php
/**
 * Freeform marketing copy (hero, trust row, steps, CTA, footer, contact
 * header, etc.) is admin-managed (Sayt Mətnləri screen) as a flat key/value
 * store. Read straight from MySQL — no HTTP hop through the API.
 */
function site_texts_fetch(): array {
    try {
        $pdo = imtahanver_db();
        $rows = $pdo->query('SELECT `key`, value FROM site_texts')->fetchAll(PDO::FETCH_KEY_PAIR);
    } catch (Throwable $e) {
        return [];
    }

    return $rows ?: [];
}

/**
 * Look up a site text by key, falling back to the given default if the
 * key is missing (row not yet created, or DB unreachable).
 */
function st(array $texts, string $key, string $fallback = ''): string {
    return ($texts[$key] ?? '') !== '' ? $texts[$key] : $fallback;
}

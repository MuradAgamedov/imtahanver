<?php
/**
 * Legal pages (Məxfilik siyasəti, İstifadə şərtləri, Ödəniş və Geri Qaytarma)
 * are admin-managed (Hüquqi Səhifələr screen). Read straight from MySQL.
 * Falls back to the given default if the database is unreachable or the
 * row doesn't exist yet.
 */
function legal_page_fetch(string $slug, array $fallback): array {
    try {
        $pdo = imtahanver_db();
        $stmt = $pdo->prepare('SELECT heading, body FROM legal_pages WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return $fallback;
    }

    return $row ?: $fallback;
}

/**
 * Very small formatter for admin-authored legal text: a line starting with
 * "## " becomes a subsection heading, blank lines separate paragraphs.
 */
function legal_body_render(string $body): string {
    $blocks = preg_split('/\n\s*\n/', trim($body), -1, PREG_SPLIT_NO_EMPTY);
    $html = '';

    foreach ($blocks as $block) {
        $block = trim($block);
        if (str_starts_with($block, '## ')) {
            $html .= '<h3>' . htmlspecialchars(trim(substr($block, 3)), ENT_QUOTES, 'UTF-8') . '</h3>';
        } else {
            $html .= '<p>' . nl2br(htmlspecialchars($block, ENT_QUOTES, 'UTF-8')) . '</p>';
        }
    }

    return $html;
}

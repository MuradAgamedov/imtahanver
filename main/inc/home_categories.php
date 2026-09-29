<?php
/**
 * Homepage category cards (MİQ / Abituriyent / Magistr / Buraxılış) are
 * admin-managed (Ana Səhifə → Kateqoriyalar screen). Read straight from
 * MySQL. Falls back to the original static cards if unreachable.
 */
function home_categories_fetch(): array {
    $fallback = [
        ['title' => 'MİQ İmtahanı — sınaq testlərinə başla', 'badge' => 'Aktivdir', 'color' => 'red', 'icon' => 'rocket', 'href' => 'https://panel.imtahanver.online/register', 'active' => 1],
        ['title' => 'Abituriyent İmtahanı — DİM formatında hazırlıq', 'badge' => 'Aktivdir', 'color' => 'blue', 'icon' => 'cap', 'href' => 'https://panel.imtahanver.online/register', 'active' => 1],
        ['title' => 'Magistr İmtahanı — qəbul sınaqlarına hazırlıq', 'badge' => 'Tezliklə', 'color' => 'navy', 'icon' => 'building', 'href' => null, 'active' => 0],
        ['title' => 'Buraxılış İmtahanı — IX/XI sinif sınaqları', 'badge' => 'Tezliklə', 'color' => 'teal', 'icon' => 'flag', 'href' => null, 'active' => 0],
    ];

    try {
        $pdo = imtahanver_db();
        $rows = $pdo->query('SELECT title, badge, color, icon, href, active FROM home_categories ORDER BY `order` ASC')->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return $fallback;
    }

    return $rows ?: $fallback;
}

function home_category_icon_svg(string $key): string {
    $icons = [
        'rocket' => '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>',
        'cap' => '<circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M19 8v6M22 11h-6"/>',
        'building' => '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/>',
        'flag' => '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
    ];
    return $icons[$key] ?? $icons['rocket'];
}

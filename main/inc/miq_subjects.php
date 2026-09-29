<?php
/**
 * MİQ subject tags shown on the homepage read from the same miq_subjects
 * table the admin panel and exam engine already use — single source of
 * truth, no separate homepage copy to keep in sync.
 */
function miq_subjects_fetch(): array {
    $fallback = [
        'Tarix', 'Riyaziyyat', 'Fizika', 'Kimya', 'İbtidai sinif', 'Fransız dili',
        'Alman dili', 'Fiziki tərbiyə', 'Musiqi', 'Təsviri incəsənət', 'Texnologiya',
        'Coğrafiya', 'Biologiya', 'Rus dili (xarici dil)', 'İnformatika', 'Rus dili və ədəbiyyatı',
    ];

    try {
        $pdo = imtahanver_db();
        $rows = $pdo->query('SELECT title FROM miq_subjects ORDER BY `order` ASC')->fetchAll(PDO::FETCH_COLUMN);
    } catch (Throwable $e) {
        return $fallback;
    }

    return $rows ?: $fallback;
}

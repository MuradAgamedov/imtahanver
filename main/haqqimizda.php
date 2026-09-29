<?php
require __DIR__ . '/inc/db.php';

/**
 * "Haqqımızda" content is admin-managed (Ana Səhifə → Haqqımızda screen).
 * Read straight from MySQL — no HTTP hop through the API.
 * Falls back to sensible static content if the database is unreachable.
 */
function home_about_fetch(): array {
    $fallback = [
        'heading' => 'Haqqımızda',
        'intro' => 'İmtahanVer — Azərbaycanda müəllimlərin işə qəbulu (MİQ) və ali məktəblərə qəbul imtahanlarına hazırlığı sadə, şəffaf və əlçatan edən rəqəmsal sınaq platformasıdır.',
        'body' => "Müəllim adayları və abituriyentlər üçün keyfiyyətli, rəsmi imtahan formatına uyğun sınaq materialı tapmaq həmişə asan olmayıb — bir çox mənbə səpələnmiş, köhnəlmiş və ya real imtahan strukturunu əks etdirmir. İmtahanVer məhz bu boşluğu doldurmaq üçün yaradılıb.\n\nPlatformada MİQ imtahanının həm fənn proqramları, həm də tədris metodikası bölmələri üzrə suallar toplanıb, hər sual rəsmi imtahan strukturuna uyğun hazırlanır. Abituriyent hazırlığı üçün isə DİM standartlarına uyğun ixtisas qrupları üzrə sınaq vərəqləri təqdim olunur. İstifadəçilər sınağa başladıqdan sonra real vaxt taymeri ilə imtahan gedişini izləyir, bitdikdə isə nəticəni, doğru/yanlış cavabları və sərf olunan vaxtı dərhal görürlər.\n\nƏsas sınaq təcrübəmiz — qeydiyyatdan keçib istənilən vaxt başlaya biləcəyiniz təcrübə imtahanları — tamamilə pulsuzdur. Bundan əlavə, konkret tarixdə keçirilən, real imtahan şəraitini daha yaxından əks etdirən planlaşdırılmış rəsmi imtahanlara da qeydiyyat və ödəniş vasitəsilə qoşula bilərsiniz; belə imtahanların qiyməti və vaxtı qeydiyyat zamanı açıq şəkildə göstərilir.\n\nSual bazamız davamlı olaraq genişlənir — yeni fənlər, yeni imtahan vərəqləri və əlavə imtahan növləri (magistratura, buraxılış imtahanları) tezliklə platformaya qoşulacaq. Məqsədimiz hər bir namizədin hazırlıq prosesini ölçülə bilən, izlənilə bilən və nəticəyönümlü etməkdir.",
        'mission_heading' => 'Missiyamız',
        'mission_text' => 'Hər bir müəllim adayına və abituriyentə keyfiyyətli, şəffaf və əlçatan imtahan hazırlığı təcrübəsi təqdim etmək — sınaqdan keçən hər addımı ölçülə bilən nəticəyə çevirərək.',
    ];

    try {
        $pdo = imtahanver_db();
        $row = $pdo->query('SELECT heading, intro, body, mission_heading, mission_text FROM home_about ORDER BY id ASC LIMIT 1')->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return $fallback;
    }

    return $row ?: $fallback;
}

require __DIR__ . '/inc/site_texts.php';

$about = home_about_fetch();
$t = site_texts_fetch();

$pageTitle = ($about['heading'] ?? 'Haqqımızda') . ' — İmtahanVer';
$pageDescription = $about['intro'] ?? 'İmtahanVer rəqəmsal imtahan hazırlıq platforması haqqında məlumat.';
require __DIR__ . '/inc/head.php';
?>
<body>

<?php require __DIR__ . '/inc/header.php'; ?>

<main>

  <section class="page-hero">
    <div class="wrap page-hero-inner">
      <span class="page-hero-eyebrow">Haqqımızda</span>
      <h1><?php echo htmlspecialchars($about['heading'] ?? 'Haqqımızda', ENT_QUOTES, 'UTF-8'); ?></h1>
      <p><?php echo htmlspecialchars($about['intro'] ?? '', ENT_QUOTES, 'UTF-8'); ?></p>
    </div>
  </section>

  <section>
    <div class="wrap about-layout">
      <div class="about-prose">
        <?php foreach (preg_split('/\n\s*\n/', trim($about['body'] ?? ''), -1, PREG_SPLIT_NO_EMPTY) as $paragraph): ?>
        <p><?php echo nl2br(htmlspecialchars(trim($paragraph), ENT_QUOTES, 'UTF-8')); ?></p>
        <?php endforeach; ?>
      </div>

      <?php if (!empty($about['mission_heading']) || !empty($about['mission_text'])): ?>
      <aside class="about-mission">
        <h3><?php echo htmlspecialchars($about['mission_heading'] ?? '', ENT_QUOTES, 'UTF-8'); ?></h3>
        <p><?php echo nl2br(htmlspecialchars($about['mission_text'] ?? '', ENT_QUOTES, 'UTF-8')); ?></p>
      </aside>
      <?php endif; ?>
    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-banner">
    <div class="wrap">
      <h2><?php echo htmlspecialchars(st($t, 'cta.heading', 'Növbəti sınağınız sizi gözləyir'), ENT_QUOTES, 'UTF-8'); ?></h2>
      <div class="cta-banner-actions">
        <a class="btn btn-amber" href="https://panel.imtahanver.online/register" target="_blank" rel="noopener noreferrer"><?php echo htmlspecialchars(st($t, 'cta.primary_text', 'Pulsuz qeydiyyatdan keç'), ENT_QUOTES, 'UTF-8'); ?></a>
        <a class="btn btn-outline-chalk" href="https://panel.imtahanver.online/login" target="_blank" rel="noopener noreferrer"><?php echo htmlspecialchars(st($t, 'cta.secondary_text', 'Daxil ol'), ENT_QUOTES, 'UTF-8'); ?></a>
      </div>
    </div>
  </section>

</main>

<?php require __DIR__ . '/inc/footer.php'; ?>

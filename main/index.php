<?php
require __DIR__ . '/inc/db.php';

/**
 * Homepage "features" section is admin-managed (via the admin panel's
 * Ana Səhifə screen, which writes to the home_features table).
 * Read straight from MySQL — no HTTP hop through the API.
 * Falls back to the original static content if the database is unreachable.
 */
function home_features_fetch(): array {
    $fallback = [
        ['icon' => 'clock', 'title' => 'Real vaxt izləmə', 'description' => 'İmtahan müddətini izləyən taymer vaxt bitdikdə sınağı avtomatik tamamlayır.'],
        ['icon' => 'bolt', 'title' => 'Anlıq nəticə', 'description' => 'Sınaq bitən kimi neçə düz, neçə səhv cavab verdiyinizi və sərf etdiyiniz vaxtı dərhal görürsünüz.'],
        ['icon' => 'chart', 'title' => 'İmtahan tarixçəsi', 'description' => 'Keçmiş sınaqların nəticələri şəxsi kabinetinizdə saxlanılır.'],
        ['icon' => 'document', 'title' => 'Mövzu/fənn seçimi', 'description' => 'İstənilən fənn üzrə sınaq seçmək mümkündür.'],
        ['icon' => 'shield', 'title' => 'Rəsmi formata uyğunluq', 'description' => 'Suallar rəsmi MİQ imtahan strukturuna uyğun hazırlanır.'],
        ['icon' => 'heart', 'title' => 'Pulsuz sınaq imkanı', 'description' => 'Bir çox sınaq tamamilə pulsuzdur — qeydiyyatdan keçib dərhal sınağa başlaya bilərsiniz.'],
    ];

    try {
        $pdo = imtahanver_db();
        $rows = $pdo->query('SELECT icon, title, description FROM home_features ORDER BY `order` ASC')->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return $fallback;
    }

    return $rows ?: $fallback;
}

/**
 * Homepage "FAQ" section is admin-managed too (Ana Səhifə screen).
 * Read straight from MySQL, same as the features section above.
 */
function home_faqs_fetch(): array {
    $fallback = [
        ['question' => 'Platformadan istifadə pulludurmu?', 'answer' => 'Bir çox sınaq (o cümlədən MİQ təcrübə imtahanı) tamamilə pulsuzdur. Bəzi planlaşdırılmış, rəsmi formatda keçirilən imtahanlar isə qeydiyyat və ödəniş tələb edir — qiymət və tarix həmin imtahanın səhifəsində göstərilir.'],
        ['question' => 'Sual bazası yenilənirmi?', 'answer' => 'Bəli, yeni fənn və mövzular üzrə suallar mütəmadi olaraq əlavə olunur.'],
        ['question' => 'İmtahan nəticəmi necə öyrənə bilərəm?', 'answer' => 'Sınaq bitdikdə sistem topladığınız balı, doğru/yanlış cavabların siyahısını və sərf olunan vaxtı dərhal göstərir.'],
        ['question' => 'Mobil cihazlarda işləyirmi?', 'answer' => 'Bəli, platforma mobil, planşet və kompüterdə rahat istifadə üçün hazırlanıb.'],
    ];

    try {
        $pdo = imtahanver_db();
        $rows = $pdo->query('SELECT question, answer FROM home_faqs ORDER BY `order` ASC')->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return $fallback;
    }

    return $rows ?: $fallback;
}

function home_feature_icon_svg(string $key): string {
    $icons = [
        'clock' => '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
        'bolt' => '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
        'chart' => '<path d="M3 7h18M3 12h18M3 17h12"/>',
        'document' => '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
        'shield' => '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18"/><path d="M8 4v5"/>',
        'heart' => '<rect x="2" y="6" width="20" height="13" rx="1.5"/><path d="M2 10h20"/><circle cx="17" cy="14.5" r="1.2" fill="currentColor" stroke="none"/>',
        'sun' => '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
        'globe' => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z"/>',
    ];
    return $icons[$key] ?? $icons['shield'];
}

require __DIR__ . '/inc/site_texts.php';
require __DIR__ . '/inc/home_categories.php';
require __DIR__ . '/inc/miq_subjects.php';

$homeFeatures = home_features_fetch();
$homeFaqs = home_faqs_fetch();
$homeCategories = home_categories_fetch();
$miqSubjects = miq_subjects_fetch();
$t = site_texts_fetch();

$pageTitle = 'İmtahanVer — MİQ imtahanına hazırlıq platforması';
$pageDescription = 'İmtahanVer — MİQ imtahanına real sınaq sualları ilə hazırlaşın. Pulsuz sınaqlarla başlayın, planlaşdırılmış rəsmi imtahanlara qoşulun. Real vaxt taymeri, anlıq nəticə, imtahan tarixçəsi.';
require __DIR__ . '/inc/head.php';
?>
<body>

<?php require __DIR__ . '/inc/header.php'; ?>

<main id="top">

  <!-- HERO BANNER -->
  <section class="hero-banner">
    <div class="wrap hero-banner-inner">
      <div class="hero-banner-row">
        <span class="hero-banner-text"><?php echo htmlspecialchars(st($t, 'hero.eyebrow_left', 'ONLAYN SINAQ'), ENT_QUOTES, 'UTF-8'); ?></span>
        <div class="hero-banner-divider"></div>
        <div class="hero-banner-mark">
          <span class="ring">
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 9h14M7 14h10M7 19h12"/><circle cx="21" cy="19" r="3" fill="currentColor" stroke="none"/></svg>
          </span>
          <span>İmtahanVer</span>
        </div>
        <div class="hero-banner-divider"></div>
        <span class="hero-banner-text"><?php echo htmlspecialchars(st($t, 'hero.eyebrow_right', 'İMTAHANLARI'), ENT_QUOTES, 'UTF-8'); ?></span>
      </div>
      <p><?php echo htmlspecialchars(st($t, 'hero.subtitle', 'MİQ imtahanına real sınaq sualları ilə hazırlaşın — pulsuz sınaqlarla başlayın, planlaşdırılmış rəsmi imtahanlara qoşulun.'), ENT_QUOTES, 'UTF-8'); ?></p>
      <a class="btn btn-card-blue" style="padding:14px 28px; font-size:1rem;" href="https://panel.imtahanver.online/register" target="_blank" rel="noopener noreferrer"><?php echo htmlspecialchars(st($t, 'hero.cta_text', 'Pulsuz qeydiyyatdan keç'), ENT_QUOTES, 'UTF-8'); ?></a>
    </div>
  </section>

  <!-- CATEGORY CARDS (admin-managed) -->
  <section class="category-grid">
    <div class="wrap">
      <div class="card-grid">
        <?php foreach ($homeCategories as $category): ?>
        <?php $catTag = !empty($category['active']) && !empty($category['href']) ? 'a' : 'div'; ?>
        <<?php echo $catTag; ?> class="cat-card is-<?php echo htmlspecialchars($category['color'] ?? 'red', ENT_QUOTES, 'UTF-8'); ?><?php echo empty($category['active']) ? ' is-disabled' : ''; ?>"<?php echo ($catTag === 'a') ? ' href="' . htmlspecialchars($category['href'], ENT_QUOTES, 'UTF-8') . '" target="_blank" rel="noopener noreferrer"' : ''; ?>>
          <span class="cat-badge"><?php echo htmlspecialchars($category['badge'] ?? '', ENT_QUOTES, 'UTF-8'); ?></span>
          <span class="cat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><?php echo home_category_icon_svg($category['icon'] ?? 'rocket'); ?></svg>
          </span>
          <h3><?php echo htmlspecialchars($category['title'] ?? '', ENT_QUOTES, 'UTF-8'); ?></h3>
        </<?php echo $catTag; ?>>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- TRUST STRIP -->
  <div class="trust">
    <div class="wrap trust-row">
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span><?php echo htmlspecialchars(st($t, 'trust.item1', 'Pulsuz sınaqlarla başlayın'), ENT_QUOTES, 'UTF-8'); ?></span>
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span><?php echo htmlspecialchars(st($t, 'trust.item2', '16 fənn üzrə real sınaq sualları'), ENT_QUOTES, 'UTF-8'); ?></span>
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span><?php echo htmlspecialchars(st($t, 'trust.item3', 'Real vaxt izləmə ilə taymer'), ENT_QUOTES, 'UTF-8'); ?></span>
      </div>
    </div>
  </div>

  <!-- NECƏ İŞLƏYİR -->
  <section id="nece-isleyir">
    <div class="wrap">
      <div class="section-head">
        <h2><?php echo htmlspecialchars(st($t, 'steps.heading', 'Üç addımda sınağa başlayın'), ENT_QUOTES, 'UTF-8'); ?></h2>
        <p><?php echo htmlspecialchars(st($t, 'steps.subtitle', 'Qeydiyyatdan tutmuş nəticəni görənədək bütün proses bir neçə dəqiqə çəkir.'), ENT_QUOTES, 'UTF-8'); ?></p>
      </div>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3><?php echo htmlspecialchars(st($t, 'steps.1_title', 'Hesab yarat'), ENT_QUOTES, 'UTF-8'); ?></h3>
          <p><?php echo htmlspecialchars(st($t, 'steps.1_desc', 'Email ünvanınızla saniyələr içində pulsuz qeydiyyatdan keçin.'), ENT_QUOTES, 'UTF-8'); ?></p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3><?php echo htmlspecialchars(st($t, 'steps.2_title', 'Sınağı seç'), ENT_QUOTES, 'UTF-8'); ?></h3>
          <p><?php echo htmlspecialchars(st($t, 'steps.2_desc', 'MİQ kateqoriyasından fənninizi seçin və sınağa başlayın.'), ENT_QUOTES, 'UTF-8'); ?></p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3><?php echo htmlspecialchars(st($t, 'steps.3_title', 'Nəticəni analiz et'), ENT_QUOTES, 'UTF-8'); ?></h3>
          <p><?php echo htmlspecialchars(st($t, 'steps.3_desc', 'Sınaq bitdikdə düzgün və səhv cavablarınıza baxıb öyrənin.'), ENT_QUOTES, 'UTF-8'); ?></p>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES (admin-managed) -->
  <section class="features">
    <div class="wrap on-board">
      <div class="section-head">
        <h2><?php echo htmlspecialchars(st($t, 'features.heading', 'Platformanın əsas xüsusiyyətləri'), ENT_QUOTES, 'UTF-8'); ?></h2>
        <p><?php echo htmlspecialchars(st($t, 'features.subtitle', 'Hər funksiya real imtahan mühitini əks etdirmək üçün qurulub.'), ENT_QUOTES, 'UTF-8'); ?></p>
      </div>
      <div class="feature-list">
        <?php foreach ($homeFeatures as $feature): ?>
        <div class="feature-row">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><?php echo home_feature_icon_svg($feature['icon'] ?? 'shield'); ?></svg>
          </div>
          <div>
            <h3><?php echo htmlspecialchars($feature['title'] ?? '', ENT_QUOTES, 'UTF-8'); ?></h3>
            <p><?php echo htmlspecialchars($feature['description'] ?? '', ENT_QUOTES, 'UTF-8'); ?></p>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- FƏNLƏR -->
  <section id="fenler">
    <div class="wrap">
      <div class="section-head">
        <h2><?php echo htmlspecialchars(st($t, 'fenler.heading', 'Fənlər'), ENT_QUOTES, 'UTF-8'); ?></h2>
        <p><?php echo htmlspecialchars(st($t, 'fenler.subtitle', 'MİQ kateqoriyasında Fənn proqramları və Tədris metodikası üzrə 16 fənn üzrə sınaqlar aktivdir. Digər kateqoriyalar hazırlanma mərhələsindədir.'), ENT_QUOTES, 'UTF-8'); ?></p>
      </div>

      <div class="subject-block">
        <div class="subject-block-head">
          <h3>MİQ İmtahanı</h3>
          <span class="status-tag live">Aktivdir</span>
        </div>
        <div class="chip-grid">
          <?php foreach ($miqSubjects as $subject): ?>
          <span class="chip"><?php echo htmlspecialchars($subject, ENT_QUOTES, 'UTF-8'); ?></span>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="subject-block">
        <div class="subject-block-head">
          <h3><?php echo htmlspecialchars(st($t, 'fenler.soon_heading', 'Tezliklə gələcək kateqoriyalar'), ENT_QUOTES, 'UTF-8'); ?></h3>
          <span class="status-tag soon">Hazırlanır</span>
        </div>
        <div class="soon-grid">
          <div class="soon-card">
            <h4><?php echo htmlspecialchars(st($t, 'soon.1_title', 'Magistr İmtahanı'), ENT_QUOTES, 'UTF-8'); ?></h4>
            <p><?php echo htmlspecialchars(st($t, 'soon.1_desc', 'Magistraturaya qəbul imtahanına hazırlıq.'), ENT_QUOTES, 'UTF-8'); ?></p>
          </div>
          <div class="soon-card">
            <h4><?php echo htmlspecialchars(st($t, 'soon.2_title', 'Buraxılış İmtahanı'), ENT_QUOTES, 'UTF-8'); ?></h4>
            <p><?php echo htmlspecialchars(st($t, 'soon.2_desc', 'IX və XI sinif şagirdləri üçün dövlət buraxılış imtahanı formatında sınaqlar.'), ENT_QUOTES, 'UTF-8'); ?></p>
          </div>
          <div class="soon-card">
            <h4><?php echo htmlspecialchars(st($t, 'soon.3_title', 'Tələbə Sınaqları'), ENT_QUOTES, 'UTF-8'); ?></h4>
            <p><?php echo htmlspecialchars(st($t, 'soon.3_desc', 'Ali məktəb tələbələri üçün fənn/mövzu bilik yoxlama testləri.'), ENT_QUOTES, 'UTF-8'); ?></p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="suallar">
    <div class="wrap">
      <div class="section-head">
        <h2><?php echo htmlspecialchars(st($t, 'faq.heading', 'Tez-tez verilən suallar'), ENT_QUOTES, 'UTF-8'); ?></h2>
        <p><?php echo htmlspecialchars(st($t, 'faq.subtitle', 'Aydın olmayan bir şey varsa, buradan tapa bilərsiniz.'), ENT_QUOTES, 'UTF-8'); ?></p>
      </div>
      <div class="faq-list">
        <?php foreach ($homeFaqs as $faq): ?>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">
            <?php echo htmlspecialchars($faq['question'] ?? '', ENT_QUOTES, 'UTF-8'); ?>
            <span class="plus"></span>
          </button>
          <div class="faq-a"><p><?php echo htmlspecialchars($faq['answer'] ?? '', ENT_QUOTES, 'UTF-8'); ?></p></div>
        </div>
        <?php endforeach; ?>
      </div>
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

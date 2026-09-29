<?php
/**
 * Shared renderer for legal pages. The including file must set $legalSlug
 * and $legalFallback (['heading' => ..., 'body' => ...]) before requiring
 * this template.
 */
require __DIR__ . '/db.php';
require __DIR__ . '/legal.php';

$legalPage = legal_page_fetch($legalSlug, $legalFallback);
$legalHeading = $legalPage['heading'] ?? $legalFallback['heading'];

$pageTitle = $legalHeading . ' — İmtahanVer';
$pageDescription = 'İmtahanVer platformasının ' . $legalHeading . ' səhifəsi.';
require __DIR__ . '/head.php';
?>
<body>

<?php require __DIR__ . '/header.php'; ?>

<main>

  <section class="page-hero">
    <div class="wrap page-hero-inner">
      <span class="page-hero-eyebrow">Hüquqi məlumat</span>
      <h1><?php echo htmlspecialchars($legalHeading, ENT_QUOTES, 'UTF-8'); ?></h1>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="legal-prose">
        <?php echo legal_body_render($legalPage['body'] ?? ''); ?>
      </div>
    </div>
  </section>

</main>

<?php require __DIR__ . '/footer.php'; ?>

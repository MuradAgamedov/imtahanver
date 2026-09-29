<?php
require_once __DIR__ . '/site_texts.php';
$headerTexts = site_texts_fetch();
?>
<div class="topbar">
  <div class="wrap topbar-inner">
    <span class="topbar-tagline"><?php echo htmlspecialchars(st($headerTexts, 'topbar.tagline', 'Azərbaycanın rəqəmsal imtahan hazırlıq platforması'), ENT_QUOTES, 'UTF-8'); ?></span>
    <div class="topbar-links">
      <a href="/#suallar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 1.8-2.5 3.5"/><path d="M12 17h.01"/></svg>
        Sual-cavab
      </a>
      <a href="https://panel.imtahanver.online/login" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>
        Şəxsi kabinet
      </a>
      <a href="/elaqe" class="muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
        Əlaqə
      </a>
    </div>
  </div>
</div>

<header class="masthead" id="site-header">
  <div class="wrap masthead-inner">
    <a href="/" class="brand-mark" aria-label="İmtahanVer ana səhifə">
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M7 9h14M7 14h10M7 19h12" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="21" cy="19" r="3" fill="#fff" opacity=".9"/>
      </svg>
    </a>
    <a href="/" class="brand-text" style="text-decoration:none;">
      <span class="line1"><?php echo htmlspecialchars(st($headerTexts, 'brand.tagline', 'Rəqəmsal imtahan hazırlıq platforması'), ENT_QUOTES, 'UTF-8'); ?></span>
      <span class="line2">İmtahanVer</span>
    </a>
    <nav class="primary-nav" aria-label="Əsas naviqasiya">
      <a href="/#nece-isleyir">Necə işləyir</a>
      <a href="/#fenler">Fənlər</a>
      <a href="/haqqimizda">Haqqımızda</a>
      <a href="/#suallar">Suallar</a>
      <a href="/elaqe">Əlaqə</a>
    </nav>
    <div class="nav-actions">
      <a class="btn btn-outline-ink" href="https://panel.imtahanver.online/login" target="_blank" rel="noopener noreferrer">Giriş</a>
      <a class="btn btn-card-blue" href="https://panel.imtahanver.online/register" target="_blank" rel="noopener noreferrer">Qeydiyyat</a>
      <button class="menu-toggle" id="menuToggle" aria-label="Menyunu aç" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
      </button>
    </div>
  </div>
  <div class="mobile-panel" id="mobilePanel">
    <a href="/#nece-isleyir">Necə işləyir</a>
    <a href="/#fenler">Fənlər</a>
    <a href="/haqqimizda">Haqqımızda</a>
    <a href="/#suallar">Suallar</a>
    <a href="/elaqe">Əlaqə</a>
    <div class="mobile-actions">
      <a class="btn btn-outline-ink" href="https://panel.imtahanver.online/login" target="_blank" rel="noopener noreferrer">Giriş</a>
      <a class="btn btn-card-blue" href="https://panel.imtahanver.online/register" target="_blank" rel="noopener noreferrer">Qeydiyyat</a>
    </div>
  </div>
</header>


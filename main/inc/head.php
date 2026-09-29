<!DOCTYPE html>
<html lang="az">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($pageTitle ?? 'İmtahanVer — MİQ imtahanına hazırlıq platforması') ?></title>
<meta name="description" content="<?= htmlspecialchars($pageDescription ?? 'İmtahanVer — MİQ imtahanına real sınaq sualları ilə hazırlaşın. Pulsuz sınaqlarla başlayın, planlaşdırılmış rəsmi imtahanlara qoşulun.') ?>">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>
  :root{
    --board:#153A63;
    --board-deep:#0D2745;
    --paper:#FFFFFF;
    --paper-2:#EAF1F8;
    --ink:#17222E;
    --ink-soft:#55677D;
    --chalk:#F3F8FC;
    --chalk-soft:#C4D5E5;
    --amber:#2E86C1;
    --amber-deep:#1F6A9E;
    --ok:#3F7D58;
    --bad:#B65041;
    --link-blue:#2E6DB4;
    --card-blue:#1E7FBF;
    --card-navy:#1B3A6B;
    --card-teal:#2A7F7A;
    --card-red:#E5473C;
    --line-ink:rgba(23,34,46,0.15);
    --line-chalk:rgba(243,248,252,0.18);
    --radius-s:4px;
    --radius-m:10px;
    --serif: Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif;
    --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  }

  *,*::before,*::after{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto;}
    *,*::before,*::after{animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important;}
  }

  body{
    margin:0;
    font-family:var(--sans);
    color:var(--ink);
    background:var(--paper);
    line-height:1.55;
    -webkit-font-smoothing:antialiased;
  }

  img,svg{max-width:100%; display:block;}
  a{color:inherit;}
  h1,h2,h3{font-family:var(--serif); margin:0; font-weight:600; letter-spacing:-0.01em;}
  p{margin:0;}
  ul{margin:0; padding:0; list-style:none;}
  button{font-family:inherit; cursor:pointer;}

  .wrap{
    width:100%;
    max-width:1120px;
    margin:0 auto;
    padding-inline:24px;
  }

  /* ---------- Buttons ---------- */
  .btn{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    padding:13px 24px;
    border-radius:var(--radius-s);
    font-size:0.98rem;
    font-weight:600;
    text-decoration:none;
    border:1.5px solid transparent;
    white-space:nowrap;
    transition:transform .15s ease, background .15s ease, border-color .15s ease;
  }
  .btn:active{transform:translateY(1px);}
  .btn-amber{
    background:var(--amber);
    color:#fff;
  }
  .btn-amber:hover{background:var(--amber-deep);}
  .btn-outline-chalk{
    border-color:var(--line-chalk);
    color:var(--chalk);
    background:transparent;
  }
  .btn-outline-chalk:hover{border-color:var(--chalk);}
  .btn-outline-ink{
    border-color:var(--line-ink);
    color:var(--ink);
    background:transparent;
  }
  .btn-outline-ink:hover{border-color:var(--ink);}

  /* ---------- Utility topbar ---------- */
  .topbar{
    background:#fff;
    border-bottom:1px solid #E5E7EB;
  }
  .topbar-inner{
    display:flex;
    align-items:center;
    justify-content:space-between;
    min-height:38px;
    padding-block:8px;
    font-size:0.8rem;
    color:var(--ink-soft);
  }
  .topbar-tagline{font-weight:500;}
  .topbar-links{
    display:flex;
    align-items:center;
    gap:18px;
  }
  .topbar-links a{
    display:inline-flex;
    align-items:center;
    gap:6px;
    text-decoration:none;
    color:var(--link-blue);
    font-weight:500;
  }
  .topbar-links a svg{width:14px; height:14px; flex-shrink:0;}
  .topbar-links a.muted{color:var(--ink-soft);}

  /* ---------- Masthead (logo + nav) ---------- */
  .masthead{
    position:sticky;
    top:0;
    z-index:50;
    background:#fff;
    border-bottom:1px solid #E5E7EB;
    transition:box-shadow .2s ease;
  }
  .masthead.scrolled{box-shadow:0 2px 10px rgba(0,0,0,.06);}
  .masthead-inner{
    display:flex;
    align-items:center;
    gap:20px;
    min-height:84px;
    padding-block:14px;
  }
  .brand-mark{
    display:flex;
    align-items:center;
    justify-content:center;
    width:52px; height:52px;
    flex-shrink:0;
    border-radius:8px;
    background:var(--board);
  }
  .brand-mark svg{width:26px; height:26px;}
  .brand-text{flex-shrink:0;}
  .brand-text .line1{
    display:block;
    font-size:0.78rem;
    color:var(--ink-soft);
    line-height:1.3;
  }
  .brand-text .line2{
    display:block;
    font-family:var(--serif);
    font-size:1.3rem;
    font-weight:700;
    color:var(--board);
    line-height:1.2;
  }
  nav.primary-nav{
    display:flex;
    align-items:center;
    gap:28px;
    margin-left:24px;
  }
  nav.primary-nav a{
    text-decoration:none;
    color:var(--ink);
    font-size:0.86rem;
    font-weight:700;
    letter-spacing:0.03em;
    text-transform:uppercase;
    white-space:nowrap;
  }
  nav.primary-nav a:hover{color:var(--link-blue);}
  .nav-actions{
    display:flex;
    align-items:center;
    gap:10px;
    flex-shrink:0;
    margin-left:auto;
  }
  .nav-actions .btn{padding:10px 18px; font-size:0.88rem;}
  .btn-outline-ink{
    border-color:var(--line-ink);
    color:var(--ink);
    background:transparent;
  }
  .btn-outline-ink:hover{border-color:var(--board); color:var(--board);}
  .btn-card-blue{background:var(--card-blue); color:#fff;}
  .btn-card-blue:hover{background:var(--board);}
  .menu-toggle{
    display:none;
    background:none;
    border:1.5px solid var(--line-ink);
    border-radius:var(--radius-s);
    padding:8px 10px;
    color:var(--ink);
    margin-left:auto;
  }
  .menu-toggle svg{width:20px; height:20px;}

  /* ---------- Hero banner ---------- */
  .hero-banner{
    position:relative;
    overflow:hidden;
    background:var(--paper-2);
    border-bottom:1px solid var(--line-ink);
  }
  .hero-banner::before{
    content:"";
    position:absolute;
    inset:0;
    opacity:0.5;
    background-image:
      radial-gradient(var(--line-ink) 1px, transparent 1.5px),
      radial-gradient(var(--line-ink) 1px, transparent 1.5px);
    background-size:28px 28px;
    background-position:0 0, 14px 14px;
    pointer-events:none;
  }
  .hero-banner-inner{
    position:relative;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:20px;
    padding-block:44px;
    text-align:center;
  }
  .hero-banner-row{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:28px;
  }
  .hero-banner-text{
    font-family:var(--serif);
    font-weight:700;
    font-style:italic;
    font-size:clamp(1.5rem, 3.4vw, 2.6rem);
    color:var(--card-blue);
    line-height:1.1;
  }
  .hero-banner-divider{
    width:1.5px;
    height:44px;
    background:var(--line-ink);
    flex-shrink:0;
  }
  .hero-banner-mark{
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:6px;
    flex-shrink:0;
  }
  .hero-banner-mark .ring{
    display:flex;
    align-items:center;
    justify-content:center;
    width:64px; height:64px;
    border-radius:50%;
    border:2px solid var(--card-blue);
    background:#fff;
  }
  .hero-banner-mark .ring svg{width:30px; height:30px; color:var(--card-blue);}
  .hero-banner-mark span{
    font-family:var(--serif);
    font-weight:700;
    font-size:0.85rem;
    color:var(--board);
  }
  .hero-banner p{
    color:var(--ink-soft);
    font-size:1rem;
    max-width:52ch;
  }

  /* ---------- Trust strip ---------- */
  .trust{
    border-bottom:1px solid var(--line-ink);
  }
  .trust-row{
    display:flex;
    flex-wrap:wrap;
    gap:14px 40px;
    padding-block:26px;
  }
  .trust-item{
    display:flex;
    align-items:center;
    gap:10px;
    font-size:0.94rem;
    color:var(--ink-soft);
  }
  .trust-item svg{width:18px; height:18px; color:var(--ok); flex-shrink:0;}
  .trust-item strong{color:var(--ink); font-weight:600;}

  /* ---------- Category cards grid ---------- */
  .category-grid{
    background:#F2F2F3;
  }
  .card-grid{
    display:grid;
    grid-template-columns:repeat(4, 1fr);
    gap:16px;
  }
  .cat-card{
    position:relative;
    display:flex;
    flex-direction:column;
    justify-content:flex-end;
    min-height:208px;
    border-radius:6px;
    padding:20px;
    color:#fff;
    text-decoration:none;
    overflow:hidden;
    transition:transform .18s ease, box-shadow .18s ease;
  }
  .cat-card:hover{transform:translateY(-3px); box-shadow:0 10px 24px rgba(0,0,0,.16);}
  .cat-card.is-blue{background:var(--card-blue);}
  .cat-card.is-navy{background:var(--card-navy);}
  .cat-card.is-teal{background:var(--card-teal);}
  .cat-card.is-red{background:var(--card-red);}
  .cat-card.is-disabled{cursor:default;}
  .cat-card.is-disabled:hover{transform:none; box-shadow:none;}
  .cat-badge{
    position:absolute;
    top:16px; left:16px;
    background:#fff;
    color:var(--ink);
    font-size:0.72rem;
    font-weight:700;
    padding:4px 10px;
    border-radius:4px;
  }
  .cat-icon{
    position:absolute;
    top:16px; right:16px;
    width:30px; height:30px;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .cat-icon svg{width:22px; height:22px; color:#fff; opacity:.9;}
  .cat-card h3{
    font-family:var(--sans);
    font-size:1.05rem;
    font-weight:700;
    line-height:1.3;
    max-width:22ch;
  }

  /* ---------- Section shell ---------- */
  section{padding-block:84px;}
  section[id]{scroll-margin-top:90px;}
  .section-head{
    max-width:56ch;
    margin-bottom:52px;
  }
  .section-head h2{
    font-size:clamp(1.6rem, 3vw, 2.2rem);
    line-height:1.2;
  }
  .section-head p{
    margin-top:14px;
    color:var(--ink-soft);
    font-size:1.02rem;
  }
  .on-board .section-head p{color:var(--chalk-soft);}
  .on-board .section-head h2{color:var(--chalk);}

  /* ---------- How it works ---------- */
  .steps{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:0;
    position:relative;
  }
  .step{
    position:relative;
    padding-right:36px;
  }
  .step:not(:last-child)::after{
    content:"";
    position:absolute;
    top:22px;
    right:-2px;
    width:calc(100% - 20px);
    height:1px;
    background-image:repeating-linear-gradient(to right, var(--ink-soft) 0 6px, transparent 6px 12px);
    opacity:0.5;
  }
  .step-num{
    font-family:var(--serif);
    font-size:1.6rem;
    color:var(--amber-deep);
    margin-bottom:14px;
  }
  .step h3{
    font-size:1.12rem;
    margin-bottom:10px;
  }
  .step p{
    color:var(--ink-soft);
    font-size:0.96rem;
  }

  /* ---------- Features (on board) ---------- */
  .features{
    background:var(--board);
    color:var(--chalk);
    position:relative;
    overflow:hidden;
  }
  .features::before{
    content:"";
    position:absolute;
    inset:0;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
    pointer-events:none;
    mix-blend-mode:overlay;
  }
  .feature-list{
    position:relative;
    border-top:1px solid var(--line-chalk);
  }
  .feature-row{
    display:grid;
    grid-template-columns:44px 1fr;
    gap:20px;
    padding-block:26px;
    border-bottom:1px solid var(--line-chalk);
  }
  .feature-icon{
    width:40px; height:40px;
    border-radius:50%;
    border:1.5px solid var(--amber);
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
  }
  .feature-icon svg{width:19px; height:19px; color:var(--amber);}
  .feature-row h3{
    font-size:1.08rem;
    color:var(--chalk);
    margin-bottom:6px;
  }
  .feature-row p{
    color:var(--chalk-soft);
    font-size:0.95rem;
    max-width:56ch;
  }

  /* ---------- Subjects ---------- */
  .subject-block{margin-bottom:64px;}
  .subject-block:last-child{margin-bottom:0;}
  .subject-block-head{
    display:flex;
    align-items:center;
    gap:12px;
    margin-bottom:22px;
    flex-wrap:wrap;
  }
  .subject-block-head h3{
    font-size:1.2rem;
  }
  .status-tag{
    font-size:0.72rem;
    font-weight:700;
    padding:4px 10px;
    border-radius:100px;
    letter-spacing:0.02em;
  }
  .status-tag.live{
    background:rgba(63,125,88,0.14);
    color:var(--ok);
    border:1px solid rgba(63,125,88,0.35);
  }
  .status-tag.soon{
    background:transparent;
    color:var(--ink-soft);
    border:1px dashed var(--ink-soft);
  }
  .chip-grid{
    display:flex;
    flex-wrap:wrap;
    gap:10px;
  }
  .chip{
    padding:9px 16px;
    border:1px solid var(--line-ink);
    border-radius:var(--radius-s);
    font-size:0.9rem;
    background:var(--paper-2);
  }
  .soon-grid{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:16px;
  }
  .soon-card{
    border:1.5px dashed var(--ink-soft);
    border-radius:var(--radius-m);
    padding:20px;
  }
  .soon-card h4{
    font-family:var(--serif);
    font-size:1.02rem;
    font-weight:600;
    margin-bottom:8px;
  }
  .soon-card p{
    font-size:0.9rem;
    color:var(--ink-soft);
  }

  /* ---------- FAQ ---------- */
  .faq-list{border-top:1px solid var(--line-ink);}
  .faq-item{border-bottom:1px solid var(--line-ink);}
  .faq-q{
    width:100%;
    background:none;
    border:none;
    text-align:left;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:16px;
    padding-block:22px;
    font-family:var(--serif);
    font-size:1.05rem;
    font-weight:600;
    color:var(--ink);
  }
  .faq-q .plus{
    flex-shrink:0;
    width:22px; height:22px;
    position:relative;
  }
  .faq-q .plus::before,.faq-q .plus::after{
    content:"";
    position:absolute;
    background:var(--ink);
    top:50%; left:50%;
    transform:translate(-50%,-50%);
  }
  .faq-q .plus::before{width:14px; height:2px;}
  .faq-q .plus::after{width:2px; height:14px; transition:transform .2s ease;}
  .faq-item.open .plus::after{transform:translate(-50%,-50%) rotate(90deg) scaleY(0);}
  .faq-a{
    max-height:0;
    overflow:hidden;
    transition:max-height .25s ease;
  }
  .faq-a p{
    padding-bottom:22px;
    color:var(--ink-soft);
    font-size:0.96rem;
    max-width:60ch;
  }

  /* ---------- CTA banner ---------- */
  .cta-banner{
    background:var(--board-deep);
    color:var(--chalk);
    text-align:left;
  }
  .cta-banner .wrap{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:32px;
    flex-wrap:wrap;
  }
  .cta-banner h2{
    font-size:clamp(1.5rem,2.8vw,2rem);
    max-width:20ch;
  }
  .cta-banner-actions{
    display:flex;
    gap:14px;
    flex-wrap:wrap;
  }

  /* ---------- Floating buttons ---------- */
  .float-btn{
    position:fixed;
    bottom:22px;
    z-index:60;
    width:52px; height:52px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    color:#fff;
    box-shadow:0 6px 18px rgba(0,0,0,.22);
    text-decoration:none;
    border:none;
  }
  .float-btn svg{width:24px; height:24px;}
  .float-chat{right:22px; background:var(--card-blue);}
  .float-chat:hover{background:var(--board);}
  .float-a11y{left:22px; background:var(--card-navy);}
  .float-a11y:hover{background:var(--board);}
  html.a11y-boost{font-size:112.5%;}
  html.a11y-boost body{line-height:1.7;}
  html.a11y-boost .card-grid,
  html.a11y-boost .steps,
  html.a11y-boost .features{filter:contrast(1.05);}

  /* ---------- Footer ---------- */
  footer{
    background:var(--board-deep);
    color:var(--chalk-soft);
    border-top:1px solid var(--line-chalk);
  }
  .footer-top{
    display:grid;
    grid-template-columns:1.2fr 0.9fr 0.9fr 0.9fr;
    gap:40px;
    padding-block:56px 40px;
  }
  .footer-brand .brand{
    display:inline-flex;
    align-items:baseline;
    gap:2px;
    font-family:var(--serif);
    font-size:1.28rem;
    font-weight:700;
    text-decoration:none;
    color:var(--chalk);
    margin-bottom:14px;
  }
  .footer-brand .brand em{font-style:normal; color:var(--amber);}
  .footer-brand p{
    font-size:0.92rem;
    max-width:38ch;
    color:var(--chalk-soft);
  }
  .footer-social{
    display:flex;
    gap:10px;
    margin-top:18px;
  }
  .footer-social a{
    display:flex;
    align-items:center;
    justify-content:center;
    width:34px;
    height:34px;
    border-radius:50%;
    background:rgba(243,248,252,0.08);
    color:var(--chalk-soft);
    transition:background 0.15s, color 0.15s;
  }
  .footer-social a:hover{
    background:var(--card-blue);
    color:#fff;
  }
  .footer-social svg{width:16px; height:16px;}
  .footer-col h4{
    font-size:0.82rem;
    color:var(--chalk);
    margin-bottom:14px;
    font-weight:600;
  }
  .footer-col ul{display:flex; flex-direction:column; gap:10px;}
  .footer-col a{
    text-decoration:none;
    color:var(--chalk-soft);
    font-size:0.92rem;
  }
  .footer-col a:hover{color:var(--chalk);}
  .footer-collab{
    border-top:1px solid var(--line-chalk);
    padding-block:20px;
    font-size:0.85rem;
  }
  .footer-collab a{color:var(--amber); text-decoration:none;}
  .footer-collab a:hover{text-decoration:underline;}
  .footer-bottom{
    border-top:1px solid var(--line-chalk);
    padding-block:20px;
    display:flex;
    justify-content:space-between;
    flex-wrap:wrap;
    gap:10px;
    font-size:0.82rem;
  }

  /* ---------- Mobile nav panel ---------- */
  .mobile-panel{
    display:none;
    background:#fff;
    border-top:1px solid var(--line-ink);
    padding:18px 24px 26px;
  }
  .mobile-panel.open{display:block;}
  .mobile-panel a{
    display:block;
    padding:12px 0;
    color:var(--ink);
    text-decoration:none;
    font-size:0.95rem;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:0.02em;
    border-bottom:1px solid var(--line-ink);
  }
  .mobile-panel .mobile-actions{
    display:flex;
    gap:12px;
    margin-top:18px;
  }
  .mobile-panel .mobile-actions .btn{
    flex:1;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:12px 0;
  }

  /* ---------- Responsive ---------- */
  @media (max-width: 1100px){
    nav.primary-nav{display:none;}
    .nav-actions .btn{display:none;}
    .brand-text .line1{display:none;}
    .menu-toggle{display:inline-flex; align-items:center;}
  }

  @media (max-width: 900px){
    .topbar-tagline{display:none;}
    .hero-banner-row{gap:14px;}
    .hero-banner-text{font-size:clamp(1.1rem, 5vw, 1.6rem);}
    .hero-banner-divider{height:32px;}
    .hero-banner-mark .ring{width:48px; height:48px;}
    .hero-banner-mark .ring svg{width:22px; height:22px;}
    .card-grid{grid-template-columns:repeat(2, 1fr);}
    .steps{grid-template-columns:1fr; gap:36px;}
    .step{padding-right:0;}
    .step:not(:last-child)::after{display:none;}
    .footer-top{grid-template-columns:1fr; gap:32px;}
    .soon-grid{grid-template-columns:1fr;}
  }

  @media (max-width: 560px){
    .wrap{padding-inline:18px;}
    section{padding-block:56px;}
    .trust-row{gap:14px 24px;}
    .feature-row{grid-template-columns:36px 1fr; gap:14px;}
    .feature-icon{width:34px; height:34px;}
    .cta-banner .wrap{flex-direction:column; align-items:flex-start;}
    .cta-banner-actions{width:100%;}
    .cta-banner-actions .btn{flex:1;}
    .hero-banner-row{flex-direction:column; gap:10px;}
    .hero-banner-divider{display:none;}
    .card-grid{grid-template-columns:1fr;}
    .page-hero-inner{padding-block:36px;}
  }

  /* ---------- Internal page hero (Haqqımızda, etc.) ---------- */
  .page-hero{
    position:relative;
    overflow:hidden;
    background:var(--board);
    border-bottom:1px solid var(--line-chalk);
  }
  .page-hero::before{
    content:"";
    position:absolute;
    inset:0;
    opacity:0.5;
    background-image:
      radial-gradient(var(--line-chalk) 1px, transparent 1.5px),
      radial-gradient(var(--line-chalk) 1px, transparent 1.5px);
    background-size:28px 28px;
    background-position:0 0, 14px 14px;
    pointer-events:none;
  }
  .page-hero-inner{
    position:relative;
    padding-block:64px;
    text-align:center;
  }
  .page-hero-eyebrow{
    display:inline-block;
    font-size:0.78rem;
    font-weight:700;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:var(--card-blue);
    margin-bottom:14px;
  }
  .page-hero h1{
    font-family:var(--serif);
    font-weight:700;
    font-size:clamp(2rem, 4vw, 2.8rem);
    color:var(--chalk);
    line-height:1.15;
  }
  .page-hero p{
    margin-top:16px;
    max-width:60ch;
    margin-inline:auto;
    color:var(--chalk-soft);
    font-size:1.05rem;
    line-height:1.6;
  }

  /* ---------- About layout ---------- */
  .about-layout{
    display:flex;
    flex-direction:column;
    gap:40px;
  }
  .about-prose{width:100%;}
  .about-prose p{
    color:var(--ink-soft);
    font-size:1.02rem;
    line-height:1.75;
  }
  .about-prose p + p{margin-top:20px;}
  .about-mission{
    width:100%;
    background:var(--paper-2);
    border:1px solid var(--line-ink);
    border-left:4px solid var(--card-blue);
    border-radius:var(--radius-m);
    padding:28px 32px;
  }
  .about-mission h3{
    font-size:1.05rem;
    color:var(--ink);
    margin-bottom:10px;
  }
  .about-mission p{
    color:var(--ink-soft);
    font-size:0.98rem;
    line-height:1.7;
  }
  .about-mission p + p{margin-top:14px;}

  /* ---------- Contact page ---------- */
  .contact-card{
    display:grid;
    grid-template-columns:1fr 1.25fr;
    border-radius:20px;
    overflow:hidden;
    border:1px solid var(--line-ink);
    box-shadow:0 24px 60px rgba(13,39,69,0.14);
  }
  .contact-card-side{
    position:relative;
    overflow:hidden;
    background:var(--board);
    color:var(--chalk);
    padding:48px 44px;
    display:flex;
    flex-direction:column;
    justify-content:center;
  }
  .contact-card-side::before{
    content:"";
    position:absolute;
    inset:0;
    opacity:0.5;
    background-image:
      radial-gradient(var(--line-chalk) 1px, transparent 1.5px),
      radial-gradient(var(--line-chalk) 1px, transparent 1.5px);
    background-size:28px 28px;
    background-position:0 0, 14px 14px;
    pointer-events:none;
  }
  .contact-card-icon{
    position:relative;
    display:flex;
    align-items:center;
    justify-content:center;
    width:56px;
    height:56px;
    border-radius:50%;
    background:rgba(243,248,252,0.12);
    margin-bottom:24px;
  }
  .contact-card-icon svg{width:26px; height:26px;}
  .contact-card-side h2{
    position:relative;
    font-family:var(--serif);
    font-weight:700;
    font-size:1.7rem;
    color:var(--chalk);
    margin-bottom:14px;
  }
  .contact-card-side > p{
    position:relative;
    color:var(--chalk-soft);
    font-size:0.98rem;
    line-height:1.65;
    margin-bottom:34px;
    max-width:38ch;
  }
  .contact-info-list{
    position:relative;
    display:flex;
    flex-direction:column;
    gap:20px;
  }
  .contact-info-item{
    display:flex;
    align-items:center;
    gap:14px;
  }
  .contact-info-icon{
    display:flex;
    align-items:center;
    justify-content:center;
    width:38px;
    height:38px;
    border-radius:50%;
    background:rgba(243,248,252,0.12);
    color:var(--chalk);
    flex-shrink:0;
  }
  .contact-info-icon svg{width:17px; height:17px;}
  .contact-info-item h4{
    font-size:0.72rem;
    line-height:1.2;
    text-transform:uppercase;
    letter-spacing:0.05em;
    color:var(--chalk-soft);
    margin-bottom:3px;
  }
  .contact-info-item a, .contact-info-item span{
    display:block;
    color:var(--chalk);
    font-size:0.98rem;
    line-height:1.2;
    font-weight:600;
    text-decoration:none;
  }
  .contact-info-item a:hover{text-decoration:underline;}

  .contact-card-form{
    background:var(--paper);
    padding:48px 44px;
  }
  .contact-card-form h3{
    font-size:1.15rem;
    color:var(--ink);
    margin-bottom:24px;
  }
  .form-field{margin-bottom:20px;}
  .form-field label{
    display:block;
    font-size:0.82rem;
    font-weight:600;
    color:var(--ink);
    margin-bottom:8px;
  }
  .form-field input, .form-field textarea{
    width:100%;
    font-family:inherit;
    font-size:0.95rem;
    color:var(--ink);
    background:var(--paper-2);
    border:1px solid var(--line-ink);
    border-radius:var(--radius-s);
    padding:11px 14px;
  }
  .form-field input:focus, .form-field textarea:focus{
    outline:none;
    border-color:var(--card-blue);
    box-shadow:0 0 0 3px rgba(30,127,191,0.15);
  }
  .form-field textarea{resize:vertical; min-height:120px;}
  .form-field-error{
    margin-top:6px;
    font-size:0.82rem;
    color:var(--bad);
  }
  .honeypot-field{
    position:absolute;
    left:-9999px;
    width:1px;
    height:1px;
    overflow:hidden;
  }

  /* ---------- Sweet-alert style modal ---------- */
  .alert-modal-overlay{
    position:fixed;
    inset:0;
    z-index:200;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(13,20,30,0.55);
    opacity:0;
    pointer-events:none;
    transition:opacity 0.2s ease;
  }
  .alert-modal-overlay.is-open{opacity:1; pointer-events:auto;}
  .alert-modal{
    width:100%;
    max-width:380px;
    background:var(--paper);
    border-radius:18px;
    padding:38px 32px 32px;
    text-align:center;
    box-shadow:0 30px 70px rgba(13,39,69,0.35);
    transform:scale(0.92) translateY(6px);
    transition:transform 0.2s ease;
  }
  .alert-modal-overlay.is-open .alert-modal{transform:scale(1) translateY(0);}
  .alert-modal-icon{
    display:flex;
    align-items:center;
    justify-content:center;
    width:64px;
    height:64px;
    border-radius:50%;
    margin:0 auto 20px;
  }
  .alert-modal-icon svg{width:30px; height:30px;}
  .alert-modal-icon.is-success{background:rgba(63,125,88,0.12); color:var(--ok);}
  .alert-modal-icon.is-error{background:rgba(182,80,65,0.12); color:var(--bad);}
  .alert-modal h3{
    font-family:var(--serif);
    font-size:1.3rem;
    color:var(--ink);
    margin-bottom:10px;
  }
  .alert-modal p{
    color:var(--ink-soft);
    font-size:0.95rem;
    line-height:1.6;
    margin-bottom:26px;
  }

  @media (max-width: 800px){
    .contact-card{grid-template-columns:1fr;}
    .contact-card-side, .contact-card-form{padding:36px 28px;}
  }

  /* ---------- Legal pages (privacy / terms / refund) ---------- */
  .legal-prose{
    max-width:74ch;
    margin-inline:auto;
  }
  .legal-prose h3{
    font-size:1.15rem;
    color:var(--ink);
    margin-top:36px;
    margin-bottom:12px;
  }
  .legal-prose h3:first-child{margin-top:0;}
  .legal-prose p{
    color:var(--ink-soft);
    font-size:1rem;
    line-height:1.75;
  }
  .legal-prose p + p{margin-top:16px;}
  .legal-updated{
    max-width:74ch;
    margin:0 auto 32px;
    font-size:0.85rem;
    color:var(--ink-soft);
    border-bottom:1px solid var(--line-ink);
    padding-bottom:20px;
  }
</style>
</head>

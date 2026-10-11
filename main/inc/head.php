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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --board:#0F172A;
    --board-deep:#020617;
    --paper:#FFFFFF;
    --paper-2:#F8FAFC;
    --ink:#0F172A;
    --ink-soft:#475569;
    --chalk:#F8FAFC;
    --chalk-soft:#E2E8F0;
    --amber:#4F46E5;
    --amber-deep:#4338CA;
    --ok:#10B981;
    --bad:#EF4444;
    --link-blue:#4F46E5;
    --card-blue:#2563EB;
    --card-navy:#4F46E5;
    --card-teal:#0D9488;
    --card-red:#DC2626;
    --line-ink:rgba(15,23,42,0.08);
    --line-chalk:rgba(248,250,252,0.12);
    --radius-s:8px;
    --radius-m:14px;
    --radius-l:20px;
    --sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --serif: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --display: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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
    line-height:1.6;
    -webkit-font-smoothing:antialiased;
  }

  img,svg{max-width:100%; display:block;}
  a{color:inherit;}
  h1,h2,h3,h4{font-family:var(--display); margin:0; font-weight:700; letter-spacing:-0.02em;}
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

  /* ---------- Modern Masthead (logo + nav) ---------- */
  .masthead{
    position:sticky;
    top:0;
    z-index:50;
    background:rgba(255, 255, 255, 0.92);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
    border-bottom:1px solid rgba(226, 232, 240, 0.8);
    transition:box-shadow .2s ease;
  }
  .masthead.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.06);}
  .masthead-inner{
    display:flex;
    align-items:center;
    gap:24px;
    min-height:76px;
    padding-block:12px;
  }
  .brand-mark{
    display:flex;
    align-items:center;
    justify-content:center;
    width:46px; height:46px;
    flex-shrink:0;
    border-radius:12px;
    background:linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
    box-shadow:0 6px 16px rgba(79, 70, 229, 0.3);
    transition:transform .2s ease;
  }
  .brand-mark:hover{transform:scale(1.05);}
  .brand-mark svg{width:24px; height:24px;}
  .brand-text{flex-shrink:0;}
  .brand-text .line1{
    display:block;
    font-size:0.74rem;
    color:#64748B;
    line-height:1.2;
    font-weight:500;
  }
  .brand-text .line2{
    display:block;
    font-family:var(--display);
    font-size:1.35rem;
    font-weight:800;
    color:#0F172A;
    line-height:1.2;
    letter-spacing:-0.03em;
  }
  nav.primary-nav{
    display:flex;
    align-items:center;
    gap:28px;
    margin-left:20px;
  }
  nav.primary-nav a{
    text-decoration:none;
    color:#475569;
    font-size:0.92rem;
    font-weight:600;
    letter-spacing:0;
    text-transform:none;
    white-space:nowrap;
    transition:color .18s ease;
  }
  nav.primary-nav a:hover{color:#4F46E5;}
  .nav-actions{
    display:flex;
    align-items:center;
    gap:10px;
    flex-shrink:0;
    margin-left:auto;
  }
  .nav-actions .btn{
    padding:9px 18px;
    font-size:0.9rem;
    border-radius:10px;
    font-weight:600;
  }
  .btn-outline-ink{
    border:1px solid #CBD5E1;
    color:#334155;
    background:#FFFFFF;
    transition:all .2s ease;
  }
  .btn-outline-ink:hover{
    border-color:#94A3B8;
    background:#F8FAFC;
    color:#0F172A;
  }
  .btn-card-blue{
    background:linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
    color:#fff !important;
    border:none;
    box-shadow:0 4px 14px rgba(79, 70, 229, 0.3);
    transition:all .2s ease;
  }
  .btn-card-blue:hover{
    transform:translateY(-1px);
    box-shadow:0 6px 18px rgba(79, 70, 229, 0.45);
  }
  .menu-toggle{
    display:none;
    background:none;
    border:1px solid #CBD5E1;
    border-radius:8px;
    padding:8px 10px;
    color:#334155;
    margin-left:auto;
  }
  .menu-toggle svg{width:20px; height:20px;}

  /* ---------- Modern EdTech Hero banner ---------- */
  .hero-banner{
    position:relative;
    overflow:hidden;
    background:linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%);
    border-bottom:1px solid rgba(226,232,240,0.8);
    padding:70px 0 60px 0;
  }
  .hero-glow-1{
    position:absolute;
    top:-120px;
    left:50%;
    transform:translateX(-50%);
    width:650px;
    height:420px;
    background:radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.1) 45%, transparent 70%);
    filter:blur(60px);
    pointer-events:none;
  }
  .hero-glow-2{
    position:absolute;
    bottom:-100px;
    right:10%;
    width:400px;
    height:300px;
    background:radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
    filter:blur(50px);
    pointer-events:none;
  }
  .hero-banner-inner{
    position:relative;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:22px;
    text-align:center;
    max-width:860px;
    margin:0 auto;
    z-index:2;
  }
  .hero-badge{
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:6px 18px;
    background:rgba(255,255,255,0.9);
    backdrop-filter:blur(10px);
    border:1px solid rgba(226,232,240,0.9);
    border-radius:9999px;
    font-size:0.84rem;
    font-weight:600;
    color:#4F46E5;
    box-shadow:0 4px 14px rgba(79,70,229,0.08);
  }
  .hero-badge-dot{
    width:8px;
    height:8px;
    border-radius:50%;
    background:#10B981;
    box-shadow:0 0 8px #10B981;
    animation:pulseDot 2s infinite;
  }
  @keyframes pulseDot{
    0%,100%{opacity:1; transform:scale(1);}
    50%{opacity:0.4; transform:scale(0.85);}
  }
  .hero-title{
    font-size:clamp(2.1rem, 4.2vw, 3.4rem);
    font-weight:800;
    line-height:1.15;
    color:#0F172A;
    letter-spacing:-0.03em;
  }
  .hero-title .gradient-text{
    background:linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%);
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
  }
  .hero-subtitle{
    font-size:clamp(1.05rem, 1.8vw, 1.2rem);
    color:#475569;
    max-width:620px;
    line-height:1.6;
    font-weight:400;
  }
  .hero-actions{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:14px;
    flex-wrap:wrap;
    margin-top:6px;
  }
  .btn-primary-glow{
    display:inline-flex;
    align-items:center;
    gap:8px;
    background:linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
    color:#fff !important;
    padding:14px 28px;
    border-radius:12px;
    font-weight:600;
    font-size:1rem;
    text-decoration:none;
    box-shadow:0 10px 25px -5px rgba(79,70,229,0.4);
    transition:all .25s ease;
    border:none;
  }
  .btn-primary-glow:hover{
    transform:translateY(-2px);
    box-shadow:0 14px 30px -5px rgba(79,70,229,0.55);
    background:linear-gradient(135deg, #4338CA 0%, #4F46E5 100%);
  }
  .btn-primary-glow svg{width:18px; height:18px;}
  .btn-secondary-glass{
    display:inline-flex;
    align-items:center;
    gap:8px;
    background:#FFFFFF;
    color:#334155 !important;
    border:1px solid #CBD5E1;
    padding:14px 24px;
    border-radius:12px;
    font-weight:600;
    font-size:1rem;
    text-decoration:none;
    box-shadow:0 2px 6px rgba(0,0,0,0.04);
    transition:all .2s ease;
  }
  .btn-secondary-glass:hover{
    background:#F8FAFC;
    border-color:#94A3B8;
    transform:translateY(-1px);
  }
  .hero-stats-strip{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:32px;
    margin-top:20px;
    padding:14px 28px;
    background:rgba(255,255,255,0.85);
    backdrop-filter:blur(12px);
    border:1px solid rgba(226,232,240,0.9);
    border-radius:16px;
    box-shadow:0 4px 20px -5px rgba(0,0,0,0.04);
  }
  .stat-item{
    display:flex;
    align-items:center;
    gap:10px;
    text-align:left;
  }
  .stat-icon{font-size:1.3rem;}
  .stat-item strong{display:block; font-size:0.9rem; color:#0F172A; font-weight:700;}
  .stat-item small{display:block; font-size:0.76rem; color:#64748B;}
  .stat-divider{width:1px; height:28px; background:#E2E8F0;}

  /* ---------- Trust strip ---------- */
  .trust{
    background:#FFFFFF;
    border-bottom:1px solid rgba(226,232,240,0.8);
  }
  .trust-row{
    display:flex;
    flex-wrap:wrap;
    justify-content:center;
    gap:20px 48px;
    padding-block:22px;
  }
  .trust-item{
    display:flex;
    align-items:center;
    gap:10px;
    font-size:0.92rem;
    color:#475569;
    font-weight:500;
  }
  .trust-item svg{width:18px; height:18px; color:#10B981; flex-shrink:0;}

  /* ---------- Modern Category Cards Grid ---------- */
  .category-grid{
    background:#F8FAFC;
    padding-block:48px 64px;
  }
  .card-grid{
    display:grid;
    grid-template-columns:repeat(4, 1fr);
    gap:20px;
  }
  .cat-card{
    position:relative;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
    min-height:220px;
    border-radius:20px;
    padding:24px;
    color:#FFFFFF;
    text-decoration:none;
    overflow:hidden;
    transition:all .28s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow:0 10px 25px -8px rgba(0, 0, 0, 0.12);
  }
  .cat-card::before{
    content:"";
    position:absolute;
    inset:0;
    background:radial-gradient(circle at 100% 0%, rgba(255,255,255,0.22) 0%, transparent 60%);
    pointer-events:none;
  }
  .cat-card:hover{
    transform:translateY(-6px);
    box-shadow:0 20px 35px -8px rgba(0, 0, 0, 0.22);
  }
  .cat-card.is-red{
    background:linear-gradient(145deg, #EF4444 0%, #DC2626 55%, #991B1B 100%);
  }
  .cat-card.is-blue{
    background:linear-gradient(145deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%);
  }
  .cat-card.is-navy{
    background:linear-gradient(145deg, #6366F1 0%, #4F46E5 55%, #3730A3 100%);
  }
  .cat-card.is-teal{
    background:linear-gradient(145deg, #0D9488 0%, #0F766E 55%, #115E59 100%);
  }
  .cat-card.is-disabled{cursor:default; opacity:0.8;}
  .cat-card.is-disabled:hover{transform:none; box-shadow:none;}
  .cat-card-top{
    display:flex;
    align-items:center;
    justify-content:space-between;
    width:100%;
    margin-bottom:20px;
  }
  .cat-badge{
    display:inline-flex;
    align-items:center;
    gap:6px;
    background:rgba(255,255,255,0.2);
    backdrop-filter:blur(8px);
    color:#FFFFFF;
    font-size:0.75rem;
    font-weight:700;
    padding:5px 12px;
    border-radius:9999px;
    border:1px solid rgba(255,255,255,0.28);
    letter-spacing:0.02em;
  }
  .cat-badge::before{
    content:"";
    width:6px;
    height:6px;
    border-radius:50%;
    background:#4ADE80;
    box-shadow:0 0 6px #4ADE80;
  }
  .cat-icon{
    width:42px;
    height:42px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:12px;
    background:rgba(255,255,255,0.16);
    backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,0.25);
    transition:transform .3s ease;
  }
  .cat-card:hover .cat-icon{
    transform:scale(1.1) rotate(4deg);
  }
  .cat-icon svg{width:22px; height:22px; color:#FFFFFF;}
  .cat-card-bottom{
    display:flex;
    flex-direction:column;
    gap:10px;
  }
  .cat-card h3{
    font-family:var(--sans);
    font-size:1.15rem;
    font-weight:700;
    line-height:1.35;
    color:#FFFFFF;
    margin:0;
  }
  .cat-cta-link{
    display:inline-flex;
    align-items:center;
    gap:6px;
    font-size:0.86rem;
    font-weight:600;
    color:rgba(255,255,255,0.92);
    transition:gap .2s ease;
  }
  .cat-card:hover .cat-cta-link{
    gap:10px;
    color:#FFFFFF;
  }
  .cat-cta-link svg{width:16px; height:16px; transition:transform .2s ease;}
  .cat-card:hover .cat-cta-link svg{transform:translateX(3px);}

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
    font-family:var(--display);
    font-weight:800;
    font-size:1.8rem;
    color:#4F46E5;
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

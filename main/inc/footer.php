<?php
require_once __DIR__ . '/social.php';
require_once __DIR__ . '/site_texts.php';
require_once __DIR__ . '/site_contact.php';
$socialLinks = home_social_links_fetch();
$footerTexts = site_texts_fetch();
$footerContact = site_contact_fetch();
$footerEmail = $footerContact['email'] ?? 'agamedov94@mail.ru';
$footerChatHref = !empty($footerContact['whatsapp'])
    ? whatsapp_link($footerContact['whatsapp'])
    : 'mailto:' . $footerEmail . '?subject=İmtahanVer%20—%20Sual';
?>
<footer>
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a href="/" class="brand">İmtahan<em>Ver</em></a>
      <p><?php echo htmlspecialchars(st($footerTexts, 'footer.tagline', 'Rəqəmsal imtahan hazırlıq platforması. Real sınaq sualları ilə hazırlaşın, nəticənizi anında görün.'), ENT_QUOTES, 'UTF-8'); ?></p>
      <?php if (!empty($socialLinks)): ?>
      <div class="footer-social">
        <?php foreach ($socialLinks as $link): ?>
        <a href="<?php echo htmlspecialchars($link['url'], ENT_QUOTES, 'UTF-8'); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo htmlspecialchars(social_platform_label($link['platform']), ENT_QUOTES, 'UTF-8'); ?>">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><?php echo social_platform_icon_svg($link['platform']); ?></svg>
        </a>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>
    </div>
    <div class="footer-col">
      <h4>Platforma</h4>
      <ul>
        <li><a href="/#nece-isleyir">Necə işləyir</a></li>
        <li><a href="/#fenler">Fənlər</a></li>
        <li><a href="/#suallar">Suallar</a></li>
        <li><a href="/haqqimizda">Haqqımızda</a></li>
        <li><a href="/elaqe">Əlaqə</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Hesab</h4>
      <ul>
        <li><a href="https://panel.imtahanver.online/register" target="_blank" rel="noopener noreferrer">Qeydiyyat</a></li>
        <li><a href="https://panel.imtahanver.online/login" target="_blank" rel="noopener noreferrer">Giriş</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Hüquqi</h4>
      <ul>
        <li><a href="/mexfilik-siyaseti">Məxfilik Siyasəti</a></li>
        <li><a href="/istifade-sertleri">İstifadə Şərtləri</a></li>
        <li><a href="/geri-qaytarma-qaydalari">Geri Qaytarma Qaydaları</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-collab">
    Reklam və əməkdaşlıq üçün: <a href="mailto:<?php echo htmlspecialchars($footerEmail, ENT_QUOTES, 'UTF-8'); ?>?subject=İmtahanVer%20Reklam%20və%20Əməkdaşlıq"><?php echo htmlspecialchars($footerEmail, ENT_QUOTES, 'UTF-8'); ?></a>
  </div>
  <div class="wrap footer-bottom">
    <span>© <?php echo date('Y'); ?> <?php echo htmlspecialchars(st($footerTexts, 'footer.copyright', 'İmtahanVer. Bütün hüquqlar qorunur.'), ENT_QUOTES, 'UTF-8'); ?></span>
    <span>imtahanver.online</span>
  </div>
</footer>

<a class="float-btn float-chat" href="<?php echo htmlspecialchars($footerChatHref, ENT_QUOTES, 'UTF-8'); ?>" target="_blank" rel="noopener noreferrer" aria-label="Bizimlə əlaqə saxlayın">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
</a>
<button type="button" class="float-btn float-a11y" id="a11yToggle" aria-label="Əlçatanlıq: mətni böyüt" aria-pressed="false">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none"/><path d="M4 8l8 1.5L20 8"/><path d="M12 9.5v5L9 20M12 14.5l3 5.5"/></svg>
</button>

<script>
  // Sticky header background on scroll
  var header = document.getElementById('site-header');
  function onScroll(){
    if(window.scrollY > 12){ header.classList.add('scrolled'); }
    else { header.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mobile menu toggle
  var menuToggle = document.getElementById('menuToggle');
  var mobilePanel = document.getElementById('mobilePanel');
  menuToggle.addEventListener('click', function(){
    var isOpen = mobilePanel.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    header.classList.toggle('scrolled', isOpen || window.scrollY > 12);
  });
  mobilePanel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mobilePanel.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-q');
    var answer = item.querySelector('.faq-a');
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(openItem){
        if(openItem !== item){
          openItem.classList.remove('open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
          openItem.querySelector('.faq-q').setAttribute('aria-expanded','false');
        }
      });
      if(isOpen){
        item.classList.remove('open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded','false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded','true');
      }
    });
  });

  // Decorative hero timer countdown (visual only, resets — respects reduced motion)
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timerEl = document.getElementById('mockTimer');
  if(timerEl && !reduceMotion){
    var totalSeconds = 14 * 60 + 22;
    setInterval(function(){
      totalSeconds = totalSeconds > 0 ? totalSeconds - 1 : 14 * 60 + 22;
      var m = Math.floor(totalSeconds / 60);
      var s = totalSeconds % 60;
      timerEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
  }

  // Accessibility toggle: larger, higher-contrast text (persisted per browser)
  var a11yToggle = document.getElementById('a11yToggle');
  var htmlEl = document.documentElement;
  function setA11y(on){
    htmlEl.classList.toggle('a11y-boost', on);
    a11yToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    try { localStorage.setItem('imtahanver_a11y', on ? '1' : '0'); } catch(e){}
  }
  try { if (localStorage.getItem('imtahanver_a11y') === '1') setA11y(true); } catch(e){}
  a11yToggle.addEventListener('click', function(){
    setA11y(!htmlEl.classList.contains('a11y-boost'));
  });
</script>

</body>
</html>

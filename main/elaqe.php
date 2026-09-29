<?php
require __DIR__ . '/inc/db.php';
require __DIR__ . '/inc/site_contact.php';
require __DIR__ . '/inc/recaptcha.php';

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $honeypot = trim($_POST['website'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $recaptchaToken = $_POST['g-recaptcha-response'] ?? '';

    if ($honeypot !== '') {
        header('Location: /elaqe?sent=1');
        exit;
    }

    if (recaptcha_site_key() !== '' && !recaptcha_verify($recaptchaToken)) {
        $errors['recaptcha'] = 'Zəhmət olmasa "Mən robot deyiləm" qutusunu işarələyin.';
    }

    if ($name === '') {
        $errors['name'] = 'Adınızı daxil edin.';
    } elseif (mb_strlen($name) > 255) {
        $errors['name'] = 'Ad çox uzundur.';
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Düzgün email ünvanı daxil edin.';
    }

    if ($message === '') {
        $errors['message'] = 'Mesajınızı yazın.';
    } elseif (mb_strlen($message) > 5000) {
        $errors['message'] = 'Mesaj çox uzundur.';
    }

    if (empty($errors)) {
        try {
            $pdo = imtahanver_db();
            $stmt = $pdo->prepare('INSERT INTO contact_messages (name, email, message, is_read, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())');
            $stmt->execute([$name, $email, $message]);
            header('Location: /elaqe?sent=1');
            exit;
        } catch (Throwable $e) {
            $errors['general'] = 'Mesaj göndərilmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin və ya birbaşa email vasitəsilə yazın.';
        }
    }
}

require __DIR__ . '/inc/site_texts.php';

$sent = isset($_GET['sent']);
$contact = site_contact_fetch();
$t = site_texts_fetch();
$oldName = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
$oldEmail = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
$oldMessage = htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8');

$pageTitle = 'Əlaqə — İmtahanVer';
$pageDescription = 'İmtahanVer ilə əlaqə saxlayın — sual, təklif və ya əməkdaşlıq üçün bizə yazın.';
require __DIR__ . '/inc/head.php';
?>
<?php if (recaptcha_site_key() !== ''): ?>
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
<?php endif; ?>
<body>

<?php require __DIR__ . '/inc/header.php'; ?>

<main>

  <section>
    <div class="wrap" style="padding-block:56px;">
      <div class="contact-card">
        <div class="contact-card-side">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <h2><?php echo htmlspecialchars(st($t, 'contact.heading', 'Bizimlə əlaqə saxlayın'), ENT_QUOTES, 'UTF-8'); ?></h2>
          <p><?php echo htmlspecialchars(st($t, 'contact.subtitle', 'Sualınız, təklifiniz və ya əməkdaşlıq istəyiniz var? Formu doldurun, ya da birbaşa aşağıdakı kanallardan yazın.'), ENT_QUOTES, 'UTF-8'); ?></p>

          <div class="contact-info-list">
            <div class="contact-info-item">
              <div class="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
              </div>
              <div>
                <h4>Email</h4>
                <a href="mailto:<?php echo htmlspecialchars($contact['email'] ?? '', ENT_QUOTES, 'UTF-8'); ?>"><?php echo htmlspecialchars($contact['email'] ?? '', ENT_QUOTES, 'UTF-8'); ?></a>
              </div>
            </div>

            <?php if (!empty($contact['phone'])): ?>
            <div class="contact-info-item">
              <div class="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 3a2 2 0 0 1-.5 2.1L8 10.1a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c1 .3 2 .5 3 .7a2 2 0 0 1 1.6 2z"/></svg>
              </div>
              <div>
                <h4>Telefon</h4>
                <a href="tel:<?php echo htmlspecialchars(preg_replace('/\s+/', '', $contact['phone']), ENT_QUOTES, 'UTF-8'); ?>"><?php echo htmlspecialchars($contact['phone'], ENT_QUOTES, 'UTF-8'); ?></a>
              </div>
            </div>
            <?php endif; ?>

            <?php if (!empty($contact['whatsapp'])): ?>
            <div class="contact-info-item">
              <div class="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l-3 1 1-3a8 8 0 1 1 2 2z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>
              </div>
              <div>
                <h4>WhatsApp</h4>
                <a href="<?php echo htmlspecialchars(whatsapp_link($contact['whatsapp']), ENT_QUOTES, 'UTF-8'); ?>" target="_blank" rel="noopener noreferrer"><?php echo htmlspecialchars($contact['whatsapp'], ENT_QUOTES, 'UTF-8'); ?></a>
              </div>
            </div>
            <?php endif; ?>
          </div>
        </div>

        <div class="contact-card-form">
          <h3><?php echo htmlspecialchars(st($t, 'contact.form_heading', 'Mesaj yazın'), ENT_QUOTES, 'UTF-8'); ?></h3>

          <form method="post" action="/elaqe" novalidate>
            <div class="honeypot-field" aria-hidden="true">
              <label for="website">Sahə boş qalmalıdır</label>
              <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
            </div>

            <div class="form-field">
              <label for="name">Ad Soyad</label>
              <input type="text" id="name" name="name" value="<?php echo $oldName; ?>" required>
              <?php if (!empty($errors['name'])): ?><div class="form-field-error"><?php echo htmlspecialchars($errors['name'], ENT_QUOTES, 'UTF-8'); ?></div><?php endif; ?>
            </div>

            <div class="form-field">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" value="<?php echo $oldEmail; ?>" required>
              <?php if (!empty($errors['email'])): ?><div class="form-field-error"><?php echo htmlspecialchars($errors['email'], ENT_QUOTES, 'UTF-8'); ?></div><?php endif; ?>
            </div>

            <div class="form-field">
              <label for="message">Mesajınız</label>
              <textarea id="message" name="message" required><?php echo $oldMessage; ?></textarea>
              <?php if (!empty($errors['message'])): ?><div class="form-field-error"><?php echo htmlspecialchars($errors['message'], ENT_QUOTES, 'UTF-8'); ?></div><?php endif; ?>
            </div>

            <?php if (recaptcha_site_key() !== ''): ?>
            <div class="form-field">
              <div class="g-recaptcha" data-sitekey="<?php echo htmlspecialchars(recaptcha_site_key(), ENT_QUOTES, 'UTF-8'); ?>"></div>
              <?php if (!empty($errors['recaptcha'])): ?><div class="form-field-error"><?php echo htmlspecialchars($errors['recaptcha'], ENT_QUOTES, 'UTF-8'); ?></div><?php endif; ?>
            </div>
            <?php endif; ?>

            <button type="submit" class="btn btn-card-blue" style="width:100%;">Mesajı göndər</button>
          </form>
        </div>
      </div>
    </div>
  </section>

</main>

<?php if ($sent || !empty($errors['general'])): ?>
<div class="alert-modal-overlay" id="alertModal">
  <div class="alert-modal">
    <?php if ($sent): ?>
      <div class="alert-modal-icon is-success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h3>Göndərildi!</h3>
      <p>Mesajınız uğurla göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.</p>
    <?php else: ?>
      <div class="alert-modal-icon is-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
      <h3>Xəta baş verdi</h3>
      <p><?php echo htmlspecialchars($errors['general'], ENT_QUOTES, 'UTF-8'); ?></p>
    <?php endif; ?>
    <button type="button" class="btn btn-card-blue" id="alertModalClose">Bağla</button>
  </div>
</div>
<script>
  (function(){
    var overlay = document.getElementById('alertModal');
    var closeBtn = document.getElementById('alertModalClose');
    requestAnimationFrame(function(){ overlay.classList.add('is-open'); });
    function closeModal(){
      overlay.classList.remove('is-open');
      if (window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.delete('sent');
        window.history.replaceState({}, '', url.toString());
      }
    }
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
  })();
</script>
<?php endif; ?>

<?php require __DIR__ . '/inc/footer.php'; ?>

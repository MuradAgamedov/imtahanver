// Navbar scroll shadow
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// FAQ accordion
document.querySelectorAll('.faq__item').forEach(item => {
  item.querySelector('.faq__q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Counter animation
function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();
  const isLarge = target >= 10000;
  const step = ts => {
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(ease * target);
    if (isLarge) {
      el.textContent = current >= 1000000
        ? (current / 1000000).toFixed(1) + 'M+'
        : current >= 1000
        ? Math.floor(current / 1000) + 'K+'
        : current;
    } else {
      if (target === 100) el.textContent = current + '%';
      else if (target === 24) el.textContent = current + '/7';
      else if (target === 1) el.textContent = '№' + current;
      else el.textContent = current + '+';
    }
    if (progress < 1) requestAnimationFrame(step);
    else {
      if (target === 100) el.textContent = '100%';
      else if (target === 1000) el.textContent = '1000+';
      else if (target === 24) el.textContent = '24/7';
      else if (target === 1) el.textContent = '№1';
    }
  };
  requestAnimationFrame(step);
}

const statsSection = document.querySelector('.section--dark');
let counted = false;
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    document.querySelectorAll('.stat__num[data-target]').forEach(el => {
      animateCounter(el, +el.dataset.target);
    });
  }
}, { threshold: 0.3 });
if (statsSection) observer.observe(statsSection);

// Smooth reveal on scroll
const reveals = document.querySelectorAll('.card, .feature, .step, .testimonial');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = e.target.style.transform.replace('translateY(24px)', 'translateY(0)');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity .5s ease ${i * 0.06}s, transform .5s ease ${i * 0.06}s, box-shadow .22s, border-color .22s`;
  revealObserver.observe(el);
});

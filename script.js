const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const navLinks = [...document.querySelectorAll('.desktop-nav .nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
const bookingForm = document.querySelector('#booking-form');
const dateInput = document.querySelector('input[name="date"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 20);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

function closeMobileMenu() {
  mobileNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
}

menuToggle.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobileNav.classList.contains('open')) {
    closeMobileMenu();
    menuToggle.focus();
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMobileMenu();
}, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach(section => sectionObserver.observe(section));

if (dateInput) {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  dateInput.min = localDate;
}

function showFormMessage(message, isError = false) {
  const status = bookingForm.querySelector('.form-status');
  status.textContent = message;
  status.classList.toggle('error', isError);
}

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  const requiredFields = [...bookingForm.querySelectorAll('[required]')];
  const invalid = requiredFields.find(field => !field.value.trim());

  if (invalid) {
    showFormMessage('Пожалуйста, заполните все обязательные поля.', true);
    invalid.setAttribute('aria-invalid', 'true');
    invalid.focus();
    return;
  }

  const phone = bookingForm.elements.phone.value.replace(/[^\d+]/g, '');
  if (phone.replace(/\D/g, '').length < 8) {
    showFormMessage('Проверьте номер телефона.', true);
    bookingForm.elements.phone.setAttribute('aria-invalid', 'true');
    bookingForm.elements.phone.focus();
    return;
  }

  if (dateInput.value < dateInput.min) {
    showFormMessage('Выберите сегодняшнюю или будущую дату.', true);
    dateInput.setAttribute('aria-invalid', 'true');
    dateInput.focus();
    return;
  }

  requiredFields.forEach(field => field.removeAttribute('aria-invalid'));
  showFormMessage('Спасибо! Заявка принята — мы свяжемся с вами для подтверждения.');
  bookingForm.reset();
  dateInput.min = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
});

bookingForm.querySelectorAll('input, select').forEach(field => {
  field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
  field.addEventListener('change', () => field.removeAttribute('aria-invalid'));
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

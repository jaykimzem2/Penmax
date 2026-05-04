// Main JavaScript for Penmax Herbal Clinic
document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky Navbar ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── Mobile Menu ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu  = document.getElementById('closeMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => { mobileMenu.style.display = 'block'; document.body.style.overflow = 'hidden'; });
    closeMenu && closeMenu.addEventListener('click', closeMob);
    mobileMenu.addEventListener('click', e => { if (e.target === mobileMenu) closeMob(); });
  }
  function closeMob() { if (mobileMenu) { mobileMenu.style.display = 'none'; document.body.style.overflow = ''; } }

  // ── Scroll animate-in ──
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

  // ── Product Category Tabs ──
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // ── Cart Counter (simple localStorage) ──
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('penmaxCart') || '[]');
    const counts = document.querySelectorAll('.cart-count');
    counts.forEach(c => { c.textContent = cart.reduce((s, i) => s + (i.qty || 1), 0); });
  }
  updateCartCount();

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      const name  = card.querySelector('.product-name')?.textContent || 'Product';
      const price = card.querySelector('.product-price')?.textContent || '';
      const img   = card.querySelector('img')?.src || '';
      const cart  = JSON.parse(localStorage.getItem('penmaxCart') || '[]');
      const exist = cart.find(i => i.name === name);
      if (exist) exist.qty = (exist.qty || 1) + 1;
      else cart.push({ name, price, img, qty: 1 });
      localStorage.setItem('penmaxCart', JSON.stringify(cart));
      updateCartCount();
      showToast(`${name} added to cart!`);
    });
  });

  // ── Toast Notification ──
  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '100px', right: '24px', zIndex: '9999',
      background: '#1a4d2e', color: '#fff', padding: '12px 22px',
      borderRadius: '8px', fontSize: '.9rem', boxShadow: '0 4px 20px rgba(0,0,0,.2)',
      transform: 'translateY(20px)', opacity: '0', transition: 'all .3s ease'
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
    setTimeout(() => {
      t.style.opacity = '0'; t.style.transform = 'translateY(20px)';
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  // ── Newsletter Form ──
  const nlForm = document.querySelector('.newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      showToast('Thank you for subscribing!');
      nlForm.reset();
    });
  }

  // ── Booking Form ──
  const bookForm = document.getElementById('bookingForm');
  if (bookForm) {
    bookForm.addEventListener('submit', e => {
      e.preventDefault();
      showToast('Booking submitted! We will confirm within 1 hour.');
      bookForm.reset();
    });
  }

  // ── Smooth active link ──
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

});

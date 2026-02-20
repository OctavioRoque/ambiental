

// --- Navbar scroll shadow ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 10);
});

// --- Hamburger menu ---
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

// --- Active nav link ---
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

// --- Scroll reveal ---
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .timeline-item').forEach(el => {
  revealObserver.observe(el);
});

// --- Contador animado en stats ---
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 1500;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target).toLocaleString('es-MX');
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.done) {
      entry.target.dataset.done = true;
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-count]').forEach(el => {
  counterObserver.observe(el);
});


const SUPABASE_URL = 'https://gmozqaccfkzzwmxzkkkr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdtb3pxYWNjZmt6endteHpra2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDAxMTcsImV4cCI6MjA4NzExNjExN30.M6e1sV4xFpd3LXaTMTUkzYBYhARIw_Kp4XCQwgepkuw';
const BUCKET = 'agenda21-docs';

function getClient() {
  if (!window.supabase) return null;
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// --- Descargar archivo desde Supabase Storage ---
async function downloadFile(fileName, displayName) {
  const sb = getClient();
  if (!sb) { showToast('Supabase no disponible', 'error'); return; }

  showToast(`Descargando ${displayName}...`);

  const { data, error } = await sb.storage.from(BUCKET).download(fileName);
  if (error) {
    showToast('Error al descargar', 'error');
    return;
  }

  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = displayName;
  a.click();
  URL.revokeObjectURL(url);
  showToast('¡Descargado!', 'success');
}

// --- Subir archivo a Supabase Storage ---
async function uploadFile(file, path) {
  const sb = getClient();
  if (!sb) return { error: 'Supabase no disponible' };

  const filePath = path || `uploads/${Date.now()}_${file.name}`;
  const { data, error } = await sb.storage.from(BUCKET).upload(filePath, file);
  return { data, error };
}

// Exponer al HTML
window.downloadFile = downloadFile;
window.uploadFile = uploadFile;

// --- Toast simple ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toasts';
    container.style.cssText = `
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      display: flex; flex-direction: column; gap: 0.5rem;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }

  const bg = type === 'success' ? '#4e7a4e' : type === 'error' ? '#7a3030' : '#2e4a2e';
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${bg}; color: #f4efe6;
    padding: 0.65rem 1.2rem; border-radius: 8px;
    font-size: 0.875rem; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    transform: translateX(110%); transition: transform 0.35s ease;
    max-width: 300px;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });

  setTimeout(() => {
    toast.style.transform = 'translateX(110%)';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

window.showToast = showToast;

// --- Fade in al cargar página ---
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.35s ease';
window.addEventListener('load', () => { document.body.style.opacity = '1'; });

// --- Links con fade out ---
document.querySelectorAll('a[href$=".html"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href.startsWith('http')) {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => { location.href = href; }, 300);
    }
  });
});

// --- Copiar enlace ---
function copyLink() {
  navigator.clipboard.writeText(location.href).then(() => {
    showToast('Enlace copiado ✓', 'success');
  });
}
window.copyLink = copyLink;
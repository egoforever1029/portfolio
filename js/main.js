// -------------------------------------------------------------
// Портфолио IT-специалиста Грачёва Кирилла
// Логика интерактива: частицы, фильтрация, модальные окна, форма
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initNav();
  initSkillFilters();
  initContactForm();
  initResumeTriggers();
});

// 1. Анимированный холст с частицами и созвездиями
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 14000), 75);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.6 + 0.6;
      this.color = Math.random() > 0.4 ? 'rgba(0, 229, 255,' : 'rgba(168, 85, 247,';
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color} ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// 2. Мобильная навигация и активный пункт при скролле
function initNav() {
  const toggle = document.getElementById('mobile-toggle');
  const links = document.getElementById('nav-links');
  const navItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        links.classList.remove('open');
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

// 3. Интерактивная фильтрация стека технологий
function initSkillFilters() {
  const filterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// 4. Модальные окна проектов
function openProjectModal(type) {
  const modalId = type === 'space' ? 'modal-space' : 'modal-machinery';
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Закрытие при клике по фону
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Закрытие по Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// 5. Триггеры резюме
function initResumeTriggers() {
  const openBtn = document.getElementById('open-resume-btn');
  const heroBtn = document.getElementById('hero-resume-trigger');

  const openResume = () => {
    const modal = document.getElementById('modal-resume');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  if (openBtn) openBtn.addEventListener('click', openResume);
  if (heroBtn) heroBtn.addEventListener('click', openResume);
}

// 6. Форма обратной связи для работодателя
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const contact = document.getElementById('form-contact').value.trim();
    const msg = document.getElementById('form-msg').value.trim();

    if (!name || !contact || !msg) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Отправка...';

    // Сохранение в локальное хранилище
    try {
      const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      messages.push({ name, contact, msg, date: new Date().toISOString() });
      localStorage.setItem('portfolio_messages', JSON.stringify(messages));
    } catch(err) {}

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Отправлено!';
      
      status.className = 'form-status success';
      status.innerHTML = `Спасибо, <strong>${name}</strong>! Ваше сообщение принято. Я свяжусь с вами по контакту: <code>${contact}</code>.`;

      form.reset();

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fa-regular fa-paper-plane"></i> <span>Отправить сообщение</span>';
      }, 4000);
    }, 600);
  });
}

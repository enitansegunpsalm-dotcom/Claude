/* =============================================
   NEXUS — script.js
   Particle system, custom cursor, loader,
   scroll animations, terminal, counters, form
   ============================================= */

'use strict';

// ─── LOADER ───────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loaderFill');
  const text   = document.getElementById('loaderText');

  const steps = [
    [0,   'INITIALIZING...'],
    [20,  'LOADING ASSETS...'],
    [45,  'COMPILING MODULES...'],
    [70,  'CONNECTING SYSTEMS...'],
    [90,  'RENDERING INTERFACE...'],
    [100, 'READY.'],
  ];

  let i = 0;
  function step() {
    if (i >= steps.length) {
      setTimeout(() => loader.classList.add('hidden'), 400);
      return;
    }
    const [pct, label] = steps[i++];
    fill.style.width = pct + '%';
    text.textContent = label;
    setTimeout(step, i === steps.length ? 600 : 320 + Math.random() * 180);
  }
  step();
})();


// ─── PARTICLE CANVAS ──────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.4 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.4 + 0.05;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repel
      const dx  = this.x - mouse.x;
      const dy  = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        this.x += dx / dist * force * 1.5;
        this.y += dy / dist * force * 1.5;
      }

      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59,130,246,${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.floor((W * H) / 10000);
    particles = Array.from({ length: Math.min(count, 120) }, () => new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / 130) * 0.12;
          ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();

  window.addEventListener('resize', () => { resize(); initParticles(); });
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
})();


// ─── CUSTOM CURSOR ────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  let tx = 0, ty = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  function animTrail() {
    tx += (cx - tx) * 0.14;
    ty += (cy - ty) * 0.14;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();
})();


// ─── NAV SCROLL ───────────────────────────────
(function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  document.getElementById('ctaBtn').addEventListener('click', () => {
    document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('contactBtn').addEventListener('click', () => {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });
})();


// ─── SCROLL REVEAL ────────────────────────────
(function initReveal() {
  const targets = [
    ...document.querySelectorAll('.project-card'),
    ...document.querySelectorAll('.skill-group'),
    ...document.querySelectorAll('.about-grid'),
    ...document.querySelectorAll('.contact-inner'),
    document.querySelector('.section-header'),
  ].filter(Boolean);

  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));
})();


// ─── COUNTER ANIMATION ────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  let started = false;

  function startCounters() {
    if (started) return;
    started = true;
    counters.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  const heroSection = document.querySelector('.hero-stats');
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { startCounters(); io.disconnect(); }
  }, { threshold: 0.5 });
  if (heroSection) io.observe(heroSection);
})();


// ─── SKILL BAR ANIMATION ──────────────────────
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');

  fills.forEach(fill => {
    const target = fill.dataset.target;
    const nameEl = fill.closest('.skill-item').querySelector('.skill-name');
    if (nameEl) nameEl.dataset.pct = target + '%';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill   = e.target;
        const target = fill.dataset.target;
        setTimeout(() => { fill.style.width = target + '%'; }, 200);
        io.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(f => io.observe(f));
})();


// ─── TERMINAL TYPEWRITER ──────────────────────
(function initTerminal() {
  const cmdEl    = document.getElementById('termCmd');
  const outputEl = document.getElementById('termOutput');
  if (!cmdEl || !outputEl) return;

  const sequences = [
    {
      cmd: 'whoami',
      lines: [
        { cls: 'info',    text: 'Senior Full Stack Engineer' },
        { cls: 'success', text: '10 years · 127 projects shipped' },
        { cls: '',        text: 'Location: Your tech firm' },
      ]
    },
    {
      cmd: 'ls ./stack',
      lines: [
        { cls: 'info', text: 'react/   next/   node/   python/' },
        { cls: 'info', text: 'postgres/  mongodb/  redis/  aws/' },
        { cls: 'info', text: 'docker/  k8s/  graphql/  typescript/' },
      ]
    },
    {
      cmd: 'git log --oneline -5',
      lines: [
        { cls: 'success', text: 'a3f9c1e  feat: payment webhook system' },
        { cls: 'success', text: 'b82d3aa  fix: race condition in auth flow' },
        { cls: 'success', text: 'c91fa4d  chore: upgrade k8s to 1.29' },
        { cls: 'success', text: 'd7e1b2c  perf: 3x query optimization' },
        { cls: 'success', text: 'e5c8901  feat: real-time collab engine' },
      ]
    },
    {
      cmd: 'npm run build',
      lines: [
        { cls: 'info',    text: '> nexus@2.0.1 build' },
        { cls: '',        text: 'Compiling...' },
        { cls: 'success', text: '✓ Build complete in 1.2s' },
        { cls: 'success', text: '✓ 0 errors · 0 warnings' },
        { cls: 'warn',    text: 'Bundle: 87kb gzipped' },
      ]
    },
  ];

  let seqIdx = 0;

  function typeCmd(str, cb) {
    cmdEl.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
      cmdEl.textContent += str[i++];
      if (i >= str.length) { clearInterval(iv); setTimeout(cb, 400); }
    }, 55);
  }

  function showOutput(lines, cb) {
    outputEl.innerHTML = '';
    let i = 0;
    function next() {
      if (i >= lines.length) { setTimeout(cb, 1200); return; }
      const div = document.createElement('div');
      div.className = lines[i].cls || '';
      div.textContent = lines[i].text;
      outputEl.appendChild(div);
      i++;
      setTimeout(next, 130);
    }
    next();
  }

  function runSequence() {
    const seq = sequences[seqIdx % sequences.length];
    seqIdx++;
    typeCmd(seq.cmd, () => {
      showOutput(seq.lines, () => {
        setTimeout(runSequence, 1800);
      });
    });
  }

  // Start when in view
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { runSequence(); io.disconnect(); }
  }, { threshold: 0.3 });
  const term = document.querySelector('.terminal');
  if (term) io.observe(term);
})();


// ─── CONTACT FORM ─────────────────────────────
(function initForm() {
  const btn    = document.getElementById('sendBtn');
  const status = document.getElementById('formStatus');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const name  = document.getElementById('nameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const msg   = document.getElementById('msgInput').value.trim();

    if (!name || !email || !msg) {
      status.style.color = '#ef4444';
      status.textContent = 'ALL FIELDS REQUIRED.';
      setTimeout(() => { status.textContent = ''; }, 3000);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.style.color = '#ef4444';
      status.textContent = 'INVALID EMAIL ADDRESS.';
      setTimeout(() => { status.textContent = ''; }, 3000);
      return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Message Sent';
      status.style.color = '#22c55e';
      status.textContent = 'RECEIVED. I\'LL RESPOND WITHIN 24 HOURS.';
      document.getElementById('nameInput').value  = '';
      document.getElementById('emailInput').value = '';
      document.getElementById('msgInput').value   = '';
      setTimeout(() => {
        btn.textContent = 'Send Message →';
        btn.disabled = false;
        status.textContent = '';
      }, 4000);
    }, 1400);
  });
})();


// ─── PROJECT CARD TILT ────────────────────────
(function initTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        translateY(-6px)
        rotateX(${(-y * 6).toFixed(2)}deg)
        rotateY(${(x * 6).toFixed(2)}deg)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease, border-color 0.3s, box-shadow 0.3s';
    });
  });
})();


// ─── NAV SMOOTH SCROLL ────────────────────────
(function initNavLinks() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

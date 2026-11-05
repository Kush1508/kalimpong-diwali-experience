/**
 * KALIMPONG DIWALI EXPERIENCE - CORE CONTROLLER
 * 
 * Features:
 * 1. High-Performance Video Scroll Scrubbing with Lerp Smoothing
 * 2. Story Chapter Milestones synchronized to 4K Video Playback
 * 3. 3D Spatial Holographic Card Parallax & Interactive Hotspots
 * 4. Physics-based Interactive Fireworks & Sky Lanterns Canvas
 * 5. Procedural Web Audio API Himalayan Soundscape (Wind, Temple Bells, Fireworks)
 * 6. Interactive Diya Lighting & Community Wishing Wall
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeroFrameScrubber();
  initSpatialShowcase();
  initInteractiveFireworks();
  initDiyaWishingWall();
  initWebAudioSoundscape();
  initKeyboardShortcuts();
});

/* ===================================================================
   1. NAVIGATION & GENERAL UI
   =================================================================== */
function initNavigation() {
  const nav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active link highlighting
    const scrollPos = window.scrollY + 200;
    document.querySelectorAll('section, .hero-scroll-container').forEach(sec => {
      if (sec.id) {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sec.id}`);
          });
        }
      }
    });
  }, { passive: true });

  // Fullscreen toggle
  const fsBtn = document.getElementById('fullscreen-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        fsBtn.classList.add('active');
      } else {
        document.exitFullscreen().catch(() => {});
        fsBtn.classList.remove('active');
      }
    });
  }
}

/* ===================================================================
   2. PURE 60FPS FRAME-BY-FRAME HERO VIDEO SCROLL ENGINE (CANVAS)
   =================================================================== */
function initHeroFrameScrubber() {
  const canvas = document.getElementById('hero-frame-canvas');
  const container = document.getElementById('hero-scroll-container');
  const viewport = container ? container.querySelector('.hero-sticky-viewport') : null;
  const pill = document.getElementById('hero-scroll-pill');

  if (!canvas || !container || !viewport) return;
  const ctx = canvas.getContext('2d');

  const TOTAL_FRAMES = 300;
  const frameImages = new Array(TOTAL_FRAMES);

  let currentRenderedIndex = -1;
  let currentFrameProgress = 0;
  let targetFrameProgress = 0;

  function getFramePath(idx) {
    const pad = String(idx).padStart(4, '0');
    return `assets/frames/frame_${pad}.jpg`;
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(Math.round(currentFrameProgress));
  }

  window.addEventListener('resize', resizeCanvas);

  function drawFrame(idx) {
    if (idx < 0) idx = 0;
    if (idx >= TOTAL_FRAMES) idx = TOTAL_FRAMES - 1;

    // Find closest loaded frame if target frame is pending
    let img = frameImages[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      let found = false;
      // Search backward
      for (let b = idx - 1; b >= 0; b--) {
        if (frameImages[b] && frameImages[b].complete && frameImages[b].naturalWidth > 0) {
          img = frameImages[b];
          found = true;
          break;
        }
      }
      // Search forward if not found backward
      if (!found) {
        for (let f = idx + 1; f < TOTAL_FRAMES; f++) {
          if (frameImages[f] && frameImages[f].complete && frameImages[f].naturalWidth > 0) {
            img = frameImages[f];
            break;
          }
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Fit whole video frame onto screen (contain: no cropping of fireworks or diorama base)
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = w / h;

    let drawW, drawH, drawX, drawY;

    if (canvasAspect > imgAspect) {
      // Screen is wider than 16:9
      drawH = h;
      drawW = h * imgAspect;
      drawX = (w - drawW) / 2;
      drawY = 0;
    } else {
      // Screen is narrower than 16:9
      drawW = w;
      drawH = w / imgAspect;
      drawX = 0;
      drawY = (h - drawH) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    currentRenderedIndex = idx;
  }

  // 1. Load First Frame IMMEDIATELY so screen is NEVER blank
  const firstFrame = new Image();
  firstFrame.onload = () => {
    frameImages[0] = firstFrame;
    resizeCanvas();
    drawFrame(0);
  };
  firstFrame.src = getFramePath(0);
  if (firstFrame.complete && firstFrame.naturalWidth > 0) {
    firstFrame.onload();
  }

  // 2. Preload remaining frames progressively in background
  function preloadRemainingFrames() {
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = () => {
        frameImages[i] = img;
        // If user is currently stopped at this frame index, paint it immediately
        if (Math.round(targetFrameProgress) === i) {
          drawFrame(i);
        }
      };
      img.src = getFramePath(i);
    }
  }

  // Start preloading immediately
  setTimeout(preloadRemainingFrames, 20);

  // Scroll tracking with active pinning to eliminate any empty gap or slide-away
  function onScroll() {
    const rect = container.getBoundingClientRect();
    const scrollDist = -rect.top;
    const maxScroll = container.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    // Pinning enforcement: locks viewport in fixed position while scrolling through video
    if (rect.top <= 0 && scrollDist < maxScroll) {
      viewport.style.position = 'fixed';
      viewport.style.top = '0px';
      viewport.style.left = '0px';
      viewport.style.width = '100%';
      viewport.style.height = '100vh';
      viewport.style.zIndex = '5';
    } else if (scrollDist >= maxScroll) {
      // Lock at the bottom of hero track when video reaches the end
      viewport.style.position = 'absolute';
      viewport.style.top = maxScroll + 'px';
      viewport.style.left = '0px';
      viewport.style.width = '100%';
      viewport.style.height = '100vh';
      viewport.style.zIndex = '1';
    } else {
      // Above the hero section
      viewport.style.position = 'absolute';
      viewport.style.top = '0px';
      viewport.style.left = '0px';
      viewport.style.width = '100%';
      viewport.style.height = '100vh';
      viewport.style.zIndex = '1';
    }

    const progress = Math.max(0, Math.min(1, scrollDist / maxScroll));
    targetFrameProgress = progress * (TOTAL_FRAMES - 1);

    // Instant draw on scroll event
    const targetIdx = Math.round(targetFrameProgress);
    drawFrame(targetIdx);

    if (pill) {
      pill.classList.toggle('hidden', progress > 0.04);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth render loop for interpolation when scrolling stops
  function renderLoop() {
    const diff = targetFrameProgress - currentFrameProgress;
    if (Math.abs(diff) > 0.05) {
      currentFrameProgress += diff * 0.4;
      const targetIdx = Math.round(currentFrameProgress);
      if (targetIdx !== currentRenderedIndex) {
        drawFrame(targetIdx);
      }
    }
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
  resizeCanvas();
  onScroll(); // initial pin and draw call
}

/* ===================================================================
   4. SECTION 2: 3D SPATIAL UI PARALLAX & HOTSPOTS
   =================================================================== */
function initSpatialShowcase() {
  const card = document.getElementById('spatial-viewer-card');
  const hotspots = document.querySelectorAll('.hotspot-point');
  const featurePills = document.querySelectorAll('.feature-pill-card');

  if (card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotY = (x / (rect.width / 2)) * 8; // degrees
      const rotX = -(y / (rect.height / 2)) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // Hotspots click sync
  hotspots.forEach(spot => {
    spot.addEventListener('click', () => {
      const targetId = spot.getAttribute('data-target-pill');
      featurePills.forEach(pill => {
        pill.classList.toggle('selected', pill.id === targetId);
      });
      // Play soft bell chime
      playTempleBellNote(660);
    });
  });

  featurePills.forEach(pill => {
    pill.addEventListener('click', () => {
      featurePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      playTempleBellNote(540);
    });
  });

  // Working Google Search Buttons audio interaction
  const glassButtons = document.querySelectorAll('.spatial-glass-bar .glass-bar-item');
  glassButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playTempleBellNote(880);
    });
  });
}

/* ===================================================================
   5. SECTION 3: INTERACTIVE FIREWORKS & SKY LANTERNS CANVAS
   =================================================================== */
function initInteractiveFireworks() {
  const canvas = document.getElementById('fireworks-interactive-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let currentType = 'willow'; // 'willow', 'peony', 'lantern'
  let currentColor = '#ffb830';
  let isAutoBarrage = false;
  let autoTimer = null;

  const colorMap = {
    gold: '#ffb830',
    amber: '#ff6b35',
    purple: '#b794f6',
    emerald: '#10b981'
  };

  // UI buttons
  document.querySelectorAll('[data-firework-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-firework-type]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.getAttribute('data-firework-type');
    });
  });

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const c = dot.getAttribute('data-color');
      currentColor = colorMap[c] || '#ffb830';
    });
  });

  const autoBtn = document.getElementById('auto-barrage-btn');
  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      isAutoBarrage = !isAutoBarrage;
      autoBtn.classList.toggle('active', isAutoBarrage);
    });
  }

  // Particle and Lantern Arrays
  const particles = [];
  const rockets = [];
  const lanterns = [];

  class Rocket {
    constructor(x, y, targetY, color, type) {
      this.x = x;
      this.y = y;
      this.targetY = targetY;
      this.color = color;
      this.type = type;
      this.speed = Math.random() * 3 + 8;
      this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.15;
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.trail = [];
    }

    update() {
      this.trail.push({ x: this.x, y: this.y, alpha: 1 });
      if (this.trail.length > 7) this.trail.shift();

      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.08; // gravity slowing rocket

      return (this.vy >= 0 || this.y <= this.targetY);
    }

    draw() {
      this.trail.forEach((t, i) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2 * (i / this.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 230, 150, ${t.alpha * 0.7})`;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    explode() {
      // Trigger synthesized explosion pop
      triggerFireworkPopSound();

      const count = this.type === 'willow' ? 90 : 65;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (this.type === 'willow') ? (Math.random() * 4 + 1.5) : (Math.random() * 6 + 2);
        particles.push(new FireworkParticle(this.x, this.y, angle, speed, this.color, this.type));
      }
    }
  }

  class FireworkParticle {
    constructor(x, y, angle, speed, color, type) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.color = color;
      this.type = type;
      this.alpha = 1;
      this.decay = (type === 'willow') ? (Math.random() * 0.012 + 0.007) : (Math.random() * 0.02 + 0.015);
      this.gravity = (type === 'willow') ? 0.06 : 0.09;
      this.drag = 0.96;
      this.trail = [];
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 4) this.trail.shift();

      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      return this.alpha <= 0;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.type === 'willow' ? 2.2 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  class SkyLantern {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vy = -(Math.random() * 0.9 + 0.6);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.swingPhase = Math.random() * Math.PI * 2;
      this.swingSpeed = Math.random() * 0.03 + 0.02;
      this.size = Math.random() * 8 + 14;
      this.alpha = 1;
    }

    update() {
      this.swingPhase += this.swingSpeed;
      this.x += this.vx + Math.sin(this.swingPhase) * 0.4;
      this.y += this.vy;
      if (this.y < 80) {
        this.alpha -= 0.005;
      }
      return this.alpha <= 0 || this.y < -30;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);

      // Warm glow
      const grad = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.size * 2);
      grad.addColorStop(0, 'rgba(255, 235, 160, 0.9)');
      grad.addColorStop(0.4, 'rgba(255, 140, 40, 0.4)');
      grad.addColorStop(1, 'rgba(255, 100, 20, 0)');

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Lantern body (rounded lantern silhouette)
      ctx.fillStyle = 'rgba(255, 200, 110, 0.85)';
      ctx.beginPath();
      ctx.roundRect(this.x - this.size * 0.5, this.y - this.size * 0.7, this.size, this.size * 1.3, 4);
      ctx.fill();

      // Flame core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y + this.size * 0.35, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function launchFirework(x, y) {
    if (currentType === 'lantern') {
      lanterns.push(new SkyLantern(x, canvas.height - 20));
      playTempleBellNote(880);
    } else {
      const targetY = y || (canvas.height * (Math.random() * 0.4 + 0.15));
      const startX = x || (canvas.width * (Math.random() * 0.8 + 0.1));
      rockets.push(new Rocket(startX, canvas.height - 10, targetY, currentColor, currentType));
    }
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    launchFirework(x, y);
  });

  // Instant touch response on smartphones
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      launchFirework(x, y);
    }
  }, { passive: true });

  // Interactive 3D Parallax Tilt for the Kalimpong 3D Model background
  const container = canvas.parentElement;
  const modelBg = document.getElementById('fireworks-model-bg');
  if (container && modelBg) {
    const applyParallax = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const xPercent = (clientX - rect.left) / rect.width - 0.5;
      const yPercent = (clientY - rect.top) / rect.height - 0.5;
      
      const tiltX = -yPercent * 7;
      const tiltY = xPercent * 9;
      const shiftX = xPercent * -14;
      const shiftY = yPercent * -8;
      
      modelBg.style.transform = `scale(1.05) translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    };

    container.addEventListener('mousemove', (e) => {
      applyParallax(e.clientX, e.clientY);
    });

    container.addEventListener('mouseleave', () => {
      modelBg.style.transform = 'scale(1.03) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
    });

    container.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        applyParallax(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  // Animation Loop
  function loop() {
    // Clear with destination-out so particle trails fade gracefully without blacking out the 3D model background
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    // Auto Barrage
    if (isAutoBarrage && Math.random() < 0.04) {
      const rx = Math.random() * (canvas.width - 100) + 50;
      const ry = Math.random() * (canvas.height * 0.4) + 60;
      launchFirework(rx, ry);
    }

    // Update rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.draw();
      if (r.update()) {
        r.explode();
        rockets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.draw();
      if (p.update()) {
        particles.splice(i, 1);
      }
    }

    // Update lanterns
    for (let i = lanterns.length - 1; i >= 0; i--) {
      const l = lanterns[i];
      l.draw();
      if (l.update()) {
        lanterns.splice(i, 1);
      }
    }

    requestAnimationFrame(loop);
  }

  // Pre-seed 3 lanterns
  for (let i = 0; i < 3; i++) {
    lanterns.push(new SkyLantern(Math.random() * canvas.width, canvas.height * 0.7 - i * 80));
  }

  loop();
}

/* ===================================================================
   6. SECTION 5: VIRTUAL DIYA WISHING WALL
   =================================================================== */
function initDiyaWishingWall() {
  const form = document.getElementById('diya-wish-form');
  const countBadge = document.getElementById('diya-count-badge');
  const diyaCards = document.querySelectorAll('.diya-option-card');
  const btnLabel = document.getElementById('wish-btn-label');
  const filterBtns = document.querySelectorAll('.sanctuary-filter-btn');

  const stage = document.getElementById('sanctuary-stage');
  const viewport3D = document.getElementById('sanctuary-3d-viewport');

  const skyLayer = document.getElementById('sanctuary-sky-layer');
  const diyasLayer = document.getElementById('sanctuary-diyas-layer');
  const riverLayer = document.getElementById('sanctuary-river-layer');

  // Spotlight modal elements
  const modal = document.getElementById('blessing-spotlight-modal');
  const modalCloseBtn = document.getElementById('spotlight-close-btn');
  const modalDiyaIcon = document.getElementById('spotlight-diya-icon');
  const modalBadge = document.getElementById('spotlight-badge');
  const modalName = document.getElementById('spotlight-name');
  const modalTime = document.getElementById('spotlight-time');
  const modalQuote = document.getElementById('spotlight-quote');
  const modalRingBtn = document.getElementById('spotlight-ring-btn');

  let currentDiyaType = 'Clay Diya';
  let diyaCount = 108; // Starting auspicious count
  let currentActiveWish = null;

  // 3D Mouse & Touch Parallax Tilt Effect on the 3D Kalimpong Model
  if (stage && viewport3D) {
    const applyTilt = (clientX, clientY) => {
      const rect = stage.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      const rotX = -y * 12; // tilt max 12 deg
      const rotY = x * 16;  // rotate max 16 deg
      viewport3D.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    stage.addEventListener('mousemove', (e) => {
      applyTilt(e.clientX, e.clientY);
    });

    stage.addEventListener('mouseleave', () => {
      viewport3D.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    // Touch support for mobile phones
    stage.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        applyTilt(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    stage.addEventListener('touchend', () => {
      viewport3D.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // Style selector interaction
  diyaCards.forEach(card => {
    card.addEventListener('click', () => {
      diyaCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentDiyaType = card.getAttribute('data-diya-type') || 'Clay Diya';

      if (btnLabel) {
        if (currentDiyaType === 'Sky Lantern') {
          btnLabel.textContent = 'Release My Sky Lantern';
        } else if (currentDiyaType === 'Lotus Lantern') {
          btnLabel.textContent = 'Float My River Lotus';
        } else {
          btnLabel.textContent = 'Light My Earthen Diya';
        }
      }
    });
  });

  // Base community blessings realistically mapped on the 3D Kalimpong Model
  const initialWishes = [
    {
      id: 'wish-1',
      name: 'Sunita Sharma (MacFarlane Ridge)',
      text: 'Wishing warmth, sweet sel roti, and endless joy to everyone visiting our beautiful hill town.',
      time: '25m ago',
      type: 'Sky Lantern',
      diya: '🏮',
      coords: { x: 22, y: 16 }
    },
    {
      id: 'wish-2',
      name: 'Tenzing & Pema (Durpin Monastery)',
      text: 'May the lights of Kalimpong bring peace to all beings across these sacred hills. Happy Diwali!',
      time: '10m ago',
      type: 'Clay Diya',
      diya: '🪔',
      coords: { x: 33, y: 46 }
    },
    {
      id: 'wish-3',
      name: 'Kavita Pradhan (Deolo Hill)',
      text: 'From the highest ridge facing Kanchenjunga, lighting this lantern for harmony and good health.',
      time: '1h ago',
      type: 'Sky Lantern',
      diya: '🏮',
      coords: { x: 50, y: 12 }
    },
    {
      id: 'wish-4',
      name: 'Rohan Lepcha (Teesta Valley)',
      text: 'May our mountain waters and misty pines shine bright tonight. Subha Deepavali!',
      time: '2h ago',
      type: 'Lotus Lantern',
      diya: '🪷',
      coords: { x: 34, y: 84 }
    },
    {
      id: 'wish-5',
      name: 'Doma Sherpa (Lava Pines)',
      text: 'Sending warm blessings of peaceful mountain winds and joyful hearth fires to all travelers.',
      time: '3h ago',
      type: 'Clay Diya',
      diya: '🪔',
      coords: { x: 56, y: 54 }
    },
    {
      id: 'wish-6',
      name: 'Pemba Tshering (Rishyap Peak)',
      text: 'Releasing this lantern into the clear Himalayan sky. Peace, light, and prosperity to Kalimpong!',
      time: '4h ago',
      type: 'Sky Lantern',
      diya: '🏮',
      coords: { x: 78, y: 18 }
    },
    {
      id: 'wish-7',
      name: 'Ananya Sen (Relli River)',
      text: 'Floating this lotus with love and gratitude for our gentle rivers and orchids.',
      time: '5h ago',
      type: 'Lotus Lantern',
      diya: '🪷',
      coords: { x: 68, y: 86 }
    },
    {
      id: 'wish-8',
      name: 'Father Graham (Dr. Graham’s Homes)',
      text: 'Lighting this earthen lamp for all children of the hills and every traveler seeking warmth.',
      time: '6h ago',
      type: 'Clay Diya',
      diya: '🪔',
      coords: { x: 74, y: 62 }
    }
  ];

  // Retrieve stored wishes from localStorage
  let savedWishes = [];
  try {
    const raw = localStorage.getItem('kalimpong_sanctuary_wishes');
    if (raw) savedWishes = JSON.parse(raw);
  } catch (err) {}

  const allWishes = [...initialWishes, ...savedWishes];
  diyaCount = 108 + savedWishes.length;
  if (countBadge) countBadge.textContent = `${diyaCount} Lights Glowing`;

  // Render physical interactive light onto the 3D Kalimpong model
  function createPhysicalLight(wish, isJustLit = false) {
    let targetLayer = diyasLayer;
    let typeClass = 'type-clay';
    let extraDecor = '<div class="light-ground-halo"></div>';

    if (wish.type === 'Sky Lantern') {
      targetLayer = skyLayer;
      typeClass = 'type-sky';
      extraDecor = '';
    } else if (wish.type === 'Lotus Lantern') {
      targetLayer = riverLayer;
      typeClass = 'type-lotus';
      extraDecor = '<div class="light-water-ripple"></div>';
    }

    if (!targetLayer) return null;

    const el = document.createElement('div');
    el.className = `sanctuary-light ${typeClass}${isJustLit ? ' just-lit' : ''}`;
    el.setAttribute('data-wish-id', wish.id);
    el.setAttribute('data-diya-type', wish.type);
    el.style.left = `${wish.coords.x}%`;
    el.style.top = `${wish.coords.y}%`;

    // Short display name for physical badge (e.g. "Maya" or "Sunita S.")
    const shortName = wish.name.split('(')[0].trim();

    el.innerHTML = `
      ${extraDecor}
      <div class="light-icon" title="Click to view blessing from ${escapeHtml(wish.name)}">${wish.diya}</div>
      <div class="sanctuary-light-label">${escapeHtml(shortName)}</div>
    `;

    // Click handler to open spotlight card
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openBlessingSpotlight(wish, el);
    });

    targetLayer.appendChild(el);
    return el;
  }

  // Populate all initial lights
  allWishes.forEach(w => createPhysicalLight(w));

  // Open the interactive spotlight modal
  function openBlessingSpotlight(wish, lightEl) {
    currentActiveWish = wish;
    if (!modal) return;

    if (modalDiyaIcon) modalDiyaIcon.textContent = wish.diya;
    if (modalName) modalName.textContent = wish.name;
    if (modalQuote) modalQuote.textContent = wish.text;
    if (modalTime) modalTime.textContent = `Offering lit ${wish.time}`;

    if (modalBadge) {
      if (wish.type === 'Sky Lantern') {
        modalBadge.textContent = '🏮 Sky Lantern (Fanush)';
        modalBadge.style.color = '#ff9d42';
        modalBadge.style.borderColor = 'rgba(255, 157, 66, 0.4)';
      } else if (wish.type === 'Lotus Lantern') {
        modalBadge.textContent = '🪷 Sacred River Lotus';
        modalBadge.style.color = '#ff80bf';
        modalBadge.style.borderColor = 'rgba(255, 128, 191, 0.4)';
      } else {
        modalBadge.textContent = '🪔 Clay Earthen Diya';
        modalBadge.style.color = '#ffb830';
        modalBadge.style.borderColor = 'rgba(255, 184, 48, 0.4)';
      }
    }

    if (modalRingBtn) {
      modalRingBtn.innerHTML = '<span>🔔 Ring Temple Bell for Blessing</span>';
      modalRingBtn.disabled = false;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    // Chime softly on open
    playTempleBellNote(784);
  }

  // Close spotlight modal
  function closeBlessingSpotlight() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    currentActiveWish = null;
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeBlessingSpotlight);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeBlessingSpotlight();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeBlessingSpotlight();
    }
  });

  // Modal Ring Bell interaction
  if (modalRingBtn) {
    modalRingBtn.addEventListener('click', () => {
      playTempleBellNote(880);
      modalRingBtn.innerHTML = '<span>✨ Bell Reverberated with Warmth!</span>';
      modalRingBtn.disabled = true;
      showToast(`🔔 Temple bell reverberated across the ridge for ${currentActiveWish ? currentActiveWish.name : 'this blessing'}!`);
    });
  }

  // Category filtering (All, Diyas, Lanterns, Lotus)
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      document.querySelectorAll('.sanctuary-light').forEach(light => {
        const type = light.getAttribute('data-diya-type');
        if (filter === 'all' || type === filter) {
          light.classList.remove('hidden');
        } else {
          light.classList.add('hidden');
        }
      });
    });
  });

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Form submission: Physically spawns Diya / Lantern on 3D Kalimpong model
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wish-name-input');
      const textInput = document.getElementById('wish-message-input');

      const name = nameInput.value.trim() || 'Himalayan Pilgrim';
      const text = textInput.value.trim() || 'May these sacred lights bring joy and peace from Kalimpong!';

      const diyaIcons = {
        'Clay Diya': '🪔',
        'Sky Lantern': '🏮',
        'Lotus Lantern': '🪷'
      };

      // Calculate realistic coordinates on the 3D Kalimpong model
      let coordX = 20 + Math.random() * 60;
      let coordY = 50;

      if (currentDiyaType === 'Sky Lantern') {
        coordX = 15 + Math.random() * 70;
        coordY = 10 + Math.random() * 22; // In the starry sky above peaks
      } else if (currentDiyaType === 'Clay Diya') {
        coordX = 22 + Math.random() * 58;
        coordY = 44 + Math.random() * 22; // On the mountain ridges & town terraces
      } else {
        coordX = 26 + Math.random() * 48;
        coordY = 82 + Math.random() * 9;  // In the Teesta River bed at the bottom
      }

      const newWish = {
        id: `wish-${Date.now()}`,
        name,
        text,
        time: 'Just now',
        type: currentDiyaType,
        diya: diyaIcons[currentDiyaType] || '🪔',
        coords: { x: Math.round(coordX), y: Math.round(coordY) }
      };

      // Physically create in DOM with spawn animation
      const newEl = createPhysicalLight(newWish, true);

      // Save to localStorage
      try {
        savedWishes.push(newWish);
        localStorage.setItem('kalimpong_sanctuary_wishes', JSON.stringify(savedWishes));
      } catch (err) {}

      // Increment counter
      diyaCount++;
      if (countBadge) countBadge.textContent = `${diyaCount} Lights Glowing`;

      // Reset form
      nameInput.value = '';
      textInput.value = '';

      // Immediately open spotlight on their new light
      setTimeout(() => {
        openBlessingSpotlight(newWish, newEl);
      }, 400);

      // Sound and toast
      playTempleBellNote(880);

      if (currentDiyaType === 'Sky Lantern') {
        showToast('🏮 Your Sky Lantern is now drifting above the Kalimpong 3D peaks!');
      } else if (currentDiyaType === 'Lotus Lantern') {
        showToast('🪷 Your Lotus Lantern has been placed into the Teesta River waters!');
      } else {
        showToast('🪔 Your Clay Diya is now glowing on the 3D Kalimpong mountain ridge!');
      }
    });
  }
}

function showToast(message) {
  let toast = document.getElementById('diwali-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'diwali-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(8, 13, 26, 0.95);
      border: 1px solid #ffb830;
      color: #fff;
      padding: 0.9rem 1.6rem;
      border-radius: 9999px;
      font-size: 0.88rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(255, 184, 48, 0.4);
      z-index: 9999;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 3500);
}

/* ===================================================================
   7. PROCEDURAL WEB AUDIO SYNTHESIZER (HIMALAYAN SOUNDSCAPE)
   =================================================================== */
let audioCtx = null;
let masterGain = null;
let windGain = null;
let cricketsGain = null;
let isAudioMuted = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    setupWindSynthesizer();
    setupCricketsSynthesizer();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Procedural Pink Noise Mountain Wind
function setupWindSynthesizer() {
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
    b6 = white * 0.115926;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  // Filter for deep mountain wind
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(260, audioCtx.currentTime);

  // LFO to simulate gusting mountain wind
  const lfo = audioCtx.createOscillator();
  lfo.frequency.setValueAtTime(0.15, audioCtx.currentTime);
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.setValueAtTime(140, audioCtx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  windGain = audioCtx.createGain();
  windGain.gain.setValueAtTime(0.0, audioCtx.currentTime);

  whiteNoise.connect(filter);
  filter.connect(windGain);
  windGain.connect(masterGain);
  whiteNoise.start();
}

// Procedural Crickets / Night Meadow Atmosphere
function setupCricketsSynthesizer() {
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(4500, audioCtx.currentTime);

  const modOsc = audioCtx.createOscillator();
  modOsc.type = 'sawtooth';
  modOsc.frequency.setValueAtTime(28, audioCtx.currentTime);

  const modGain = audioCtx.createGain();
  modGain.gain.setValueAtTime(400, audioCtx.currentTime);
  modOsc.connect(modGain);
  modGain.connect(osc.frequency);

  cricketsGain = audioCtx.createGain();
  cricketsGain.gain.setValueAtTime(0.0, audioCtx.currentTime);

  osc.connect(cricketsGain);
  cricketsGain.connect(masterGain);

  osc.start();
  modOsc.start();
}

// Buddhist Singing Bowl / Temple Bell Harmonic Chime
function playTempleBellNote(baseFreq = 528) {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const harmonics = [1, 2.01, 3.02, 4.1];
  const amps = [0.4, 0.2, 0.1, 0.05];

  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * h, now);

    g.gain.setValueAtTime(amps[i], now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(g);
    g.connect(masterGain);

    osc.start(now);
    osc.stop(now + 3.6);
  });
}

// Firework Pop / Thud Synthesizer
function triggerFireworkPopSound() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Low frequency thud
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

  g.gain.setValueAtTime(0.5, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(g);
  g.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.45);
}

function initWebAudioSoundscape() {
  const soundNavBtn = document.getElementById('soundscape-toggle-btn');
  const windSlider = document.getElementById('wind-vol-slider');
  const cricketsSlider = document.getElementById('crickets-vol-slider');
  const bellBtn = document.getElementById('play-bell-btn');

  function updateAudioState() {
    if (!audioCtx) getAudioContext();
    if (isAudioMuted) {
      if (windGain) windGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
      if (cricketsGain) cricketsGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
      if (soundNavBtn) {
        soundNavBtn.classList.remove('active');
        soundNavBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        `;
      }
    } else {
      const wVal = windSlider ? (parseFloat(windSlider.value) / 100) * 0.35 : 0.25;
      const cVal = cricketsSlider ? (parseFloat(cricketsSlider.value) / 100) * 0.08 : 0.05;
      if (windGain) windGain.gain.setTargetAtTime(wVal, audioCtx.currentTime, 0.2);
      if (cricketsGain) cricketsGain.gain.setTargetAtTime(cVal, audioCtx.currentTime, 0.2);
      if (soundNavBtn) {
        soundNavBtn.classList.add('active');
        soundNavBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.08"/></svg>
        `;
      }
      playTempleBellNote(528);
    }
  }

  if (soundNavBtn) {
    soundNavBtn.addEventListener('click', () => {
      isAudioMuted = !isAudioMuted;
      updateAudioState();
    });
  }

  if (windSlider) {
    windSlider.addEventListener('input', () => {
      if (!isAudioMuted && windGain && audioCtx) {
        windGain.gain.setValueAtTime((parseFloat(windSlider.value) / 100) * 0.35, audioCtx.currentTime);
      }
    });
  }

  if (cricketsSlider) {
    cricketsSlider.addEventListener('input', () => {
      if (!isAudioMuted && cricketsGain && audioCtx) {
        cricketsGain.gain.setValueAtTime((parseFloat(cricketsSlider.value) / 100) * 0.08, audioCtx.currentTime);
      }
    });
  }

  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      if (isAudioMuted) {
        isAudioMuted = false;
        updateAudioState();
      }
      playTempleBellNote(432);
    });
  }
}

/* ===================================================================
   8. KEYBOARD SHORTCUTS
   =================================================================== */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Space: Play singing bowl chime
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      playTempleBellNote(528);
    }
    // M: Toggle Soundscape
    if ((e.key === 'm' || e.key === 'M') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      const soundBtn = document.getElementById('soundscape-toggle-btn');
      if (soundBtn) soundBtn.click();
    }
  });
}

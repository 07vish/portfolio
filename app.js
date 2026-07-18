import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   VISHNU JARIWALA — PORTFOLIO ENGINE v2
   Lenis · Three.js · GSAP · Character Splits · Magnetic
   ═══════════════════════════════════════════════════════ */

const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;


/* ─────────────────────────────────────────────────────
   0. LENIS SMOOTH SCROLL
   ───────────────────────────────────────────────────── */
const lenis = new Lenis({
  duration: 1.3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  touchMultiplier: 1.5,
});

// Connect Lenis to GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


/* ─────────────────────────────────────────────────────
   1. THREE.JS 3D SCENE
   ───────────────────────────────────────────────────── */
(function initThreeScene() {
  const container = document.getElementById('canvas-container');

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.02);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ─── Floating Wireframe Geometries ───
  const meshes = [];
  const geometryTypes = [
    () => new THREE.IcosahedronGeometry(1, 0),
    () => new THREE.OctahedronGeometry(1, 0),
    () => new THREE.TorusGeometry(0.7, 0.25, 8, 16),
    () => new THREE.TetrahedronGeometry(1, 0),
    () => new THREE.DodecahedronGeometry(0.8, 0),
    () => new THREE.TorusKnotGeometry(0.6, 0.2, 32, 8),
  ];

  const MESH_COUNT = IS_MOBILE ? 8 : 18;
  for (let i = 0; i < MESH_COUNT; i++) {
    const createGeo = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
    const geo = createGeo();
    const opacity = 0.04 + Math.random() * 0.08;
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity,
    });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.set(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 30 - 10
    );
    mesh.scale.setScalar(0.6 + Math.random() * 2.8);

    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.006,
      rotSpeedY: (Math.random() - 0.5) * 0.006,
      rotSpeedZ: (Math.random() - 0.5) * 0.002,
      floatSpeed: 0.2 + Math.random() * 0.5,
      floatAmp: 0.3 + Math.random() * 1.5,
      initialY: mesh.position.y,
      phase: Math.random() * Math.PI * 2,
      baseOpacity: opacity,
    };

    scene.add(mesh);
    meshes.push(mesh);
  }

  // ─── Particle Field ───
  const PARTICLE_COUNT = IS_MOBILE ? 120 : 400;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: IS_MOBILE ? 0.08 : 0.04,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ─── Secondary Particle Layer ───
  const PARTICLE_COUNT_2 = IS_MOBILE ? 40 : 150;
  const particleGeo2 = new THREE.BufferGeometry();
  const positions2 = new Float32Array(PARTICLE_COUNT_2 * 3);

  for (let i = 0; i < PARTICLE_COUNT_2; i++) {
    positions2[i * 3] = (Math.random() - 0.5) * 100;
    positions2[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions2[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;
  }

  particleGeo2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));

  const particleMat2 = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    transparent: true,
    opacity: 0.15,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const particles2 = new THREE.Points(particleGeo2, particleMat2);
  scene.add(particles2);

  // ─── Mouse Tracking ───
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  if (!IS_MOBILE) {
    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  // ─── Resize ───
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ─── Animation Loop ───
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    const scrollFraction = lenis.scroll / Math.max(1, document.body.scrollHeight - window.innerHeight);

    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    camera.position.x = mouseX * 4;
    camera.position.y = -mouseY * 4 - scrollFraction * 12;
    camera.position.z = 30 - scrollFraction * 18;
    camera.lookAt(0, -scrollFraction * 12, -10);

    for (const mesh of meshes) {
      const d = mesh.userData;
      mesh.rotation.x += d.rotSpeedX;
      mesh.rotation.y += d.rotSpeedY;
      mesh.rotation.z += d.rotSpeedZ;
      mesh.position.y = d.initialY + Math.sin(elapsed * d.floatSpeed + d.phase) * d.floatAmp;
      mesh.material.opacity = d.baseOpacity + Math.sin(elapsed * 0.5 + d.phase) * 0.02;
    }

    particles.rotation.y = elapsed * 0.015;
    particles.rotation.x = elapsed * 0.008;
    particles2.rotation.y = -elapsed * 0.008;
    particles2.rotation.z = elapsed * 0.005;

    renderer.render(scene, camera);
  }

  animate();
})();


/* ─────────────────────────────────────────────────────
   2. CUSTOM CURSOR
   ───────────────────────────────────────────────────── */
if (!IS_MOBILE) {
  const dot = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let outlineX = cursorX;
  let outlineY = cursorY;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    dot.style.left = cursorX + 'px';
    dot.style.top = cursorY + 'px';
  });

  (function animateCursorOutline() {
    outlineX += (cursorX - outlineX) * 0.12;
    outlineY += (cursorY - outlineY) * 0.12;
    outline.style.left = outlineX + 'px';
    outline.style.top = outlineY + 'px';
    requestAnimationFrame(animateCursorOutline);
  })();

  // Hover effects on interactive elements
  const interactiveSelectors = 'a, button, .project-card, .skill-tag, .social-link, .contact-email';
  document.querySelectorAll(interactiveSelectors).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('active');
      outline.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('active');
      outline.classList.remove('active');
    });
  });
}


/* ─────────────────────────────────────────────────────
   3. CHARACTER SPLIT + HERO ANIMATIONS
   ───────────────────────────────────────────────────── */
// Split each hero-name-line into individual characters
function splitTextIntoChars(element) {
  const text = element.textContent;
  element.textContent = '';
  [...text].forEach((char) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    element.appendChild(span);
  });
}

document.querySelectorAll('.hero-name-line').forEach(splitTextIntoChars);

// Hero entrance timeline
const heroTL = gsap.timeline({ delay: 2.5 });

heroTL
  .from('.hero-label', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
  })
  .from('.hero-name-line:first-child .char', {
    y: '110%',
    opacity: 0,
    rotateX: -40,
    duration: 0.8,
    stagger: 0.035,
    ease: 'power4.out',
  }, '-=0.3')
  .from('.hero-name-line:last-child .char', {
    y: '110%',
    opacity: 0,
    rotateX: -40,
    duration: 0.8,
    stagger: 0.035,
    ease: 'power4.out',
  }, '-=0.55')
  .to('.hero-photo-bg', {
    opacity: 0.08,
    duration: 1.5,
    ease: 'power2.out',
  }, '-=0.8')
  .from('.hero-tagline', {
    y: 20,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
  }, '-=1')
  .from('.scroll-indicator', {
    opacity: 0,
    duration: 0.6,
  }, '-=0.4');


/* ─────────────────────────────────────────────────────
   4. HERO PHOTO PARALLAX + SCROLL FADE
   ───────────────────────────────────────────────────── */
if (!IS_MOBILE) {
  const heroPhoto = document.querySelector('.hero-photo-bg');

  // Mouse parallax on hero photo (opposite direction for depth)
  let photoTargetX = 0, photoTargetY = 0;
  let photoX = 0, photoY = 0;

  document.addEventListener('mousemove', (e) => {
    photoTargetX = (e.clientX / window.innerWidth - 0.5) * -20;
    photoTargetY = (e.clientY / window.innerHeight - 0.5) * -20;
  });

  (function animateHeroPhoto() {
    photoX += (photoTargetX - photoX) * 0.06;
    photoY += (photoTargetY - photoY) * 0.06;
    if (heroPhoto) {
      heroPhoto.style.transform = `translate(calc(-50% + ${photoX}px), calc(-50% + ${photoY}px))`;
    }
    requestAnimationFrame(animateHeroPhoto);
  })();

  // Fade + scale out on scroll
  gsap.to('.hero-photo-bg', {
    opacity: 0,
    scale: 1.15,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '60% top',
      scrub: 1,
    },
  });
}


/* ─────────────────────────────────────────────────────
   5. SCROLL-TRIGGERED REVEAL ANIMATIONS
   ───────────────────────────────────────────────────── */
// Generic reveal elements
document.querySelectorAll('.reveal').forEach((el) => {
  gsap.to(el, {
    y: 0,
    opacity: 1,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
  });
});

// ─── About Image Reveal (curtain mask) ───
gsap.to('.image-mask', {
  scaleY: 0,
  duration: 1.4,
  ease: 'power4.inOut',
  scrollTrigger: {
    trigger: '.about-image-wrapper',
    start: 'top 80%',
    toggleActions: 'play none none none',
  },
});

// Corner brackets animate in after image reveals
gsap.to('.corner', {
  opacity: 0.6,
  duration: 0.6,
  delay: 0.3,
  stagger: 0.08,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.about-image-wrapper',
    start: 'top 75%',
    toggleActions: 'play none none none',
  },
});

// Parallax on about image
gsap.to('.about-image-wrapper img', {
  y: -40,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about-image-wrapper',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.5,
  },
});

// ─── Skill Categories Stagger ───
gsap.from('.skill-category', {
  y: 50,
  opacity: 0,
  duration: 0.7,
  stagger: 0.12,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.skills-grid',
    start: 'top 82%',
  },
});

// ─── Project Cards Stagger ───
gsap.from('.project-card', {
  y: 60,
  opacity: 0,
  duration: 0.8,
  stagger: 0.15,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.projects-grid',
    start: 'top 82%',
  },
});

// ─── Contact Section ───
gsap.set(['.contact-heading', '.contact-subtext', '.contact-email'], {
  opacity: 0,
  y: 40,
});

gsap.to('.contact-heading', {
  y: 0,
  opacity: 1,
  duration: 1,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '#contact',
    start: 'top 80%',
    toggleActions: 'play none none none',
  },
});

gsap.to('.contact-subtext', {
  y: 0,
  opacity: 1,
  duration: 0.8,
  delay: 0.15,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '#contact',
    start: 'top 75%',
    toggleActions: 'play none none none',
  },
});

gsap.to('.contact-email', {
  y: 0,
  opacity: 1,
  duration: 0.7,
  delay: 0.3,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '#contact',
    start: 'top 70%',
    toggleActions: 'play none none none',
  },
});

gsap.from('.social-links', {
  y: 20,
  opacity: 0,
  duration: 0.7,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.social-links',
    start: 'top 92%',
    toggleActions: 'play none none none',
  },
});

// ─── Marquee parallax speed effect ───
gsap.to('.marquee-track', {
  x: -80,
  ease: 'none',
  scrollTrigger: {
    trigger: '.marquee-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 2,
  },
});


/* ─────────────────────────────────────────────────────
   6. TYPEWRITER EFFECT
   ───────────────────────────────────────────────────── */
(function typewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const words = [
    'Creative Builder',
    'Problem Solver',
    'Video Creator',
    'Graphic Designer',
    'Flutter Developer',
    'Cloud Architect',
    'Critical Thinker',
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 90;

  function type() {
    const current = words[wordIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 90;
    }

    if (!isDeleting && charIndex === current.length) {
      typeSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
  }

  setTimeout(type, 2800);
})();


/* ─────────────────────────────────────────────────────
   7. NAVIGATION
   ───────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// Scroll blur effect
lenis.on('scroll', ({ scroll }) => {
  navbar.classList.toggle('scrolled', scroll > 60);
});

// Mobile menu
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('active');
  if (isOpen) {
    lenis.stop();
  } else {
    lenis.start();
  }
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
    lenis.start();
  });
});


/* ─────────────────────────────────────────────────────
   8. 3D TILT + SPOTLIGHT on CARDS
   ───────────────────────────────────────────────────── */
if (!IS_MOBILE) {
  document.querySelectorAll('.project-card[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -2.5;
      const rotateY = ((x - centerX) / centerX) * 2.5;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, background 0.4s';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'border-color 0.4s, background 0.4s';
    });
  });

  document.querySelectorAll('.skill-category').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });
}


/* ─────────────────────────────────────────────────────
   9. MAGNETIC EFFECT
   ───────────────────────────────────────────────────── */
if (!IS_MOBILE) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    const strength = parseFloat(el.dataset.strength) || 0.3;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
      });
    });
  });
}


/* ─────────────────────────────────────────────────────
   10. SMOOTH SCROLL for ANCHOR LINKS
   ───────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      lenis.scrollTo(target, { offset: -80, duration: 1.6 });
    }
  });
});


/* ─────────────────────────────────────────────────────
   11. LOADER
   ───────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  // Stop scroll during loading
  lenis.stop();

  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    lenis.start();

    setTimeout(() => {
      loader.style.display = 'none';
    }, 1200);
  }, 2300);
});


/* ─────────────────────────────────────────────────────
   12. ACTIVE NAV HIGHLIGHT
   ───────────────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  const scrollY = lenis.scroll + window.innerHeight / 3;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);

    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        link.style.color = 'var(--text-primary)';
      } else {
        link.style.color = '';
      }
    }
  });
}

lenis.on('scroll', updateActiveNav);
updateActiveNav();

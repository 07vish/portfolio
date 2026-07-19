import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   VISHNU JARIWALA — PORTFOLIO ENGINE v3
   Lenis · Three.js · GSAP · Character Splits · Magnetic
   Now with full mobile 3D + animations
   ═══════════════════════════════════════════════════════ */

const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;
const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;


/* ─────────────────────────────────────────────────────
   0. LENIS SMOOTH SCROLL
   ───────────────────────────────────────────────────── */
const lenis = new Lenis({
  duration: IS_MOBILE ? 1.0 : 1.3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  touchMultiplier: IS_MOBILE ? 2 : 1.5,
});

// Connect Lenis to GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


/* ─────────────────────────────────────────────────────
   1. THREE.JS 3D SCENE (Desktop + Mobile)
   ───────────────────────────────────────────────────── */
(function initThreeScene() {
  const container = document.getElementById('canvas-container');

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, IS_MOBILE ? 0.015 : 0.02);

  const camera = new THREE.PerspectiveCamera(
    IS_MOBILE ? 65 : 60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, IS_MOBILE ? 35 : 30);

  const renderer = new THREE.WebGLRenderer({
    antialias: !IS_MOBILE, // Save performance on mobile
    alpha: true,
    powerPreference: IS_MOBILE ? 'low-power' : 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));
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

  // ── More meshes on mobile now (but still fewer than desktop)
  const MESH_COUNT = IS_MOBILE ? 12 : 18;
  for (let i = 0; i < MESH_COUNT; i++) {
    const createGeo = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
    const geo = createGeo();
    const opacity = IS_MOBILE
      ? 0.05 + Math.random() * 0.1  // Slightly more visible on mobile
      : 0.04 + Math.random() * 0.08;
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const spread = IS_MOBILE ? 45 : 60;
    mesh.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * 30 - 10
    );
    mesh.scale.setScalar(IS_MOBILE
      ? 0.8 + Math.random() * 2.2  // Slightly larger on mobile for visibility
      : 0.6 + Math.random() * 2.8
    );

    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * (IS_MOBILE ? 0.008 : 0.006),
      rotSpeedY: (Math.random() - 0.5) * (IS_MOBILE ? 0.008 : 0.006),
      rotSpeedZ: (Math.random() - 0.5) * 0.002,
      floatSpeed: 0.2 + Math.random() * 0.5,
      floatAmp: IS_MOBILE ? 0.5 + Math.random() * 2 : 0.3 + Math.random() * 1.5,
      initialY: mesh.position.y,
      phase: Math.random() * Math.PI * 2,
      baseOpacity: opacity,
    };

    scene.add(mesh);
    meshes.push(mesh);
  }

  // ─── Particle Field ───
  const PARTICLE_COUNT = IS_MOBILE ? 200 : 400;
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
    size: IS_MOBILE ? 0.1 : 0.04,  // Bigger particles on mobile for visibility
    transparent: true,
    opacity: IS_MOBILE ? 0.4 : 0.35,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ─── Secondary Particle Layer ───
  const PARTICLE_COUNT_2 = IS_MOBILE ? 60 : 150;
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
    size: IS_MOBILE ? 0.04 : 0.02,
    transparent: true,
    opacity: IS_MOBILE ? 0.2 : 0.15,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const particles2 = new THREE.Points(particleGeo2, particleMat2);
  scene.add(particles2);

  // ─── Mouse / Touch Tracking ───
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  if (!IS_MOBILE) {
    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  // ─── Device Orientation (Gyroscope) for Mobile ───
  let orientX = 0, orientY = 0;
  let targetOrientX = 0, targetOrientY = 0;
  let gyroActive = false;

  const gyroToggle = document.getElementById('gyroToggle');

  function handleOrientation(e) {
    if (e.gamma !== null && e.beta !== null) {
      // gamma: left/right tilt (-90 to 90)
      // beta: front/back tilt (-180 to 180)
      targetOrientX = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      targetOrientY = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 30));

      // Update CSS variables for UI-level parallax response to tilting
      document.documentElement.style.setProperty('--gyro-x', `${targetOrientX * 12}px`);
      document.documentElement.style.setProperty('--gyro-y', `${targetOrientY * 12}px`);
    }
  }

  const enableGyro = () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            gyroActive = true;
            gyroToggle.classList.add('active');
            gyroToggle.querySelector('.gyro-text').textContent = 'Motion On';
          } else {
            console.log('Gyro permission denied');
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
      gyroActive = true;
      gyroToggle.classList.add('active');
      gyroToggle.querySelector('.gyro-text').textContent = 'Motion On';
    }
  };

  const disableGyro = () => {
    window.removeEventListener('deviceorientation', handleOrientation);
    gyroActive = false;
    gyroToggle.classList.remove('active');
    gyroToggle.querySelector('.gyro-text').textContent = 'Motion Controls';
    // Reset positions
    gsap.to({ x: targetOrientX, y: targetOrientY }, {
      x: 0, y: 0,
      duration: 1,
      ease: 'power2.out',
      onUpdate: function() {
        targetOrientX = this.targets()[0].x;
        targetOrientY = this.targets()[0].y;
        document.documentElement.style.setProperty('--gyro-x', `${targetOrientX * 12}px`);
        document.documentElement.style.setProperty('--gyro-y', `${targetOrientY * 12}px`);
      }
    });
  };

  if (IS_MOBILE && window.DeviceOrientationEvent) {
    gyroToggle.style.display = 'flex';
    gyroToggle.addEventListener('click', () => {
      if (!gyroActive) {
        enableGyro();
      } else {
        disableGyro();
      }
    });
  }

  // ─── Touch drag tracking as fallback when gyro is disabled ───
  if (IS_MOBILE) {
    window.addEventListener('touchmove', (e) => {
      if (!gyroActive && e.touches.length === 1) {
        const touch = e.touches[0];
        targetOrientX = (touch.clientX / window.innerWidth - 0.5) * 1.5;
        targetOrientY = (touch.clientY / window.innerHeight - 0.5) * 1.5;
        document.documentElement.style.setProperty('--gyro-x', `${targetOrientX * 15}px`);
        document.documentElement.style.setProperty('--gyro-y', `${targetOrientY * 15}px`);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!gyroActive) {
        gsap.to({ x: targetOrientX, y: targetOrientY }, {
          x: 0, y: 0,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            targetOrientX = this.targets()[0].x;
            targetOrientY = this.targets()[0].y;
            document.documentElement.style.setProperty('--gyro-x', `${targetOrientX * 15}px`);
            document.documentElement.style.setProperty('--gyro-y', `${targetOrientY * 15}px`);
          }
        });
      }
    }, { passive: true });
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

    if (IS_MOBILE) {
      // Smooth orientation tracking
      orientX += (targetOrientX - orientX) * 0.06;
      orientY += (targetOrientY - orientY) * 0.06;

      // Combine scroll + orientation + auto-drift for mobile
      const autoDriftX = Math.sin(elapsed * 0.15) * 0.3;
      const autoDriftY = Math.cos(elapsed * 0.12) * 0.2;

      camera.position.x = (orientX + autoDriftX) * 3;
      camera.position.y = -(orientY + autoDriftY) * 3 - scrollFraction * 10;
      camera.position.z = 35 - scrollFraction * 14;
      camera.lookAt(0, -scrollFraction * 10, -10);
    } else {
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      camera.position.x = mouseX * 4;
      camera.position.y = -mouseY * 4 - scrollFraction * 12;
      camera.position.z = 30 - scrollFraction * 18;
      camera.lookAt(0, -scrollFraction * 12, -10);
    }

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

// Hero entrance timeline (works on BOTH mobile and desktop)
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
    rotateX: IS_MOBILE ? -20 : -40,
    duration: IS_MOBILE ? 0.6 : 0.8,
    stagger: IS_MOBILE ? 0.04 : 0.035,
    ease: 'power4.out',
  }, '-=0.3')
  .from('.hero-name-line:last-child .char', {
    y: '110%',
    opacity: 0,
    rotateX: IS_MOBILE ? -20 : -40,
    duration: IS_MOBILE ? 0.6 : 0.8,
    stagger: IS_MOBILE ? 0.04 : 0.035,
    ease: 'power4.out',
  }, '-=0.55')
  .to('.hero-photo-bg', {
    opacity: IS_MOBILE ? 0.06 : 0.08,
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
} else {
  // ─── Mobile: Fade hero photo on scroll ───
  gsap.to('.hero-photo-bg', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '70% top',
      scrub: 1,
    },
  });
}


/* ─────────────────────────────────────────────────────
   5. SCROLL-TRIGGERED REVEAL ANIMATIONS (Desktop + Mobile)
   ───────────────────────────────────────────────────── */
// Generic reveal elements — works on both platforms
document.querySelectorAll('.reveal').forEach((el) => {
  gsap.to(el, {
    y: 0,
    opacity: 1,
    duration: IS_MOBILE ? 0.7 : 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: IS_MOBILE ? 'top 92%' : 'top 88%',
      toggleActions: 'play none none none',
    },
  });
});

// ─── About Image Reveal (curtain mask) ───
gsap.to('.image-mask', {
  scaleY: 0,
  duration: IS_MOBILE ? 1.0 : 1.4,
  ease: 'power4.inOut',
  scrollTrigger: {
    trigger: '.about-image-wrapper',
    start: IS_MOBILE ? 'top 85%' : 'top 80%',
    toggleActions: 'play none none none',
  },
});

// Corner brackets animate in after image reveals
gsap.to('.corner', {
  opacity: IS_MOBILE ? 0.3 : 0.6,
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

// Parallax on about image (works on both, gentler on mobile)
gsap.to('.about-image-wrapper img', {
  y: IS_MOBILE ? -20 : -40,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about-image-wrapper',
    start: 'top bottom',
    end: 'bottom top',
    scrub: IS_MOBILE ? 1 : 1.5,
  },
});

// ─── Skill Categories Stagger (both platforms) ───
gsap.from('.skill-category', {
  y: IS_MOBILE ? 40 : 50,
  opacity: 0,
  duration: IS_MOBILE ? 0.6 : 0.7,
  stagger: IS_MOBILE ? 0.1 : 0.12,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.skills-grid',
    start: IS_MOBILE ? 'top 90%' : 'top 82%',
  },
});

// ─── Skill Tags Stagger (mobile only - adds life) ───
if (IS_MOBILE) {
  document.querySelectorAll('.skill-category').forEach((cat) => {
    const tags = cat.querySelectorAll('.skill-tag');
    gsap.from(tags, {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: cat,
        start: 'top 88%',
      },
    });
  });
}

// ─── Project Cards Stagger (both platforms) ───
gsap.from('.project-card', {
  y: IS_MOBILE ? 50 : 60,
  opacity: 0,
  duration: IS_MOBILE ? 0.7 : 0.8,
  stagger: IS_MOBILE ? 0.12 : 0.15,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.projects-grid',
    start: IS_MOBILE ? 'top 90%' : 'top 82%',
  },
});

// ─── Contact Section (both platforms) ───
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
    start: IS_MOBILE ? 'top 85%' : 'top 80%',
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
    start: IS_MOBILE ? 'top 80%' : 'top 75%',
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
    start: IS_MOBILE ? 'top 75%' : 'top 70%',
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

// ─── Mobile: Social links stagger ───
if (IS_MOBILE) {
  gsap.from('.social-link', {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'back.out(2)',
    scrollTrigger: {
      trigger: '.social-links',
      start: 'top 92%',
    },
  });
}

// ─── Marquee parallax speed effect ───
gsap.to('.marquee-track', {
  x: IS_MOBILE ? -40 : -80,
  ease: 'none',
  scrollTrigger: {
    trigger: '.marquee-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: IS_MOBILE ? 1 : 2,
  },
});


/* ─────────────────────────────────────────────────────
   6. TYPEWRITER EFFECT (Desktop + Mobile)
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

// ─── Mobile nav links entrance animation ───
if (IS_MOBILE) {
  const navLinksItems = navLinks.querySelectorAll('a');

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.target.classList.contains('open')) {
        gsap.from(navLinksItems, {
          y: 40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.15,
        });
      }
    });
  });

  observer.observe(navLinks, {
    attributes: true,
    attributeFilter: ['class'],
  });
}


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
      lenis.scrollTo(target, {
        offset: IS_MOBILE ? -60 : -80,
        duration: IS_MOBILE ? 1.2 : 1.6,
      });
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


/* ─────────────────────────────────────────────────────
   13. MOBILE-SPECIFIC ENHANCEMENTS
   ───────────────────────────────────────────────────── */
if (IS_MOBILE) {
  // ─── Section dividers animate in on scroll ───
  document.querySelectorAll('.header-line').forEach((line) => {
    gsap.from(line, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: line,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // ─── Marquee text shimmer on scroll ───
  gsap.to('.marquee-content', {
    '-webkit-text-stroke-color': 'rgba(255, 255, 255, 0.2)',
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.marquee-section',
      start: 'top 90%',
      end: 'bottom 10%',
      toggleActions: 'play reverse play reverse',
    },
  });

  // ─── Project card number count-up on mobile ───
  document.querySelectorAll('.project-card:not(.coming-soon) .project-number').forEach((num) => {
    const target = num.textContent;
    gsap.from(num, {
      textContent: '00',
      duration: 0.8,
      ease: 'power1.inOut',
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: num,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      onUpdate: function() {
        // Keep zero-padded format
        num.textContent = String(Math.round(parseFloat(num.textContent))).padStart(2, '0');
      },
      onComplete: function() {
        num.textContent = target;
      }
    });
  });

  // ─── Haptic feedback on card tap (if available) ───
  document.querySelectorAll('.project-card, .skill-category, .social-link, .contact-email').forEach((el) => {
    el.addEventListener('touchstart', () => {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }, { passive: true });
  });
}

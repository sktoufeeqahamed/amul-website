/**
 * Amul Kool Rose - Apple-Grade Scrollytelling Engine
 * 210 frames sequence with inertia LERP scrubbing, canvas rendering,
 * preloading, interactive HUD dock, and ambient audio synthesizer.
 */

(function () {
  'use strict';

  // Configuration
  const TOTAL_FRAMES = 210;
  const FRAME_PREFIX = 'ezgif-frame-';
  const FRAME_EXT = '.png';
  const MIN_FRAMES_TO_START = 20;

  // DOM Elements
  const body = document.body;
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const progressFrames = document.getElementById('progressFrames');
  const skipPreloaderBtn = document.getElementById('skipPreloaderBtn');

  const navbar = document.getElementById('navbar');
  const heroSection = document.getElementById('hero-scroll');
  const canvas = document.getElementById('frameCanvas');
  const ctx = canvas.getContext('2d');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const heroHeader = document.getElementById('heroHeader');

  // Chapters & Dots
  const storyCards = document.querySelectorAll('.story-card');
  const chapterDots = document.querySelectorAll('.chapter-dots .dot');

  // HUD Elements
  const hudPlayBtn = document.getElementById('hudPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const navAutoPlayBtn = document.getElementById('navAutoPlayBtn');
  const hudRewindBtn = document.getElementById('hudRewindBtn');
  const hudSpeedBtn = document.getElementById('hudSpeedBtn');
  const speedLabel = document.getElementById('speedLabel');
  const scrubberTrack = document.getElementById('scrubberTrack');
  const scrubberFill = document.getElementById('scrubberFill');
  const scrubberThumb = document.getElementById('scrubberThumb');
  const frameNumberDisplay = document.getElementById('frameNumberDisplay');
  const percentageDisplay = document.getElementById('percentageDisplay');
  const fitModeBtn = document.getElementById('fitModeBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundOffIcon = document.getElementById('soundOffIcon');
  const soundOnIcon = document.getElementById('soundOnIcon');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // State
  const frameImages = new Array(TOTAL_FRAMES + 1).fill(null);
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let displayedFrame = 1;
  let fitMode = 'cover'; // 'cover' or 'contain'
  let isAutoPlaying = false;
  let playSpeed = 1.0;
  const speeds = [0.5, 1.0, 2.0];
  let speedIndex = 1;
  let isDraggingScrubber = false;
  let isAudioActive = false;
  let audioCtx = null;
  let lastSoundFrame = 1;

  // Helper to format frame filename
  function getFrameSrc(index) {
    const num = String(index).padStart(3, '0');
    return `${FRAME_PREFIX}${num}${FRAME_EXT}`;
  }

  // Preloader & Frame Loading
  function initPreloader() {
    // Priority load: First frame immediately
    loadImage(1, () => {
      drawFrame(1);
    });

    // Load key frames first for fast responsiveness
    const keyframes = [];
    for (let i = 2; i <= TOTAL_FRAMES; i += 7) {
      keyframes.push(i);
    }
    keyframes.forEach(i => loadImage(i));

    // Load all remaining frames
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      if (!keyframes.includes(i)) {
        loadImage(i);
      }
    }
  }

  function loadImage(index, callback) {
    if (frameImages[index]) {
      if (callback) callback();
      return;
    }

    const img = new Image();
    img.src = getFrameSrc(index);
    img.onload = () => {
      frameImages[index] = img;
      loadedCount++;
      updatePreloaderProgress();
      if (callback) callback();
    };
    img.onerror = () => {
      loadedCount++;
      updatePreloaderProgress();
    };
  }

  function updatePreloaderProgress() {
    const percent = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
    progressFrames.textContent = `${loadedCount} / ${TOTAL_FRAMES} frames`;

    // Once minimum frames are loaded, allow start
    if (loadedCount >= MIN_FRAMES_TO_START && preloader) {
      skipPreloaderBtn.style.display = 'inline-flex';
    }

    if (loadedCount >= TOTAL_FRAMES || loadedCount >= MIN_FRAMES_TO_START) {
      if (loadedCount >= TOTAL_FRAMES) {
        setTimeout(dismissPreloader, 400);
      }
    }
  }

  function dismissPreloader() {
    if (!preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      body.classList.remove('loading');
    }
  }

  skipPreloaderBtn.addEventListener('click', dismissPreloader);

  // Resize Canvas with Retina / High-DPI support
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(displayedFrame);
  }

  window.addEventListener('resize', resizeCanvas);

  // Canvas Frame Drawing
  function drawFrame(frameIndex) {
    let img = frameImages[frameIndex];
    if (!img) {
      // Find nearest loaded frame
      img = getNearestLoadedFrame(frameIndex);
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    ctx.clearRect(0, 0, cw, ch);

    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;
    let drawW, drawH, drawX, drawY;

    if (fitMode === 'cover') {
      const scale = Math.max(cw / iw, ch / ih);
      drawW = iw * scale;
      drawH = ih * scale;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2;
    } else {
      // 'contain'
      const scale = Math.min(cw / iw, ch / ih);
      drawW = iw * scale;
      drawH = ih * scale;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  function getNearestLoadedFrame(index) {
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      if (index - offset >= 1 && frameImages[index - offset]) {
        return frameImages[index - offset];
      }
      if (index + offset <= TOTAL_FRAMES && frameImages[index + offset]) {
        return frameImages[index + offset];
      }
    }
    return frameImages[1];
  }

  // Calculate Scroll Progress
  function updateScrollTarget() {
    if (isDraggingScrubber || isAutoPlaying) return;

    const rect = heroSection.getBoundingClientRect();
    const scrollableDistance = heroSection.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;

    const progress = -rect.top / scrollableDistance;
    targetProgress = Math.max(0, Math.min(1, progress));
  }

  // Transparent Navigation Bar & Scrollspy
  const mainNavbar = document.getElementById('mainNavbar');
  const navDesktopItems = document.querySelectorAll('#navDesktopMenu .nav-item');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const menuIconOpen = document.getElementById('menuIconOpen');
  const menuIconClose = document.getElementById('menuIconClose');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileDrawer.classList.contains('hidden');
      if (isHidden) {
        mobileDrawer.classList.remove('hidden');
        if (menuIconOpen) menuIconOpen.classList.add('hidden');
        if (menuIconClose) menuIconClose.classList.remove('hidden');
      } else {
        mobileDrawer.classList.add('hidden');
        if (menuIconOpen) menuIconOpen.classList.remove('hidden');
        if (menuIconClose) menuIconClose.classList.add('hidden');
      }
    });
  }

  // Smooth scroll handler for nav items
  function bindNavScroll(links) {
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(href);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
            if (mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
              mobileDrawer.classList.add('hidden');
              if (menuIconOpen) menuIconOpen.classList.remove('hidden');
              if (menuIconClose) menuIconClose.classList.add('hidden');
            }
          }
        }
      });
    });
  }

  bindNavScroll(navDesktopItems);
  bindNavScroll(mobileNavLinks);

  const sectionsToTrack = [
    'hero-scroll',
    'flavor-profile',
    'nutrition-goodness',
    'pack-sizes',
    'mocktails',
    'reviews',
    'faq'
  ];

  function updateNavbarScroll() {
    if (!mainNavbar) return;
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      mainNavbar.classList.add('scrolled');
    } else {
      mainNavbar.classList.remove('scrolled');
    }

    let activeId = 'hero-scroll';
    const offset = 220;
    for (let i = 0; i < sectionsToTrack.length; i++) {
      const secEl = document.getElementById(sectionsToTrack[i]);
      if (secEl) {
        const top = secEl.offsetTop - offset;
        const bottom = top + secEl.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          activeId = sectionsToTrack[i];
          break;
        }
      }
    }

    navDesktopItems.forEach(item => {
      if (item.getAttribute('data-section') === activeId) {
        item.classList.add('active');
        item.classList.remove('text-on-surface-variant');
      } else {
        item.classList.remove('active');
        item.classList.add('text-on-surface-variant');
      }
    });

    mobileNavLinks.forEach(item => {
      if (item.getAttribute('data-section') === activeId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    updateScrollTarget();
    updateNavbarScroll();

    // Hide scroll helper indicator when user starts scrolling
    if (window.scrollY > 80 && scrollIndicator) {
      scrollIndicator.style.opacity = '0';
    } else if (scrollIndicator && window.scrollY <= 20) {
      scrollIndicator.style.opacity = '0.85';
    }
  }, { passive: true });

  // Hero Top Header Fade Away (Fades away when scrolling reaches 30% of scroll animation section)
  function updateHeroHeader(progress) {
    if (!heroHeader) return;
    const fadeThreshold = 0.30;
    if (progress < fadeThreshold) {
      const ratio = progress / fadeThreshold; // 0 to 1
      const opacity = Math.max(0, 1 - ratio);
      const translateY = -ratio * 36; // smooth 36px subtle upward float as it fades
      heroHeader.style.opacity = opacity.toFixed(3);
      heroHeader.style.transform = `translate(-50%, ${translateY.toFixed(1)}px)`;
      heroHeader.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';
      heroHeader.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none';
    } else {
      heroHeader.style.opacity = '0';
      heroHeader.style.transform = 'translate(-50%, -36px)';
      heroHeader.style.visibility = 'hidden';
      heroHeader.style.pointerEvents = 'none';
    }
  }

  // Chapters & Active Highlights
  function updateChapterOverlays(progress) {
    let currentChapter = 0;
    if (progress >= 0.72) {
      currentChapter = 4;
    } else if (progress >= 0.46) {
      currentChapter = 3;
    } else if (progress >= 0.22) {
      currentChapter = 2;
    } else if (progress >= 0.08) {
      currentChapter = 1;
    } else {
      currentChapter = 0; // 0% - 8%: Pure focus on Amul Kool & The Taste of India hero header
    }

    storyCards.forEach(card => {
      const chapter = parseInt(card.getAttribute('data-chapter'), 10);
      if (chapter === currentChapter) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    chapterDots.forEach(dot => {
      const chapter = parseInt(dot.getAttribute('data-chapter'), 10);
      if (chapter === currentChapter || (currentChapter === 0 && chapter === 1)) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Chapter dots click handler
  chapterDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const chapter = parseInt(dot.getAttribute('data-chapter'), 10);
      const chapterMilestones = [0, 0.1, 0.35, 0.60, 0.88];
      const targetP = chapterMilestones[chapter] || 0;
      scrollToProgress(targetP);
    });
  });

  function scrollToProgress(p) {
    const scrollableDistance = heroSection.offsetHeight - window.innerHeight;
    const targetY = heroSection.offsetTop + p * scrollableDistance;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  }

  // Animation Loop (LERP for ultra-smooth inertia scrubbing)
  function animationLoop() {
    if (isAutoPlaying) {
      targetProgress += (0.0022 * playSpeed);
      if (targetProgress > 1.0) {
        targetProgress = 0.0; // Loop seamlessly
      }
      const scrollableDistance = heroSection.offsetHeight - window.innerHeight;
      window.scrollTo(0, heroSection.offsetTop + targetProgress * scrollableDistance);
    }

    // Damped interpolation (inertia)
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0001) {
      currentProgress += diff * 0.14;
    } else {
      currentProgress = targetProgress;
    }

    // Calculate frame (1 to 210)
    const newFrame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(1 + currentProgress * (TOTAL_FRAMES - 1))));

    if (newFrame !== displayedFrame) {
      displayedFrame = newFrame;
      drawFrame(displayedFrame);

      // Trigger ambient sound chime if audio active
      if (isAudioActive && Math.abs(displayedFrame - lastSoundFrame) >= 8) {
        playAmbientDropletSound(displayedFrame);
        lastSoundFrame = displayedFrame;
      }
    }

    // Update HUD Scrubber and frame counter
    const pct = Math.round(currentProgress * 100);
    scrubberFill.style.width = `${pct}%`;
    scrubberThumb.style.left = `${pct}%`;
    frameNumberDisplay.textContent = String(displayedFrame).padStart(3, '0');
    percentageDisplay.textContent = `(${pct}%)`;

    // Update chapter cards and hero header fade at 30% scroll
    updateChapterOverlays(currentProgress);
    updateHeroHeader(currentProgress);

    requestAnimationFrame(animationLoop);
  }

  // Scrubber Dragging & Clicking
  function handleScrubberInput(e) {
    const rect = scrubberTrack.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    targetProgress = progress;
    currentProgress = progress;

    const scrollableDistance = heroSection.offsetHeight - window.innerHeight;
    window.scrollTo(0, heroSection.offsetTop + progress * scrollableDistance);
  }

  scrubberTrack.parentElement.addEventListener('mousedown', (e) => {
    isDraggingScrubber = true;
    handleScrubberInput(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDraggingScrubber) {
      handleScrubberInput(e);
    }
  });

  window.addEventListener('mouseup', () => {
    isDraggingScrubber = false;
  });

  // Touch support for scrubber
  scrubberTrack.parentElement.addEventListener('touchstart', (e) => {
    isDraggingScrubber = true;
    handleScrubberInput(e);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (isDraggingScrubber) {
      handleScrubberInput(e);
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    isDraggingScrubber = false;
  });

  // Auto Play Toggle
  function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    if (isAutoPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      if (navAutoPlayBtn) {
        const textSpan = navAutoPlayBtn.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = 'Pause';
      }
      hudPlayBtn.classList.add('active');
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      if (navAutoPlayBtn) {
        const textSpan = navAutoPlayBtn.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = 'Auto Play';
      }
      hudPlayBtn.classList.remove('active');
    }
  }

  hudPlayBtn.addEventListener('click', toggleAutoPlay);
  if (navAutoPlayBtn) navAutoPlayBtn.addEventListener('click', toggleAutoPlay);

  // Rewind to Beginning
  hudRewindBtn.addEventListener('click', () => {
    scrollToProgress(0);
    targetProgress = 0;
  });

  // Speed Toggle
  hudSpeedBtn.addEventListener('click', () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    playSpeed = speeds[speedIndex];
    speedLabel.textContent = `${playSpeed}x`;
  });

  // Fit / Cover Mode Toggle
  fitModeBtn.addEventListener('click', () => {
    fitMode = fitMode === 'cover' ? 'contain' : 'cover';
    fitModeBtn.title = `Current Mode: ${fitMode.toUpperCase()} (Click to toggle)`;
    drawFrame(displayedFrame);
  });

  // Fullscreen Toggle
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Ambient Rose Chiller Sound Synthesizer (Web Audio API)
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playAmbientDropletSound(frame) {
    if (!audioCtx || audioCtx.state !== 'running') return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Pentatonic pitch scale reflecting rose freshness
      const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const noteIdx = Math.floor((frame / TOTAL_FRAMES) * baseFreqs.length) % baseFreqs.length;
      const freq = baseFreqs[noteIdx];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch (e) {
      // Audio fallback silent
    }
  }

  soundToggleBtn.addEventListener('click', () => {
    initAudio();
    isAudioActive = !isAudioActive;
    if (isAudioActive) {
      soundOffIcon.style.display = 'none';
      soundOnIcon.style.display = 'block';
      soundToggleBtn.classList.add('active');
      playAmbientDropletSound(displayedFrame);
    } else {
      soundOffIcon.style.display = 'block';
      soundOnIcon.style.display = 'none';
      soundToggleBtn.classList.remove('active');
    }
  });

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      toggleAutoPlay();
    } else if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
      e.preventDefault();
      targetProgress = Math.min(1, targetProgress + 0.04);
      scrollToProgress(targetProgress);
    } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
      e.preventDefault();
      targetProgress = Math.max(0, targetProgress - 0.04);
      scrollToProgress(targetProgress);
    } else if (e.code === 'Home') {
      e.preventDefault();
      scrollToProgress(0);
    } else if (e.code === 'End') {
      e.preventDefault();
      scrollToProgress(1);
    } else if (e.key === 'f' || e.key === 'F') {
      fullscreenBtn.click();
    } else if (e.key === 'm' || e.key === 'M') {
      soundToggleBtn.click();
    }
  });

  // Initialize
  initPreloader();
  resizeCanvas();
  updateScrollTarget();
  requestAnimationFrame(animationLoop);

})();

/**
 * Advanced UI Effects and Animations
 * A collection of visual and interactive effects
 */

// ===========================================
// TEXT SCRAMBLE EFFECT
// ===========================================



class TextScramble {
  constructor(el) {
    this.el = el;
    // Ultra expanded character set
    this.charSets = [
      '!<>-_\\/[]{}—=+*^?#_|%&', // Basic symbols
      '₽¥€£¢∞§¶•ªº≠≈∫√∂µ∆∏∑', // Math and currency
      'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω', // Greek
      '01010101010101010101', // Binary feel
      '█▓▒░█▓▒░█▓▒░█▓▒░█▓▒░', // Block elements
      '◢◣◤◥◢◣◤◥◢◣◤◥◢◣◤◥', // Geometric shapes
      '⎔⎕⌁⌂✕✖⏣⏥⏢◎◉◈◇', // Special symbols
      '¦|¦|¦|¦|¦|¦|¦|¦|¦|¦|' // Broken pipe
    ];
    this.chars = this.charSets.join('');
    this.update = this.update.bind(this);
    this.phases = ['appear', 'scramble', 'resolve']; // Animation phases
    this.glitchIntensity = 0; // Global glitch intensity (0-1)
    this.currentPhase = 0;

    // Add random glitch pulse
    setInterval(() => {
      this.glitchIntensity = Math.random() > 0.7 ? Math.random() : 0;
      setTimeout(() => {
        this.glitchIntensity = 0;
      }, 100 + Math.random() * 200);
    }, 2000 + Math.random() * 3000);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];

    // Create a staggered effect with different timing for each letter
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';

      // More dynamic timing with staggered starts - wave pattern
      const positionFactor = Math.sin((i / length) * Math.PI);
      const delay = i * (3 + positionFactor * 2);
      const start = Math.floor(Math.random() * 15) + delay;
      const end = start + Math.floor(Math.random() * 40) + 30 + (positionFactor * 10);
      const charSet = Math.floor(Math.random() * this.charSets.length);

      this.queue.push({
        from,
        to,
        start,
        end,
        charSet,
        phase: 0,
        opacity: 0,
        scale: 0.8,
        skew: 0,
        iterations: 0,
        maxIterations: 3 + Math.floor(Math.random() * 5),
        position: i / length, // Position factor for wave effects
        glitchProb: 0.1 + (Math.random() * 0.2) // Individual glitch probability
      });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char, charSet, phase, opacity, scale, skew,
            iterations, maxIterations, position, glitchProb } = this.queue[i];

      // Calculate progress for this character
      let progress = Math.min(1, (this.frame - start) / (end - start));

      if (this.frame >= end) {
        // Final state
        complete++;
        output += `<span style="opacity: 1; display: inline-block;">${to}</span>`;
      } else if (this.frame >= start) {
        // Active scrambling
        // Update phase based on progress
        if (progress < 0.25 && phase === 0) {
          // Appear phase
          opacity = progress / 0.25;
          this.queue[i].opacity = opacity;

          if (progress >= 0.24) {
            this.queue[i].phase = 1; // Move to scramble phase
          }
        } else if (progress >= 0.25 && progress < 0.75 && phase === 1) {
          // Scrambling phase
          opacity = 1;

          // Wave-like motion effect
          const wavePosition = (this.frame / 10) + (position * 5);
          scale = 1 + (Math.sin(wavePosition) * 0.1);
          skew = Math.sin(wavePosition * 0.8) * 5; // Skew angle in degrees

          // Enhanced character changing logic with pattern recognition
          const changeProb = (1 - progress) * 0.5 + (this.glitchIntensity * 0.3);
          if (Math.random() < changeProb) {
            // Sometimes use characters from surrounding sets for a "leaking" effect
            const useAdjacentSet = Math.random() < 0.3;
            const effectiveCharSet = useAdjacentSet
              ? (charSet + 1) % this.charSets.length
              : charSet;

            const charSetToUse = this.charSets[effectiveCharSet];
            char = charSetToUse[Math.floor(Math.random() * charSetToUse.length)];

            // Occasionally insert the target character for a "peek" effect
            if (Math.random() < progress * 0.3) {
              char = to;
            }

            this.queue[i].char = char;
            this.queue[i].iterations++;

            // Change character set occasionally
            if (this.queue[i].iterations > maxIterations) {
              this.queue[i].charSet = (charSet + 1) % this.charSets.length;
              this.queue[i].iterations = 0;
            }
          }

          if (progress >= 0.74) {
            this.queue[i].phase = 2; // Move to resolve phase
          }
        } else if (progress >= 0.75 && phase === 2) {
          // Resolve phase - gradually reveal the actual character
          let resolveProgress = (progress - 0.75) / 0.25;

          // Easing function for smooth resolution
          resolveProgress = Math.pow(resolveProgress, 0.5);

          // Probability increases with progress
          if (Math.random() < resolveProgress * 1.5) {
            char = to;
          } else {
            const charSetToUse = this.charSets[charSet];
            char = charSetToUse[Math.floor(Math.random() * charSetToUse.length)];
          }
          this.queue[i].char = char;
          scale = 1 + (0.05 * (1 - resolveProgress));
          skew = Math.sin(this.frame / 5) * (1 - resolveProgress) * 3;
        }

        // Apply random RGB split and glitch effects
        let rgbSplit = '';
        let glitchEffect = '';

        // Increase glitch probability based on global glitch intensity
        const effectiveGlitchProb = glitchProb + this.glitchIntensity;

        if (Math.random() < effectiveGlitchProb) {
          // Random glitch transformations
          const glitchX = (Math.random() * 2 - 1) * 3;
          const glitchY = (Math.random() * 2 - 1) * 1;
          const glitchRotate = (Math.random() * 2 - 1) * 3;
          const glitchScale = 1 + ((Math.random() * 2 - 1) * 0.1);

          glitchEffect = `transform: translate(${glitchX}px, ${glitchY}px) rotate(${glitchRotate}deg) scale(${glitchScale});`;

          // Add RGB splitting effect
          rgbSplit = `text-shadow: -1px 0 rgba(255,0,0,0.5), 1px 0 rgba(0,255,255,0.5);`;
        }

        // Dynamic styling based on phase and effects
        let style = `opacity: ${opacity}; display: inline-block; transform: scale(${scale}) skew(${skew}deg, 0deg); ${glitchEffect} ${rgbSplit}`;

        // Add data-char attribute for pseudo-element effects
        output += `<span class="dud" style="${style}" data-char="${char || from}">${char || from}</span>`;

        this.queue[i].opacity = opacity;
        this.queue[i].scale = scale;
        this.queue[i].skew = skew;
      } else {
        // Waiting to start
        output += `<span style="opacity: 1; display: inline-block;">${from}</span>`;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// ===========================================
// INITIALIZE SCRAMBLE TEXT ANIMATION
// ===========================================
function initTextScramble() {
  const el = document.querySelector('#scramble-logo');
  if (!el) return; // Skip if element doesn't exist

  const originalText = el.textContent;
  el.setAttribute('data-text', originalText); // Set data attribute for pseudo element
  const fx = new TextScramble(el);

  // Auto animation setup
  let intensity = 0;
  const letters = originalText.split('');

  // Random glitch modes
  const glitchModes = [
    // Full scramble
    () => {
      intensity = 1;
      return fx.setText(originalText);
    },
    // Partial scramble (random section)
    () => {
      intensity = 0.7;
      const startPos = Math.floor(Math.random() * (originalText.length / 2));
      const length = Math.floor(Math.random() * (originalText.length - startPos)) + 1;
      const modifiedText = [...letters];

      for (let i = startPos; i < startPos + length; i++) {
        if (i < modifiedText.length) {
          modifiedText[i] = '█';
        }
      }

      return fx.setText(modifiedText.join(''));
    },
    // Glitch single character intensely
    () => {
      intensity = 0.3;
      const pos = Math.floor(Math.random() * letters.length);
      const modifiedText = [...letters];
      modifiedText[pos] = '█';

      return fx.setText(modifiedText.join(''));
    },
    // Reverse text temporarily
    () => {
      intensity = 0.5;
      return fx.setText([...letters].reverse().join(''));
    },
    // Random character replacement
    () => {
      intensity = 0.4;
      const modifiedText = [...letters];
      const numToReplace = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numToReplace; i++) {
        const pos = Math.floor(Math.random() * modifiedText.length);
        modifiedText[pos] = '█';
      }

      return fx.setText(modifiedText.join(''));
    }
  ];

  // Initialize with a dramatic full scramble immediately
  fx.setText(originalText);

  // Continuous auto-animation function
  function autoAnimate() {
    // Choose effect type based on probabilities (weighted for more frequent activity)
    const randomFactor = Math.random();

    if (randomFactor < 0.15) {
      // Major glitch (15% chance)
      glitchModes[0]().then(() => {
        setTimeout(() => {
          fx.setText(originalText).then(() => {
            setTimeout(autoAnimate, 1000 + Math.random() * 1500);
          });
        }, 200);
      });
    } else if (randomFactor < 0.5) {
      // Medium glitch (35% chance)
      glitchModes[Math.floor(Math.random() * (glitchModes.length - 1)) + 1]().then(() => {
        setTimeout(() => {
          fx.setText(originalText).then(() => {
            setTimeout(autoAnimate, 800 + Math.random() * 1200);
          });
        }, 150);
      });
    } else {
      // Minor glitch (50% chance)
      const randomPos = Math.floor(Math.random() * letters.length);
      const modifiedText = [...letters];
      modifiedText[randomPos] = '█';

      fx.setText(modifiedText.join('')).then(() => {
        setTimeout(() => {
          fx.setText(originalText).then(() => {
            setTimeout(autoAnimate, 600 + Math.random() * 900);
          });
        }, 100);
      });
    }
  }

  // Start the continuous animation after a delay
  setTimeout(autoAnimate, 1000);
}

// ===========================================
// VIDEO PRELOADER WITH TEAR TRANSITION
// ===========================================
function initVideoPreloader() {
  const videoPreloader = document.querySelector('.video-preloader');
  if (!videoPreloader) return; // Skip if element doesn't exist

  const preloaderVideo = document.querySelector('.preloader-video');
  const skipButton = document.querySelector('.skip-intro');
  const heroElement = document.querySelector('.hero_main_component');

  // Add glitch transition elements
  const tearElements = document.createElement('div');
  tearElements.classList.add('tear-elements');
  videoPreloader.appendChild(tearElements);

  // Enhanced transitions for tear effect
  const createTearEffect = () => {
    // Add special glitch effects during transition
    document.body.classList.add('transition-active');

    // Add animated noise/glitch overlay during transition
    const glitchOverlay = document.createElement('div');
    glitchOverlay.classList.add('glitch-overlay');
    document.body.appendChild(glitchOverlay);

    // Start the transition sequence
    videoPreloader.classList.add('transitioning');

    // Reveal main content with timing
    setTimeout(() => {
      document.body.classList.remove('preload');
      document.body.classList.add('is-loaded');

      // Apply special effect to main content
      if (heroElement) {
        heroElement.style.animation = 'scaleIn 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
      }

      // Add distortion effect to the transition
      const mainContent = document.querySelector('.hero_main_content');
      if (mainContent) {
        mainContent.style.animation = 'textGlitch 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }
    }, 500);

    // Complete transition and clean up
    setTimeout(() => {
      videoPreloader.classList.add('hidden');
      document.body.classList.remove('transition-active');
      if (document.querySelector('.glitch-overlay')) {
        document.querySelector('.glitch-overlay').remove();
      }
    }, 2000);
  };

  // Function to end preloader with transition
  const endPreloader = () => {
    createTearEffect();
  };

  if (preloaderVideo) {
    // Listen for time near video end to prepare transition
    preloaderVideo.addEventListener('timeupdate', () => {
      // Trigger transition 0.5 seconds before video ends
      if (preloaderVideo.duration - preloaderVideo.currentTime <= 0.5 && !videoPreloader.classList.contains('transitioning')) {
        createTearEffect();
      }
    });

    // Video ended as backup
    preloaderVideo.addEventListener('ended', () => {
      if (!videoPreloader.classList.contains('transitioning')) {
        endPreloader();
      }
    });
  }

  // Skip button to manually end preloader
  if (skipButton) {
    skipButton.addEventListener('click', endPreloader);
  }

  // Fallback in case video fails to load or play
  setTimeout(() => {
    if (!videoPreloader.classList.contains('transitioning')) {
      endPreloader();
    }
  }, 15000); // 15 second fallback

  // Add stylesheet for additional transition effects
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes scaleIn {
      0% { transform: scale(0.9); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }

    .glitch-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.05;
      z-index: 9999;
      pointer-events: none;
      mix-blend-mode: overlay;
      animation: glitchFade 2s ease-out forwards;
    }

    @keyframes glitchFade {
      0% { opacity: 0.2; }
      20% { opacity: 0.3; }
      40% { opacity: 0.1; }
      60% { opacity: 0.3; }
      80% { opacity: 0.1; }
      100% { opacity: 0; }
    }

    .transition-active * {
      will-change: transform, opacity, clip-path;
    }

    @keyframes textGlitch {
      0% { transform: translate(0); }
      20% { transform: translate(-3px, 3px); }
      40% { transform: translate(-3px, -3px); }
      60% { transform: translate(3px, 3px); }
      80% { transform: translate(3px, -3px); }
      100% { transform: translate(0); }
    }
  `;
  document.head.appendChild(styleElement);
}

// ===========================================
// CUSTOM CURSOR
// ===========================================
function initCustomCursor() {
  if (window.innerWidth <= 991) return; // Only for desktop

  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');

  if (!cursor || !cursorFollower) return; // Skip if elements don't exist

  const cursorHoverElements = document.querySelectorAll('[data-cursor="hover"]');

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // Follow with delay
    setTimeout(() => {
      cursorFollower.style.left = e.clientX + 'px';
      cursorFollower.style.top = e.clientY + 'px';
    }, 50);
  });

  // Hover effect
  cursorHoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-grow');
      cursorFollower.style.opacity = '0';
    });

    element.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-grow');
      cursorFollower.style.opacity = '1';
    });
  });

  // Hide on leave
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorFollower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorFollower.style.opacity = '1';
  });
}

// ===========================================
// MENU TOGGLE WITH ANIMATION
// ===========================================
function initMenuToggle() {
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!menuButton || !mobileMenu) return; // Skip if elements don't exist

  const menuLinks = document.querySelectorAll('.mobile-menu-link span');

  // Set up menu links with custom animation
  menuLinks.forEach(link => {
    link.setAttribute('data-text', link.textContent);
    link.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  menuButton.addEventListener('click', () => {
    // Toggle menu states
    mobileMenu.classList.toggle('open');
    menuButton.classList.toggle('active');

    // Apply glitch effect to body text on menu open
    if (mobileMenu.classList.contains('open')) {
      document.body.style.overflow = 'hidden';

      // Create glitch effect on page text
      const mainText = document.querySelector('.hero_main_text');
      const mainTitle = document.querySelector('.hero_main_title--fs2');

      if (mainText && mainTitle) {
        mainText.style.animation = 'textGlitch 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        mainTitle.style.animation = 'textGlitch 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        setTimeout(() => {
          mainText.style.animation = '';
          mainTitle.style.animation = '';
        }, 500);
      }
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking a link with animation delay
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      const menuLinks = document.querySelector('.mobile-menu-links');

      if (menuLinks) {
        // First animate out the menu content
        menuLinks.style.opacity = '0';
        menuLinks.style.transform = 'translateY(50px)';

        // Then after a delay, close the menu backgrounds
        setTimeout(() => {
          mobileMenu.classList.remove('open');
          menuButton.classList.remove('active');

          // Reset the menu content for next opening
          setTimeout(() => {
            menuLinks.style.opacity = '';
            menuLinks.style.transform = '';
          }, 500);
        }, 300);
      } else {
        mobileMenu.classList.remove('open');
        menuButton.classList.remove('active');
      }

      document.body.style.overflow = '';
    });
  });
}

// ===========================================
// SOUND TOGGLE
// ===========================================
function initSoundToggle() {
  const soundToggle = document.querySelector('.sound-toggle');
  if (!soundToggle) return; // Skip if element doesn't exist

  const soundButton = document.querySelector('.sound-toggle__button');
  const soundLabel = document.querySelector('.sound-toggle__label');
  const backgroundAudio = document.getElementById('background-audio');
  const hoverSound = document.getElementById('hover-sound');
  const clickSound = document.getElementById('click-sound');

  if (!backgroundAudio || !hoverSound || !clickSound) return; // Skip if audio elements don't exist

  // Audio settings
  backgroundAudio.volume = 0.5;
  hoverSound.volume = 0.15;
  clickSound.volume = 0.2;

  // Audio interaction flags
  let audioEnabled = false;
  let hoverSoundPlaying = false;
  let clickSoundPlaying = false;
  let lastHoverTime = 0;

  // Add fade in/out effect for smoother transitions
  function fadeInAudio(audio, duration = 1000, targetVolume = 0.5) {
    audio.play();
    audio.volume = 0;

    let start = Date.now();
    let timer = setInterval(() => {
      let timePassed = Date.now() - start;
      let progress = timePassed / duration;

      if (progress >= 1) {
        audio.volume = targetVolume;
        clearInterval(timer);
        return;
      }

      audio.volume = targetVolume * progress;
    }, 50);
  }

  function fadeOutAudio(audio, duration = 1000) {
    let start = Date.now();
    let initialVolume = audio.volume;

    let timer = setInterval(() => {
      let timePassed = Date.now() - start;
      let progress = timePassed / duration;

      if (progress >= 1) {
        audio.volume = 0;
        audio.pause();
        clearInterval(timer);
        return;
      }

      audio.volume = initialVolume * (1 - progress);
    }, 50);
  }

  // Play hover sound function - throttled to prevent rapid firing
  function playHoverSound() {
    if (audioEnabled && !hoverSoundPlaying) {
      const now = Date.now();
      // Only play if at least 80ms have passed since last hover sound
      if (now - lastHoverTime > 80) {
        hoverSoundPlaying = true;
        lastHoverTime = now;

        hoverSound.currentTime = 0;
        hoverSound.play();

        // Reset flag after sound completes or short timeout
        setTimeout(() => {
          hoverSoundPlaying = false;
        }, 50);
      }
    }
  }

  // Play click sound function
  function playClickSound() {
    if (audioEnabled && !clickSoundPlaying) {
      clickSoundPlaying = true;
      clickSound.currentTime = 0;
      clickSound.play();

      // Reset flag after sound completes
      setTimeout(() => {
        clickSoundPlaying = false;
      }, 100);
    }
  }

  // Check if the page is visible to manage audio
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && backgroundAudio.playing) {
      fadeOutAudio(backgroundAudio, 500);
    } else if (!document.hidden && soundToggle.classList.contains('active') && !backgroundAudio.playing) {
      fadeInAudio(backgroundAudio, 500);
    }
  });

  // Define clickable elements selector
  const clickableElementsSelector = 'a, button, [role="button"], input[type="submit"], input[type="button"], .clickable, [tabindex="0"]';

  // Add hover sound to clickable elements only
  document.querySelectorAll(clickableElementsSelector).forEach(element => {
    element.addEventListener('mouseenter', function() {
      playHoverSound();
    });
  });

  // Add global click sound effect
  document.addEventListener('mousedown', function() {
    playClickSound();
  });

  // Handle toggle click
  soundToggle.addEventListener('click', function() {
    // Add a slight scale effect on click
    if (soundButton) {
      soundButton.style.transform = 'scale(0.9)';
      setTimeout(() => {
        soundButton.style.transform = '';
      }, 150);
    }

    // Toggle with a slight delay for better feel
    setTimeout(() => {
      this.classList.toggle('active');

      if (this.classList.contains('active')) {
        if (soundLabel) soundLabel.textContent = 'Sound On';
        audioEnabled = true;

        // Play audio with fade in
        fadeInAudio(backgroundAudio);

        // Add body class for potential styling changes
        document.body.classList.add('audio-active');

        // Trigger wave animation
        document.querySelectorAll('.sound-toggle__wave').forEach(wave => {
          wave.style.animation = 'none';
          // Force reflow
          void wave.offsetWidth;
          wave.style.animation = '';
        });
      } else {
        if (soundLabel) soundLabel.textContent = 'Sound Off';
        audioEnabled = false;

        // Pause audio with fade out
        fadeOutAudio(backgroundAudio);

        // Remove body class
        document.body.classList.remove('audio-active');
      }
    }, 100);
  });
}
// ===========================================
// PARALLAX EFFECT
// ===========================================
function initParallaxEffect() {
  if (window.innerWidth <= 991) return; // Only for desktop

  const decorElements = document.querySelectorAll('.decorative-element');
  if (decorElements.length === 0) return; // Skip if no elements exist

  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    decorElements.forEach(element => {
      const offsetX = (mouseX - 0.5) * 20;
      const offsetY = (mouseY - 0.5) * 20;
      element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  });
}

// ===========================================
// INITIALIZE ALL EFFECTS
// ===========================================
// ===========================================
// OPTIMIZED SCROLL TRIGGERED VIDEO CONTROLLER
// ===========================================
// ===========================================
// OPTIMIZED SCROLL TRIGGERED VIDEO CONTROLLER
// ===========================================
function initScrollVideoController() {
  // Get the hero container
  const heroSection = document.querySelector('.hero_main_component');
  if (!heroSection) return; // Skip if element doesn't exist

  // Video sources
  const initialLoopSrc = '/static/raw_screen_1.mov'; // Initial auto-loop video
  const scrollVideoSrc = '/static/render_2.mov';     // Scroll-triggered video
  const finalIdleSrc = '/static/screen_3.mov';   // Final idle video after scroll

  // Create all three video elements to manage transitions
  // 1. Initial auto-loop video (visible first)
  const initialVideo = document.createElement('video');
  initialVideo.className = 'hero_background_video initial-loop';
  initialVideo.src = initialLoopSrc;
  initialVideo.muted = true;
  initialVideo.playsInline = true;
  initialVideo.loop = true;
  initialVideo.autoplay = true;
  initialVideo.style.opacity = '1';
  initialVideo.style.position = 'absolute';
  initialVideo.style.top = '0';
  initialVideo.style.left = '0';
  initialVideo.style.width = '100%';
  initialVideo.style.height = '100%';
  initialVideo.style.objectFit = 'cover';
  initialVideo.style.transition = 'opacity 0.5s ease';
  initialVideo.style.zIndex = '-1';

  // 2. Scroll video (hidden initially)
  const scrollVideo = document.createElement('video');
  scrollVideo.className = 'hero_background_video scroll-video';
  scrollVideo.src = scrollVideoSrc;
  scrollVideo.muted = true;
  scrollVideo.playsInline = true;
  scrollVideo.style.opacity = '0';
  scrollVideo.style.position = 'absolute';
  scrollVideo.style.top = '0';
  scrollVideo.style.left = '0';
  scrollVideo.style.width = '100%';
  scrollVideo.style.height = '100%';
  scrollVideo.style.objectFit = 'cover';
  scrollVideo.style.transition = 'opacity 1s ease';
  scrollVideo.style.zIndex = '-1';

  // 3. Final idle video (hidden initially)
  const finalVideo = document.createElement('video');
  finalVideo.className = 'hero_background_video final-idle';
  finalVideo.src = finalIdleSrc;
  finalVideo.muted = true;
  finalVideo.playsInline = true;
  finalVideo.loop = true;
  finalVideo.style.opacity = '0';
  finalVideo.style.position = 'absolute';
  finalVideo.style.top = '0';
  finalVideo.style.left = '0';
  finalVideo.style.width = '100%';
  finalVideo.style.height = '100%';
  finalVideo.style.objectFit = 'cover';
  finalVideo.style.transition = 'opacity 0.2s ease';
  finalVideo.style.zIndex = '-1';

  // Find the parent container for videos
  const videoParent = document.querySelector('.hero_main_base');
  if (!videoParent) return; // Skip if element doesn't exist

  // Remove any existing videos
  const existingVideos = videoParent.querySelectorAll('video');
  existingVideos.forEach(video => video.remove());

  // Add all three videos to the DOM
  videoParent.appendChild(initialVideo);
  videoParent.appendChild(scrollVideo);
  videoParent.appendChild(finalVideo);

  // Play initial auto-loop video
  initialVideo.load();
  initialVideo.play().catch(e => {
    console.error('Error playing initial video:', e);
  });

  // Performance optimization: Set lower resolution if mobile
  if (window.innerWidth < 768) {
    initialVideo.setAttribute('data-quality', 'low');
    scrollVideo.setAttribute('data-quality', 'low');
    finalVideo.setAttribute('data-quality', 'low');
  }

  // Preload the scroll video
  scrollVideo.load();

  // Setup variables
  let scrollPosition = 0;
  let isVideoComplete = false;
  let isUserScrolling = false;
  let isScrollLocked = true;
  let videoDuration = 0;
  let videoLoaded = false;
  let isUpdatingFrame = false;
  let lastScrollTime = 0;
  let lastTargetTime = 0;
  let targetThreshold = 0.01; // Time threshold to trigger update
  const SCROLL_SENSITIVITY = 1.8; // Adjust to control scroll sensitivity
  const SCROLL_THRESHOLD = 10; // Minimum ms between scroll handling

  // Create progress indicator with additional visual elements
  const progressBar = document.createElement('div');
  progressBar.className = 'video-progress';
  progressBar.innerHTML = `
    <div class="progress-track">
      <div class="progress-fill"></div>
    </div>
  `;

  // Add subtle animation to emphasize the progress bar when first shown
  progressBar.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'opacity' && progressBar.classList.contains('active')) {
      const fill = progressBar.querySelector('.progress-fill');
      if (fill) {
        fill.style.transition = 'width 0.05s linear, box-shadow 0.3s ease';
        fill.style.boxShadow = '0 0 15px rgba(255,255,255,1), 0 0 25px rgba(255,255,255,0.7)';

        setTimeout(() => {
          fill.style.boxShadow = '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.5)';
        }, 300);
      }
    }
  });
  document.body.appendChild(progressBar);

  // Create swipe indicator for mobile devices
  const swipeIndicator = document.createElement('div');
  swipeIndicator.className = 'swipe-indicator';
  swipeIndicator.innerHTML = '<div class="swipe-icon"></div>';
  document.body.appendChild(swipeIndicator);

  // Initialize once scroll video metadata is loaded
  scrollVideo.addEventListener('loadeddata', () => {
    videoLoaded = true;
    videoDuration = scrollVideo.duration;
    console.log('Scroll video loaded, duration:', videoDuration, 'seconds');

    // Initialize with first frame
    scrollVideo.currentTime = 0;
  });

  // Transition function to switch from initial loop to scroll video
  function startScrollVideo() {
    if (!isUserScrolling) return;

    // Show progress indicator
    progressBar.classList.add('active');
    document.body.classList.add('video-scrolling');

    // Crossfade to scroll video
    initialVideo.style.opacity = '0';
    scrollVideo.style.opacity = '1';

    // Update first frame of scroll video
    if (videoLoaded) {
      scrollVideo.currentTime = 0;
    }
  }

  // Calculate what time in the video we should show based on scroll
  function calculateVideoTime() {
    // Convert scroll position to a 0-1 range
    const progress = Math.max(0, Math.min(scrollPosition, 100)) / 100;
    return progress * videoDuration;
  }

  // Efficiently update the scroll video frame
  function updateVideoFrame() {
    if (!videoLoaded || isUpdatingFrame) return;

    const targetTime = calculateVideoTime();

    // Only update if the change is significant to avoid excessive seeking
    if (Math.abs(targetTime - lastTargetTime) > targetThreshold) {
      isUpdatingFrame = true;
      lastTargetTime = targetTime;

      try {
        // Update video time
        scrollVideo.currentTime = targetTime;

        // Update progress bar
        updateProgressBar(scrollPosition / 100);

        // Check if video is complete
        if (scrollPosition >= 99 && !isVideoComplete) {
          completeVideo();
        } else if (scrollPosition < 99 && isVideoComplete) {
          // If user scrolls back up after completion
          isVideoComplete = false;
          document.body.classList.add('video-scrolling');
          isScrollLocked = true;

          // Switch back from final video to scroll video
          finalVideo.style.opacity = '0';
          scrollVideo.style.opacity = '1';
        }
      } catch (e) {
        console.error('Error updating video frame:', e);
      }

      // Short timeout to prevent too many updates
      setTimeout(() => {
        isUpdatingFrame = false;
      }, 16); // ~60fps
    }
  }

  // Update the progress bar
  function updateProgressBar(progress) {
    const fill = progressBar.querySelector('.progress-fill');
    if (fill) {
      fill.style.width = `${progress * 100}%`;
    }
  }

  // Handle video completion and transition to final idle video
  function completeVideo() {
    isVideoComplete = true;
    isScrollLocked = false;
    document.body.classList.remove('video-scrolling');

    // Hide progress after delay
    setTimeout(() => {
      progressBar.classList.remove('active');
    }, 1000);

    // Transition to final idle video
    transitionToFinalVideo();
  }

  // Function to transition to the final idle video
  function transitionToFinalVideo() {
    // Make sure final video is ready to play
    finalVideo.play().catch(e => {
      console.error('Error playing final video:', e);
    });

    // Crossfade the videos
    setTimeout(() => {
      // Fade in final video
      finalVideo.style.opacity = '1';

      // Fade out scroll video
      scrollVideo.style.opacity = '0';
    }, 100);
  }

  // Optimized scroll handler with debouncing
  function handleScroll(delta) {
    const now = performance.now();

    // Throttle scroll events
    if (now - lastScrollTime < SCROLL_THRESHOLD && isUserScrolling) return;
    lastScrollTime = now;

    // First scroll detection - transition from initial to scroll video
    if (!isUserScrolling) {
      isUserScrolling = true;
      startScrollVideo();
    }

    // Show progress indicator
    if (!progressBar.classList.contains('active')) {
      progressBar.classList.add('active');
    }

    // Update scroll position
    scrollPosition += delta * SCROLL_SENSITIVITY;
    scrollPosition = Math.max(0, Math.min(scrollPosition, 100));

    // Schedule update using rAF for better performance
    if (!isUpdatingFrame) {
      requestAnimationFrame(updateVideoFrame);
    }

    // Reset inactivity timer
    clearTimeout(window.scrollTimer);
    window.scrollTimer = setTimeout(() => {
      if (scrollPosition >= 99) {
        isUserScrolling = false;
        if (!isScrollLocked) {
          progressBar.classList.remove('active');
        }
      }
    }, 2000);
  }

  // Wheel event handler
  function wheelHandler(e) {
    if (isScrollLocked) {
      e.preventDefault();

      // Normalize wheel delta
      const delta = (e.deltaY || -e.wheelDelta || 0) / 100;
      handleScroll(delta);
    }
  }

  // Touch event variables
  let touchStartY = 0;
  let touchLastY = 0;

  // Touch start handler
  function touchStartHandler(e) {
    touchStartY = e.touches[0].clientY;
    touchLastY = touchStartY;
  }

  // Touch move handler with improved sensitivity for mobile
  function touchMoveHandler(e) {
    if (isScrollLocked) {
      e.preventDefault();

      const currentY = e.touches[0].clientY;

      // Different sensitivity for mobile vs tablet
      const isMobile = window.innerWidth < 768;
      const sensitivity = isMobile ? 0.8 : 0.6;

      const deltaY = (touchLastY - currentY) * sensitivity;
      touchLastY = currentY;

      // Scale appropriately for mobile
      const scaleFactor = isMobile ? 20 : 30;
      handleScroll(deltaY / scaleFactor);
    }
  }

  // Add event listeners with appropriate options
  window.addEventListener('wheel', wheelHandler, { passive: false });
  window.addEventListener('touchstart', touchStartHandler, { passive: true });
  window.addEventListener('touchmove', touchMoveHandler, { passive: false });

  // Show swipe indicator on mobile devices after a delay
  if (window.innerWidth < 768) {
    setTimeout(() => {
      swipeIndicator.classList.add('active');
    }, 2000);
  }

  // Video-specific error handling
  scrollVideo.addEventListener('error', (e) => {
    console.error('Scroll video error:', e);
    // Fallback: Unlock scrolling if video fails
    document.body.classList.remove('video-scrolling');
    isScrollLocked = false;
  });

  // Cleanup function
  return function cleanup() {
    window.removeEventListener('wheel', wheelHandler);
    window.removeEventListener('touchstart', touchStartHandler);
    window.removeEventListener('touchmove', touchMoveHandler);
  };
}

// Add necessary CSS styles
function addVideoControllerStyles() {
  const style = document.createElement('style');
  style.textContent = `
    body.video-scrolling {
      overflow: hidden;
      height: 100vh;
      position: fixed;
      width: 100%;
      touch-action: none;
    }

    .video-progress {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      width: 220px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .video-progress.active {
      opacity: 1;
    }

    .progress-track {
      height: 2px;
      width: 100%;
      background: rgba(0,0,0,0.4);
      position: relative;
      backdrop-filter: blur(4px);
      clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%);
      padding: 2px 0;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }

    .progress-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 0%;
      background: white;
      box-shadow: 0 0 10px rgba(255,255,255,0.9),
                 0 0 20px rgba(255,255,255,0.5);
      transition: width 0.05s linear;
    }

    .progress-track::before,
    .progress-track::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background: white;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(255,255,255,1),
                 0 0 12px rgba(255,255,255,0.8);
      z-index: 2;
    }

    .progress-track::before {
      left: -1px;
    }

    .progress-track::after {
      right: -1px;
    }

    /* Swipe indicator for mobile */
    .swipe-indicator {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(0,0,0,0.2);
      backdrop-filter: blur(8px);
      display: none;
      justify-content: center;
      align-items: center;
      opacity: 0;
      z-index: 999;
      pointer-events: none;
    }

    .swipe-indicator.active {
      display: flex;
      animation: pulseIn 0.5s forwards, pulseOut 0.5s 1.5s forwards;
    }

    .swipe-icon {
      width: 40px;
      height: 40px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 19V5M5 12l7-7 7 7'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.8;
      animation: swipeAnim 2s infinite;
    }

    @keyframes swipeAnim {
      0%, 100% { transform: translateY(0); opacity: 0.8; }
      50% { transform: translateY(-10px); opacity: 1; }
    }

    @keyframes pulseIn {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    @keyframes pulseOut {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }

    /* Mobile-specific adjustments */
    @media (max-width: 767px) {
      .video-progress {
        bottom: 30px;
        width: 180px;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize both functions when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  addVideoControllerStyles();
  initScrollVideoController();

  // Other initializations from your original code
  initTextScramble();
  initVideoPreloader();
  initCustomCursor();
  initMenuToggle();
  initSoundToggle();
  initParallaxEffect();
});
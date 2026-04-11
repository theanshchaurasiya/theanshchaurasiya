(function () {
  'use strict';

  function initProfileTilt() {
    var tilt = document.getElementById('hero-profile-tilt');
    var frame = document.getElementById('hero-profile-frame');
    if (!tilt || !frame) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var maxDeg = 11;

    function tiltFromPointer(clientX, clientY) {
      var rect = tilt.getBoundingClientRect();
      var x = (clientX - rect.left) / rect.width - 0.5;
      var y = (clientY - rect.top) / rect.height - 0.5;
      var rotY = x * maxDeg * 2;
      var rotX = -y * maxDeg * 2;
      frame.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
    }

    tilt.addEventListener('mousemove', function (e) {
      tiltFromPointer(e.clientX, e.clientY);
    });
    tilt.addEventListener('mouseleave', function () {
      frame.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  function initAbout() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var typeEl = document.getElementById('about-typewriter');
    var caretEl = document.getElementById('about-type-caret');
    var aboutSection = document.querySelector('.about-section');
    var phrase =
      'Pentesting & VAPT · Infrastructure Security · DevSecOps · Detection Engineering';

    function runTypewriter() {
      if (!typeEl) return;
      var i = 0;
      function tick() {
        if (i <= phrase.length) {
          typeEl.textContent = phrase.slice(0, i);
          i++;
          window.setTimeout(tick, i < 4 ? 120 : 42);
        }
      }
      window.setTimeout(tick, 200);
    }

    if (typeEl) {
      if (reduceMotion) {
        typeEl.textContent = phrase;
        if (caretEl) caretEl.style.display = 'none';
      } else if (aboutSection && 'IntersectionObserver' in window) {
        var tio = new IntersectionObserver(
          function (entries, obs) {
            if (!entries.some(function (e) {
              return e.isIntersecting;
            }))
              return;
            obs.disconnect();
            runTypewriter();
          },
          { threshold: 0.12 }
        );
        tio.observe(aboutSection);
      } else {
        runTypewriter();
      }
    }

    var reveals = document.querySelectorAll('.js-reveal');
    if (!reveals.length) return;

    if (reduceMotion) {
      reveals.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /** Align main nav anchors under fixed nav (matches tight section padding + file://). */
  function initHashScrollAlign() {
    var ALIGN_IDS = [
      'about',
      'experience',
      'skills',
      'projects',
      'achievements',
      'certifications',
      'education',
      'blogs',
      'contact',
    ];
    var alignSet = {};
    for (var i = 0; i < ALIGN_IDS.length; i++) {
      alignSet[ALIGN_IDS[i]] = true;
    }

    function padForHash(hash) {
      if (hash === '#experience') return 8;
      if (hash === '#about') return 12;
      return 14;
    }

    function alignFromHash() {
      var key = location.hash.replace(/^#/, '');
      if (!alignSet[key]) return;
      var el = document.getElementById(key);
      if (!el) return;
      var nav = document.querySelector('nav');
      var navH = nav ? nav.getBoundingClientRect().height : 0;
      var pad = padForHash(location.hash);
      var y = el.getBoundingClientRect().top + window.pageYOffset - navH - pad;
      window.scrollTo({ top: Math.max(0, y), left: 0, behavior: 'auto' });
    }

    alignFromHash();
    window.addEventListener('load', alignFromHash, { passive: true });
    window.addEventListener('hashchange', alignFromHash, false);
    window.addEventListener(
      'pageshow',
      function (e) {
        if (e.persisted) alignFromHash();
      },
      false
    );
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(alignFromHash);
    });

    document.addEventListener(
      'click',
      function (e) {
        var link = e.target.closest && e.target.closest('a[href^="#"]');
        if (!link) return;
        var href = link.getAttribute('href');
        if (!href || href.length < 2) return;
        var key = href.slice(1);
        if (!alignSet[key]) return;
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        try {
          history.pushState(null, '', href);
        } catch (err) {
          location.hash = href.slice(1);
        }
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(alignFromHash);
        });
        window.dispatchEvent(new Event('hashchange'));
      },
      true
    );
  }

  function initNavScroll() {
    var bar = document.getElementById('nav-progress-bar');
    var links = document.querySelectorAll('.nav-links a[href^="#"]');
    var sectionIds = [
      'about',
      'experience',
      'skills',
      'projects',
      'achievements',
      'certifications',
      'education',
      'blogs',
      'contact',
    ];
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (bar && !reduceMotion) {
      bar.style.transition = 'transform 0.12s ease-out';
    }

    function updateScrollUI() {
      var docEl = document.documentElement;
      var scrollMax = docEl.scrollHeight - window.innerHeight;
      var ratio = scrollMax > 0 ? window.scrollY / scrollMax : 0;
      if (bar) {
        bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, ratio)) + ')';
      }

      var trigger = window.scrollY + window.innerHeight * 0.22;
      var activeId = null;
      for (var i = 0; i < sectionIds.length; i++) {
        var el = document.getElementById(sectionIds[i]);
        if (!el) continue;
        var top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= trigger) activeId = sectionIds[i];
      }

      links.forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href || href.length < 2) return;
        var id = href.slice(1);
        var on = id === activeId;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }

    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          updateScrollUI();
          ticking = false;
        });
      },
      { passive: true }
    );
    window.addEventListener('resize', updateScrollUI, { passive: true });
    updateScrollUI();
  }

  function boot() {
    initProfileTilt();
    initAbout();
    initHashScrollAlign();
    initNavScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

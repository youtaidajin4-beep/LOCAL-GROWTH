(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.self !== window.top) {
    document.documentElement.classList.add('is-embedded');
  }

  /* Mobile nav */
  const navToggle = document.querySelector('.nav-toggle');
  const navDrawer = document.getElementById('mobile-nav');

  function closeNav() {
    if (!navToggle || !navDrawer) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'メニューを開く');
    navDrawer.hidden = true;
    document.body.style.overflow = '';
  }

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function () {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeNav();
      } else {
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'メニューを閉じる');
        navDrawer.hidden = false;
        document.body.style.overflow = 'hidden';
      }
    });

    navDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* Fade-in on scroll */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length && !prefersReducedMotion) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Sticky CTA */
  const stickyCta = document.getElementById('sticky-cta');
  const hero = document.getElementById('hero');

  if (stickyCta && hero) {
    const stickyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        stickyCta.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });

    stickyObserver.observe(hero);
  }

  /* Insight panels toggle */
  document.querySelectorAll('[data-insight-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-insight-toggle');
      const panel = document.getElementById(targetId);
      if (!panel) return;

      const isOpen = panel.classList.contains('is-open');
      document.querySelectorAll('.insight-panel').forEach(function (p) {
        p.classList.remove('is-open');
      });
      document.querySelectorAll('.insight-toggle').forEach(function (b) {
        b.classList.remove('is-open');
      });

      if (!isOpen) {
        panel.classList.add('is-open');
        btn.classList.add('is-open');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.insight-panels')) {
      document.querySelectorAll('.insight-panel').forEach(function (p) {
        p.classList.remove('is-open');
      });
      document.querySelectorAll('.insight-toggle').forEach(function (b) {
        b.classList.remove('is-open');
      });
    }
  });

  /* Smooth scroll for in-page anchors */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });
})();

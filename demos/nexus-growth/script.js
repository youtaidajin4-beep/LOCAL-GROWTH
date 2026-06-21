(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

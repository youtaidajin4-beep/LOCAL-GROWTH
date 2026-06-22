/**
 * 株式会社LOCAL GROWTH — Corporate LP Scripts
 * ナビ / フェードイン / エフェクト / フォーム / 導線
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  /* --- 固定ヘッダー --- */
  const header = document.querySelector('.header');

  function handleScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* --- モバイルナビ --- */
  const toggle = document.querySelector('.header__toggle');
  const nav = document.querySelector('.header__nav');
  const navLinks = document.querySelectorAll('.header__nav-link, .header__cta');

  function closeNav() {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function openNav() {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'メニューを閉じる');
    nav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* --- スムーススクロール（同一ページ内アンカー） --- */
  document.querySelectorAll('a[href*="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const path = href.slice(0, hashIndex) || window.location.pathname.split('/').pop() || 'index.html';
      const targetId = href.slice(hashIndex);
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';

      if (path !== '' && path !== currentPage && path !== './' + currentPage) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  /* --- フェードイン --- */
  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0 && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* --- イラストフロート --- */
  const floatElements = document.querySelectorAll('.illust-float');

  if (prefersReducedMotion) {
    floatElements.forEach(function (el) { el.classList.add('is-visible'); });
  } else if (floatElements.length > 0) {
    const floatObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            floatObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    floatElements.forEach(function (el) { floatObserver.observe(el); });
  }

  /* --- Hero パララックス --- */
  const heroImageWrap = document.querySelector('.hero__image-wrap');

  if (heroImageWrap && !prefersReducedMotion && !isMobile) {
    window.addEventListener('scroll', function () {
      const offset = Math.min(window.scrollY * 0.04, 24);
      heroImageWrap.style.transform = 'translateY(' + offset + 'px)';
    }, { passive: true });
  }

  /* --- サービスカード グロー追従 --- */
  if (!prefersReducedMotion) {
    document.querySelectorAll('[data-glow]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--glow-x', x + '%');
        card.style.setProperty('--glow-y', y + '%');
      });
    });
  }

  /* --- パーティクル（軽量） --- */
  const canvas = document.querySelector('.particle-canvas');

  if (canvas && !prefersReducedMotion && !isMobile) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = [];
      const count = Math.min(25, Math.floor(w / 60));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2 + 0.5,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          o: Math.random() * 0.3 + 0.1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 93, 36, ' + p.o + ')';
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      });
      requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();
    window.addEventListener('resize', function () {
      resize();
      initParticles();
    });
  }

  /* --- お問い合わせ: URLパラメータで種別プリセット --- */
  const contactContext = document.getElementById('contact-context');
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');

  const contextMessages = {
    hp: 'HP制作のご相談ですね。ご希望の日時をお選びのうえ、無料相談をご予約ください。整理の段階から、丁寧にご一緒します。',
    ai: 'AI支援導入のご相談ですね。ご希望の日時をお選びのうえ、無料相談をご予約ください。何から始めればよいか、一緒に整理しましょう。'
  };

  if (type && contextMessages[type] && contactContext) {
    contactContext.textContent = contextMessages[type];
  }

  /* --- 予約フォーム: 3ステップウィザード --- */
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');
  const panels = form ? form.querySelectorAll('.booking-panel') : [];
  const stepIndicators = form ? form.querySelectorAll('[data-step-indicator]') : [];
  const prevBtn = document.getElementById('booking-prev');
  const nextBtn = document.getElementById('booking-next');
  const submitBtn = document.getElementById('booking-submit');
  const preferredDateInput = document.getElementById('preferred-date');
  let currentStep = 1;
  const totalSteps = 3;
  const submitLabel = '無料でお問い合わせする';

  function getTomorrowISO() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  if (preferredDateInput) {
    preferredDateInput.min = getTomorrowISO();
  }

  function getActivePanel() {
    if (!form) return null;
    return form.querySelector('.booking-panel[data-step="' + currentStep + '"]');
  }

  function validateCurrentStep() {
    const panel = getActivePanel();
    if (!panel) return true;

    const fields = panel.querySelectorAll('input, select, textarea');
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  function setPanelFieldsEnabled(panel, enabled) {
    if (!panel) return;
    const fields = panel.querySelectorAll('input, select, textarea');
    fields.forEach(function (field) {
      field.disabled = !enabled;
    });
  }

  function updateStepUI() {
    panels.forEach(function (panel) {
      const step = parseInt(panel.getAttribute('data-step'), 10);
      const isActive = step === currentStep;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
      setPanelFieldsEnabled(panel, isActive);
    });

    stepIndicators.forEach(function (item) {
      const step = parseInt(item.getAttribute('data-step-indicator'), 10);
      item.classList.toggle('is-active', step === currentStep);
      item.classList.toggle('is-done', step < currentStep);
    });

    if (prevBtn) prevBtn.hidden = currentStep === 1;
    if (nextBtn) nextBtn.hidden = currentStep === totalSteps;
    if (submitBtn) submitBtn.hidden = currentStep !== totalSteps;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!validateCurrentStep()) return;
      if (currentStep < totalSteps) {
        currentStep += 1;
        updateStepUI();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentStep > 1) {
        currentStep -= 1;
        updateStepUI();
      }
    });
  }

  if (type && form) {
    const categoryInput = form.querySelector('input[name="category"][value="' + type + '"]');
    if (categoryInput) {
      categoryInput.checked = true;
    }
  }

  if (form && panels.length) {
    updateStepUI();
  }

  const categoryLabels = {
    hp: 'HP制作',
    ai: 'AI支援導入',
    other: 'その他'
  };

  const methodLabels = {
    online: 'オンライン（Zoom等）',
    'in-person': '対面（長崎）'
  };

  function enableAllFormFields() {
    panels.forEach(function (panel) {
      setPanelFieldsEnabled(panel, true);
    });
  }

  function buildFormPayload() {
    const data = new FormData(form);
    const category = data.get('category');
    const method = data.get('consultation_method');

    data.set('ご相談種別', categoryLabels[category] || category || '');
    data.set('相談方法', methodLabels[method] || method || '');
    data.set('_subject', '【LOCAL GROWTH】無料相談のお申し込み');
    data.set('_template', 'table');
    data.set('_captcha', 'false');

    return data;
  }

  /* --- フォーム送信（FormSubmit） --- */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (errorMsg) errorMsg.hidden = true;

      if (!validateCurrentStep()) {
        return;
      }

      enableAllFormFields();

      if (!form.checkValidity()) {
        form.reportValidity();
        updateStepUI();
        return;
      }

      const endpoint = form.getAttribute('data-form-endpoint');
      if (!endpoint) {
        if (errorMsg) {
          errorMsg.textContent = '送信先が設定されていません。';
          errorMsg.hidden = false;
        }
        updateStepUI();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';
      }

      fetch(endpoint, {
        method: 'POST',
        body: buildFormPayload(),
        headers: {
          Accept: 'application/json'
        }
      })
        .then(function (response) {
          return response.json().then(function (body) {
            if (!response.ok) {
              throw new Error(body.message || '送信に失敗しました');
            }
            return body;
          });
        })
        .then(function () {
          form.classList.add('is-submitted');
          if (successMsg) successMsg.hidden = false;
        })
        .catch(function () {
          if (errorMsg) {
            errorMsg.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
            errorMsg.hidden = false;
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitLabel;
          }
          updateStepUI();
        });
    });
  }

  /* --- トップ: 初回表示でスタッガー要素を表示 --- */
  document.querySelectorAll('.hero__content .fade-in').forEach(function (el) {
    if (!prefersReducedMotion) {
      setTimeout(function () {
        el.classList.add('is-visible');
      }, 100);
    } else {
      el.classList.add('is-visible');
    }
  });
})();

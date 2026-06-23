/**
 * 株式会社LOCAL GROWTH — Corporate LP Scripts
 * ナビ / フェードイン / エフェクト / フォーム / 導線
 */

(function () {
  'use strict';

  document.documentElement.classList.add('is-loading');

  window.addEventListener('load', function () {
    document.documentElement.classList.remove('is-loading');
    document.documentElement.classList.add('is-loaded');
  });

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

  function normalizePageKey(pathname) {
    const segment = pathname.split('/').filter(Boolean).pop() || '';
    if (!segment || segment === 'index.html') return '';
    return segment.replace(/\.html$/, '');
  }

  /* --- スムーススクロール（同一ページ内アンカー） --- */
  document.querySelectorAll('a[href*="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const rawPath = href.slice(0, hashIndex);
      const pathKey = rawPath === '/' || rawPath === './' || rawPath === ''
        ? ''
        : normalizePageKey(rawPath.startsWith('/') ? rawPath : '/' + rawPath);
      const targetId = href.slice(hashIndex);
      const currentKey = normalizePageKey(window.location.pathname);

      if (pathKey !== '' && pathKey !== currentKey) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  /* --- スクロール連動アニメーション --- */
  const animateElements = document.querySelectorAll('.animate-on-scroll, .fade-in');

  function revealElement(el) {
    el.classList.add('is-visible');
  }

  function revealHero() {
    const heroItems = document.querySelectorAll('[data-hero-animate]');
    heroItems.forEach(function (el, i) {
      setTimeout(function () {
        revealElement(el);
      }, 200 + i * 100);
    });
  }

  if (prefersReducedMotion) {
    animateElements.forEach(revealElement);
    document.querySelectorAll('[data-hero-animate]').forEach(revealElement);
  } else {
    const scrollObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            scrollObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    animateElements.forEach(function (el) {
      if (!el.hasAttribute('data-hero-animate')) {
        scrollObserver.observe(el);
      }
    });

    if (document.querySelectorAll('[data-hero-animate]').length > 0) {
      requestAnimationFrame(revealHero);
    }
  }

  /* --- イラストフロート（入場完了後に開始） --- */
  const floatElements = document.querySelectorAll('.illust-float');

  function startFloatWhenVisible(el) {
    if (el.classList.contains('is-visible')) {
      el.classList.add('is-floating');
      return;
    }
    const waitObserver = new MutationObserver(function () {
      if (el.classList.contains('is-visible')) {
        el.classList.add('is-floating');
        waitObserver.disconnect();
      }
    });
    waitObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
  }

  if (prefersReducedMotion) {
    floatElements.forEach(function (el) {
      revealElement(el);
      el.classList.add('is-floating');
    });
  } else if (floatElements.length > 0) {
    floatElements.forEach(startFloatWhenVisible);
  }

  /* --- Hero パララックス --- */
  const heroParallaxLayer = document.querySelector('.hero__parallax-layer');

  if (heroParallaxLayer && !prefersReducedMotion && !isMobile) {
    window.addEventListener('scroll', function () {
      const offset = Math.min(window.scrollY * 0.04, 24);
      heroParallaxLayer.style.transform = 'translateY(' + offset + 'px)';
    }, { passive: true });
  }

  /* --- Hero スクロールヒント --- */
  document.querySelectorAll('[data-scroll-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = document.querySelector(btn.getAttribute('data-scroll-target'));
      if (!target) return;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  /* --- 数値カウントアップ --- */
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;

    const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    const prefix = el.getAttribute('data-count-prefix') || '';
    const suffix = el.getAttribute('data-count-suffix') || '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (target * eased).toFixed(decimals);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const countElements = document.querySelectorAll('[data-count]');

  if (prefersReducedMotion) {
    countElements.forEach(function (el) {
      const target = el.getAttribute('data-count');
      const prefix = el.getAttribute('data-count-prefix') || '';
      const suffix = el.getAttribute('data-count-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      if (target) {
        el.textContent = prefix + parseFloat(target).toFixed(decimals) + suffix;
      }
    });
  } else if (countElements.length > 0) {
    const countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    countElements.forEach(function (el) {
      countObserver.observe(el);
    });
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

  /* --- デモ iframe --- */
  document.querySelectorAll('[data-demo-iframe]').forEach(function (iframe) {
    const fallback = iframe.getAttribute('data-demo-fallback');
    const browser = iframe.closest('[data-demo-browser]');
    let loaded = false;

    function showDemoError() {
      if (!browser || browser.querySelector('.demo-browser__error')) return;
      const err = document.createElement('div');
      err.className = 'demo-browser__error is-visible';
      err.setAttribute('role', 'alert');
      const text = document.createElement('p');
      text.className = 'demo-browser__error-text';
      text.textContent = 'デモの読み込みに失敗しました。下のボタンからフル画面でお試しください。';
      err.appendChild(text);
      if (fallback) {
        const link = document.createElement('a');
        link.href = fallback;
        link.className = 'btn btn--primary btn--full';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'フル画面でデモを開く';
        err.appendChild(link);
      }
      iframe.hidden = true;
      iframe.parentNode.appendChild(err);
    }

    iframe.addEventListener('load', function () {
      loaded = true;
      try {
        const doc = iframe.contentDocument;
        if (doc && doc.body && doc.body.innerText.indexOf('404') === 0) {
          showDemoError();
        }
      } catch (e) {
        /* same-origin only */
      }
    });

    iframe.addEventListener('error', showDemoError);

    window.setTimeout(function () {
      if (!loaded) showDemoError();
    }, 12000);
  });

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

})();

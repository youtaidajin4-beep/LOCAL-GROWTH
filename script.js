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
  const sectionNav = document.querySelector('[data-section-nav]');
  let scrollRafPending = false;
  let updateSectionNavFn = null;

  function handleScroll() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    }
    if (updateSectionNavFn) {
      updateSectionNavFn();
    }
  }

  function onScroll() {
    if (scrollRafPending) return;
    scrollRafPending = true;
    requestAnimationFrame(function () {
      handleScroll();
      scrollRafPending = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
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
    const phasedHero = document.querySelector('[data-hero-phased]');
    if (phasedHero) {
      const phase1 = phasedHero.querySelector('[data-phase="1"]');
      if (phase1) revealPhaseItems(phase1);
      return;
    }
    const heroItems = document.querySelectorAll('[data-hero-animate]');
    heroItems.forEach(function (el, i) {
      setTimeout(function () {
        revealElement(el);
      }, 200 + i * 100);
    });
  }

  let revealGeneration = 0;

  function revealPhaseItems(phaseEl) {
    if (!phaseEl) return;
    const generation = ++revealGeneration;
    const items = Array.prototype.slice.call(phaseEl.querySelectorAll('[data-phase-item]'));
    items.sort(function (a, b) {
      return parseInt(a.getAttribute('data-delay') || '0', 10) - parseInt(b.getAttribute('data-delay') || '0', 10);
    });
    items.forEach(function (item) {
      const delay = parseInt(item.getAttribute('data-delay') || '0', 10);
      item.style.setProperty('--item-delay', '0ms');
      setTimeout(function () {
        if (generation !== revealGeneration) return;
        item.classList.add('is-revealed');
        if (item.classList.contains('hero-line')) {
          item.classList.add('is-visible');
        }
      }, delay);
    });
  }

  function resetPhaseItems(phaseEl) {
    if (!phaseEl) return;
    revealGeneration++;
    phaseEl.querySelectorAll('[data-phase-item]').forEach(function (item) {
      item.classList.remove('is-revealed', 'is-visible');
    });
  }

  if (prefersReducedMotion) {
    animateElements.forEach(revealElement);
    document.querySelectorAll('[data-hero-animate]').forEach(revealElement);
    document.querySelectorAll('[data-phase-item]').forEach(function (item) {
      item.classList.add('is-revealed');
      if (item.classList.contains('hero-line')) {
        item.classList.add('is-visible');
      }
    });
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

    if (document.querySelector('[data-hero-phased]') || document.querySelector('[data-hero-animate]')) {
      requestAnimationFrame(revealHero);
    }
  }

  /* --- フェーズヒーロー（3秒自動ローテーション） --- */
  function initPhasedHero() {
    const hero = document.querySelector('[data-hero-phased][data-hero-cycle]');
    if (!hero) return;

    const phase1 = hero.querySelector('[data-phase="1"]');
    const phase2 = hero.querySelector('[data-phase="2"]');
    const dots = hero.querySelectorAll('[data-phase-dot]');
    const interval = parseInt(hero.getAttribute('data-cycle-interval') || '6000', 10);
    let currentPhase = 1;
    let cycleTimer = null;
    let exitTimer = null;

    function updateDots(activePhase) {
      dots.forEach(function (dot) {
        const n = parseInt(dot.getAttribute('data-phase-dot'), 10);
        dot.classList.toggle('hero__phase-dot--active', n === activePhase);
      });
    }

    if (prefersReducedMotion) {
      hero.classList.add('hero--phased-static');
      if (phase1) phase1.classList.add('hero__phase--active');
      if (phase2) phase2.classList.add('hero__phase--active');
      return;
    }

    function goToPhase(n) {
      if (!phase1 || !phase2 || n === currentPhase) return;

      if (n === 2) {
        phase1.classList.remove('hero__phase--active');
        phase1.classList.add('hero__phase--exiting');

        if (exitTimer) clearTimeout(exitTimer);
        exitTimer = setTimeout(function () {
          phase1.classList.remove('hero__phase--exiting');
        }, 700);

        phase2.classList.add('hero__phase--active', 'hero__phase--entering');
        setTimeout(function () {
          phase2.classList.remove('hero__phase--entering');
        }, 800);

        hero.classList.add('is-phase-2');
        resetPhaseItems(phase2);
        revealPhaseItems(phase2);
      } else {
        phase2.classList.remove('hero__phase--active', 'hero__phase--entering');
        hero.classList.remove('is-phase-2');
        resetPhaseItems(phase2);

        phase1.classList.remove('hero__phase--exiting');
        phase1.classList.add('hero__phase--active');
        resetPhaseItems(phase1);
        revealPhaseItems(phase1);
      }

      currentPhase = n;
      updateDots(n);
    }

    function tick() {
      goToPhase(currentPhase === 1 ? 2 : 1);
    }

    function startCycle() {
      stopCycle();
      cycleTimer = setInterval(tick, interval);
    }

    function stopCycle() {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
    }

    const cycleObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startCycle();
          } else {
            stopCycle();
          }
        });
      },
      { threshold: 0.25 }
    );

    cycleObserver.observe(hero);
    updateDots(1);
    startCycle();
  }

  initPhasedHero();

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

  function setSubmitButtonLabel(text) {
    if (!submitBtn) return;
    const labelSpan = submitBtn.querySelector('span:first-child');
    if (labelSpan) {
      labelSpan.textContent = text;
    } else {
      submitBtn.textContent = text;
    }
  }

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

    const stepsEl = form ? form.querySelector('.booking-steps') : null;
    if (stepsEl) {
      const progress = (currentStep / totalSteps) * 100;
      stepsEl.style.setProperty('--booking-progress', progress + '%');
    }
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
        setSubmitButtonLabel('送信中...');
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
            setSubmitButtonLabel(submitLabel);
          }
          updateStepUI();
        });
    });
  }

  /* --- サブページ: セクションナビ scroll spy --- */
  if (sectionNav) {
    const navLinks = sectionNav.querySelectorAll('[data-section-link]');
    const sectionIds = Array.from(navLinks).map(function (link) {
      return link.getAttribute('data-section-link');
    });
    const sections = sectionIds.map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);

    updateSectionNavFn = function updateSectionNav() {
      let activeId = sectionIds[0];
      const offset = (header ? header.offsetHeight : 0) + 80;

      sections.forEach(function (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom > offset) {
          activeId = section.id;
        }
      });

      navLinks.forEach(function (link) {
        const isActive = link.getAttribute('data-section-link') === activeId;
        link.classList.toggle('is-active', isActive);
      });
    };

    updateSectionNavFn();
  }

})();

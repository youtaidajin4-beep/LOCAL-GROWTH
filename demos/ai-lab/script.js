(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.self !== window.top) {
    document.documentElement.classList.add('is-embedded');
  }

  const panels = document.querySelectorAll('.panel');
  const tabs = document.querySelectorAll('.tab');
  const outputs = {
    minutes: document.getElementById('output-minutes'),
    email: document.getElementById('output-email'),
    knowledge: document.getElementById('output-knowledge'),
    report: document.getElementById('output-report')
  };

  const fullTexts = {
    minutes: '【会議要点】\n・新規案件の見積方針を確認。来週金曜までに各担当が草案提出\n・採用ページのリニューアルを4月着手。HP制作パートナーとの打合せを設定\n・アクション: 北岡氏→顧客Aへフォローメール / 大津氏→AI導入ヒアリング資料作成',
    email: '件名: 貴社ホームページリニューアルのご提案\n\n○○様\n\n先日はお時間をいただきありがとうございました。\n貴社の「信頼感のある第一印象」と「問い合わせ導線の強化」について、\n段階的な改善プランをご用意しております。\n\nまずは無料相談（60分）で現状をお聞かせいただければ幸いです。',
    knowledge: '社内マニュアル（営業編 第3章）によると、初回訪問時は「課題ヒアリングシート」を必ず記入し、48時間以内にフォローメールを送付してください。テンプレートは共有ドライブの /営業/テンプレート にあります。',
    report: '【本日の業務報告】\n■ 実施内容\n・A社向け提案資料のドラフト作成（80%完了）\n・B社ヒアリング（課題: 問い合わせ導線の弱さを確認）\n・社内AI活用勉強会の資料準備\n\n■ 明日の予定\n・A社提案資料の仕上げ・送付\n・C社フォローコール'
  };

  function switchTab(tabId) {
    tabs.forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-tab') === tabId);
    });
    panels.forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-panel') === tabId);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      switchTab(tab.getAttribute('data-tab'));
    });
  });

  function typeText(el, text, cb) {
    if (!el) return;
    el.textContent = '';
    el.classList.add('is-typing');
    if (prefersReducedMotion) {
      el.textContent = text;
      if (cb) cb();
      return;
    }
    let i = 0;
    const interval = setInterval(function () {
      el.textContent += text.charAt(i);
      i += 1;
      if (i >= text.length) {
        clearInterval(interval);
        if (cb) cb();
      }
    }, 18);
  }

  function runDemo(panelId) {
    const btn = document.querySelector('[data-run="' + panelId + '"]');
    if (btn) btn.disabled = true;

    if (panelId === 'minutes') {
      const out = outputs.minutes;
      if (out) typeText(out, fullTexts.minutes, function () {
        if (btn) btn.disabled = false;
      });
    } else if (panelId === 'email') {
      const out = outputs.email;
      if (out) typeText(out, fullTexts.email, function () {
        if (btn) btn.disabled = false;
      });
    } else if (panelId === 'knowledge') {
      const bubble = outputs.knowledge;
      if (bubble) {
        bubble.classList.remove('is-hidden');
        typeText(bubble, fullTexts.knowledge, function () {
          if (btn) btn.disabled = false;
        });
      }
    } else if (panelId === 'report') {
      const out = outputs.report;
      if (out) typeText(out, fullTexts.report, function () {
        if (btn) btn.disabled = false;
      });
    }
  }

  document.querySelectorAll('[data-run]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const panelId = btn.getAttribute('data-run');
      if (panelId === 'knowledge') {
        const bubble = outputs.knowledge;
        if (bubble) bubble.classList.add('is-hidden');
      }
      ['minutes', 'email', 'report'].forEach(function (key) {
        const el = outputs[key];
        if (el && key === panelId) el.textContent = '';
      });
      runDemo(panelId);
    });
  });

  const flowToggle = document.getElementById('flow-toggle');
  const flowPanel = document.getElementById('flow-panel');
  if (flowToggle && flowPanel) {
    flowToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = flowPanel.classList.toggle('is-open');
      flowToggle.classList.toggle('is-open', open);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.flow-toggle') && !e.target.closest('.flow-panel')) {
        flowPanel.classList.remove('is-open');
        flowToggle.classList.remove('is-open');
      }
    });
    flowPanel.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    if (document.querySelector('[data-panel="' + id + '"]')) {
      switchTab(id);
    }
  }
})();

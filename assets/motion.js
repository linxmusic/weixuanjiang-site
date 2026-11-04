/* ============================================================
   动效层 · motion.js
   ------------------------------------------------------------
   零依赖。想退回无动效版本：删掉本文件与 motion.css，
   并删掉页面里引用它们的两行即可。系统开了「减少动态效果」时自动停。
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  if (!body) return;

  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var FINE = !!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
  var EASE = 'cubic-bezier(.16,1,.3,1)';

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ── ① 顶部进度线 + 漂移红格线 ─────────────────────────── */
  var bar = doc.createElement('div');
  bar.className = 'm-progress';
  body.appendChild(bar);

  var drift = doc.createElement('div');
  drift.className = 'm-drift';
  body.insertBefore(drift, body.firstChild);

  /* ── ② 入场观察器 ─────────────────────────────────────── */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (list) {
    list.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' }) : null;

  function watch(el) {
    if (!el) return;
    if (io) io.observe(el); else el.classList.add('is-in');
  }

  function once(el, cb) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var ob = new IntersectionObserver(function (list) {
      list.forEach(function (en) {
        if (!en.isIntersecting) return;
        ob.disconnect();
        cb();
      });
    }, { threshold: 0.25 });
    ob.observe(el);
  }

  $$('.sec-hd').forEach(function (el) { el.classList.add('rv'); watch(el); });

  $$('.band figure').forEach(function (el, i) {
    el.style.transitionDelay = (i * 90) + 'ms';
    watch(el);
  });

  $$('#topics .row').forEach(function (el, i) {
    el.classList.add('rv');
    el.style.transitionDelay = (i * 70) + 'ms';
    watch(el);
  });

  /* 结尾大标题：滚到才升起 */
  var cta = $('.cta');
  if (cta) watch(cta);

  /* ── ③ 首屏开场 ───────────────────────────────────────── */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('js-ready'); });
  });
  setTimeout(function () { root.classList.remove('js-arm'); }, 1500);

  /* ── ④ 数字滚动 ───────────────────────────────────────── */
  function countUp(el) {
    var raw = (el.textContent || '').trim();
    var m = /^(\d+(?:\.\d+)?)(.*)$/.exec(raw);
    if (!m) return;
    var to = parseFloat(m[1]);
    var suf = m[2] || '';
    var dec = (m[1].split('.')[1] || '').length;
    var t0 = 0, dur = 1500;

    function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = to.toFixed(dec) + suf;
    }
    el.textContent = (0).toFixed(dec) + suf;
    requestAnimationFrame(step);
  }

  var stats = $('.stats');
  if (stats && !RM) {
    once(stats, function () { $$('.stats b').forEach(countUp); });
  }

  /* ── ⑤ 手风琴：高度动画 + 条目依次浮出 ─────────────────── */
  function fadeRows(scope) {
    if (RM) return;
    $$('.art', scope).forEach(function (a, i) {
      a.animate(
        [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 380, delay: Math.min(i, 10) * 35, easing: EASE, fill: 'backwards' }
      );
    });
  }

  function initDetails(scope) {
    $$('details.col', scope || doc).forEach(function (d) {
      if (d.__mo) return;
      d.__mo = true;
      var sum = d.querySelector('summary');
      if (!sum) return;
      var pane = d.querySelector('.arts');

      sum.addEventListener('click', function (ev) {
        if (!pane) {
          // 手机版：条目直接挂在 details 下，交给原生开合，展开后让条目浮现
          setTimeout(function () { if (d.open) fadeRows(d); }, 0);
          return;
        }
        ev.preventDefault();
        if (d._busy) return;

        if (d.open) {
          var h = pane.offsetHeight;
          d._busy = 1;
          var a = pane.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 260, easing: 'ease' });
          a.onfinish = function () { d.open = false; pane.style.height = ''; d._busy = 0; };
        } else {
          d.open = true;
          var h2 = pane.offsetHeight;
          var b = pane.animate([{ height: '0px' }, { height: h2 + 'px' }], { duration: 340, easing: EASE });
          b.onfinish = function () { pane.style.height = ''; d._busy = 0; };
          fadeRows(pane);
        }
      });
    });
  }
  initDetails();

  /* 栏目是脚本渲染的，等它渲染完再接管 */
  var colsBox = $('#cols');
  if (colsBox) setTimeout(function () { initDetails(colsBox); }, 0);

  /* ── ⑦ 磁吸按钮 ───────────────────────────────────────── */
  if (FINE && !RM) {
    $$('.btn-p,.nav .book,.submit,.tabs .book').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        b.style.transform = 'translate(' + clamp(dx * 6, -6, 6).toFixed(1) + 'px,' + clamp(dy * 5, -5, 5).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ── ⑧ 预约单立体倾斜 ─────────────────────────────────── */
  var tk = $('.ticket');
  if (tk && FINE && !RM) {
    var heroBox = tk.closest('.ticket-stage') || tk;
    heroBox.addEventListener('mousemove', function (e) {
      var r = tk.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      tk.style.animation = 'none';
      tk.style.transform = 'rotate(-1.2deg) rotateY(' + (dx * 7).toFixed(2) + 'deg) rotateX(' + (-dy * 7).toFixed(2) + 'deg)';
    });
    heroBox.addEventListener('mouseleave', function () {
      tk.style.transform = '';
      tk.style.animation = '';
    });
  }

  /* ── ⑨ 弹窗表单逐项落下 ───────────────────────────────── */
  var pbody = $('#panelBody');
  if (pbody && !RM && 'MutationObserver' in window) {
    new MutationObserver(function () {
      $$('.field', pbody).slice(0, 12).forEach(function (k, i) {
        k.animate(
          [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
          { duration: 340, delay: i * 28, easing: EASE, fill: 'backwards' }
        );
      });
    }).observe(pbody, { childList: true });
  }

  /* ── ⑩ 手机版：顶栏收缩、横滑卡片微缩放 ───────────────── */
  var appbar = $('.appbar');
  var shotBox = $('.scroll-x');
  var shots = shotBox ? $$('.shot', shotBox) : [];

  /* ── ⑪ 主循环：视差、进度、跑马灯 ─────────────────────── */
  var cover = $('.cover');
  var coverImg = cover ? cover.querySelector('img') : null;

  var lastY = -1;
  var idle = 0;
  var running = false;

  function loop() {
    var y = window.scrollY || 0;

    var max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
    bar.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';

    if (coverImg && cover) {
      var r = cover.getBoundingClientRect();
      if (r.bottom > -200 && r.top < window.innerHeight + 200) {
        var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        coverImg.style.transform = 'scale(1.09) translate3d(0,' + (p * -26).toFixed(1) + 'px,0)';
      }
    }

    if (appbar) appbar.classList.toggle('scrolled', y > 6);

    if (shots.length) {
      var mid = window.innerWidth / 2;
      shots.forEach(function (s) {
        var sr = s.getBoundingClientRect();
        var d = Math.min(1, Math.abs(sr.left + sr.width / 2 - mid) / (window.innerWidth * 0.62));
        s.style.transform = 'scale(' + (1 - d * 0.05).toFixed(3) + ')';
        s.style.opacity = (1 - d * 0.18).toFixed(3);
      });
    }

    // 滚动停下约 200ms 就收工，手机不空转耗电
    idle = (y === lastY) ? idle + 1 : 0;
    lastY = y;
    if (idle > 11) { running = false; return; }
    requestAnimationFrame(loop);
  }

  function kick() {
    if (RM) return;
    if (running) return;
    running = true;
    // 先强行跑一帧，避免 idle 判定把首帧吞掉
    lastY = -1; idle = 0;
    requestAnimationFrame(loop);
  }

  if (!RM) {
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    kick();
  } else {
    bar.style.display = 'none';
    drift.style.display = 'none';
  }
})();

/* ============================================================
   背景 · 宣讲宇宙（星环）
   ------------------------------------------------------------
   一颗纸色的星体，外面套三层星环，在页面上极慢地转。
   做法：先画环的背半圈 → 再画星体（遮住背面）→ 再画前半圈，
   于是环真的从星体背后绕过去。
   零依赖；手机减半粒子；「减少动态效果」时只画一帧。
   想整层撤掉：删掉本文件，以及两个页面里引用它的一行。
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  if (!body) return;

  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  var olds = doc.querySelectorAll('.m-drift');
  for (var o = 0; o < olds.length; o++) olds[o].parentNode.removeChild(olds[o]);

  var cv = doc.createElement('canvas');
  cv.className = 'm-space';
  cv.setAttribute('aria-hidden', 'true');
  body.insertBefore(cv, body.firstChild);

  var ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = 1, mobile = false;

  var bands = [];    // 三层环，每层一堆星点
  var dust = [];     // 全屏星尘
  var glows = [];    // 环上的亮星
  var moons = [];    // 绕环的卫星光点
  var meteor = null; // 偶尔划过的一颗流星
  var nextMeteor = 4;
  var mx = 0, my = 0, tmx = 0, tmy = 0;

  var WORDS = ['西迁精神', '长征精神', '延安精神', '理论宣讲', '青年担当', '乡村振兴', '新质生产力', '思政课', '筑言计划', '宣讲课单'];
  var labels = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function gauss() {
    var u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function starColor() {
    var r = Math.random();
    if (r > 0.962) return ['#C0273A', rnd(0.55, 0.95)];
    if (r > 0.912) return ['#A97B22', rnd(0.45, 0.8)];
    return ['#241015', rnd(0.16, 0.62)];
  }

  function makeBand(scale, count, jitter, alphaScale, speed) {
    var list = [];
    for (var i = 0; i < count; i++) {
      var c = starColor();
      list.push({
        a: Math.random() * Math.PI * 2,
        off: gauss() * jitter,
        r: rnd(0.45, (mobile ? 1.5 : 2.0)),
        c: c[0],
        al: c[1] * alphaScale,
        sp: rnd(0.85, 1.15) * speed,
        tw: rnd(0.3, 1.25),
        ph: Math.random() * Math.PI * 2,
        sc: scale
      });
    }
    return list;
  }

  function build() {
    mobile = W < 700;
    bands = []; dust = []; glows = []; moons = [];

    bands.push(makeBand(1.00, mobile ? 760 : 1500, mobile ? 5 : 9, 1.00, 1.00));
    bands.push(makeBand(1.075, mobile ? 260 : 580, mobile ? 3 : 5, 0.55, 0.94));
    bands.push(makeBand(0.925, mobile ? 220 : 480, mobile ? 3 : 5, 0.60, 1.08));

    var nDust = mobile ? 64 : 150;
    for (var k = 0; k < nDust; k++) {
      dust.push({
        x: Math.random() * W, y: Math.random() * H,
        r: rnd(0.4, 1.4), vy: rnd(0.05, 0.22),
        al: rnd(0.12, 0.38),
        tw: rnd(0.4, 1.5), ph: Math.random() * Math.PI * 2
      });
    }

    var nGlow = mobile ? 5 : 9;
    for (var g = 0; g < nGlow; g++) {
      glows.push({
        a: Math.random() * Math.PI * 2,
        off: gauss() * (mobile ? 4 : 7),
        r: mobile ? rnd(1.6, 2.6) : rnd(2.2, 3.6),
        c: Math.random() > 0.55 ? '#C0273A' : '#A97B22',
        sp: rnd(0.9, 1.1),
        tw: rnd(0.25, 0.7),
        ph: Math.random() * Math.PI * 2
      });
    }

    for (var m = 0; m < 2; m++) {
      moons.push({
        a: Math.random() * Math.PI * 2,
        sp: m ? -0.12 : 0.09,
        r: mobile ? 2.2 : 3.4,
        c: m ? '#A97B22' : '#C0273A',
        ph: Math.random() * 6.28
      });
    }

    labels = [];
    var words = mobile ? WORDS.slice(0, 6) : WORDS;
    for (var wi = 0; wi < words.length; wi++) {
      labels.push({
        w: words[wi],
        a: wi / words.length * Math.PI * 2 + rnd(-0.1, 0.1),
        r: rnd(-8, 10),
        red: wi % 3 === 0,
        ph: Math.random() * 6.28
      });
    }
  }

  function geom() {
    if (mobile) {
      var rx = W * 0.72;
      return { rx: rx, ry: rx * 0.30, cx: W * 0.94, cy: H * 0.085, tilt: -0.30, pr: rx * 0.26 };
    }
    var rxd = Math.min(W * 0.37, 560);
    return { rx: rxd, ry: rxd * 0.285, cx: W * 0.73, cy: H * 0.30, tilt: -0.30, pr: rxd * 0.30 };
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
    if (RM) draw(0);
  }

  function draw(time) {
    var t = time / 1000;
    var g = geom();
    var y = window.scrollY || 0;
    var fade = mobile ? Math.max(0.10, 1 - y / 900) : Math.max(0.34, 1 - y / 1600);

    ctx.clearRect(0, 0, W, H);

    /* 星云 */
    var neb = [
      [0.26 + Math.sin(t * 0.045) * 0.03, 0.16 + Math.cos(t * 0.038) * 0.02, 'rgba(192,39,58,.05)', 0.40],
      [0.80 + Math.cos(t * 0.04) * 0.03, 0.28 + Math.sin(t * 0.045) * 0.02, 'rgba(42,15,20,.045)', 0.44],
      [0.56 + Math.sin(t * 0.03) * 0.04, 0.88 + Math.cos(t * 0.028) * 0.02, 'rgba(169,123,34,.055)', 0.5]
    ];
    for (var i = 0; i < neb.length; i++) {
      var n = neb[i];
      var rad = Math.min(W, H) * n[3];
      var gr = ctx.createRadialGradient(W * n[0], H * n[1], 0, W * n[0], H * n[1], rad);
      gr.addColorStop(0, n[2]);
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
    }

    /* 星尘 */
    for (var d = 0; d < dust.length; d++) {
      var s = dust[d];
      s.y -= s.vy;
      if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
      var tw = 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
      ctx.globalAlpha = s.al * tw * fade;
      ctx.fillStyle = '#241015';
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;

    /* 环：先背半圈 */
    mx += (tmx - mx) * 0.04;
    my += (tmy - my) * 0.04;
    ctx.save();
    ctx.translate(g.cx + mx, g.cy + my);
    ctx.rotate(g.tilt);
    paintBands(t, g, fade, -1);

    /* 星体（纸色，遮住背面） */
    var pr = g.pr;
    var pg = ctx.createRadialGradient(-pr * 0.2, -pr * 0.22, pr * 0.08, 0, 0, pr);
    pg.addColorStop(0, 'rgba(42,15,20,.060)');
    pg.addColorStop(0.68, 'rgba(42,15,20,.048)');
    pg.addColorStop(0.94, 'rgba(42,15,20,.018)');
    pg.addColorStop(1, 'rgba(42,15,20,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(0, 0, pr, 0, Math.PI * 2);
    ctx.fill();

    /* 星体边缘：一圈极淡的墨，和一道高光 */
    ctx.beginPath();
    ctx.arc(0, 0, pr * 0.97, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(42,15,20,.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, pr * 0.955, Math.PI * 0.86, Math.PI * 1.3);
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 环：前半圈 */
    paintBands(t, g, fade, 1);

    /* 卫星光点 */
    for (var mo = 0; mo < moons.length; mo++) {
      var mm = moons[mo];
      var a2 = mm.a + t * mm.sp * 0.3;
      var moX = Math.cos(a2) * g.rx;
      var moY = Math.sin(a2) * g.ry;
      var mg = ctx.createRadialGradient(moX, moY, 0, moX, moY, mm.r * 8);
      mg.addColorStop(0, mm.c);
      mg.addColorStop(0.22, mm.c);
      mg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = (0.5 + 0.3 * Math.sin(t * 1.1 + mm.ph)) * fade;
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(moX, moY, mm.r * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    /* 环上的宣讲关键词：跟着环走，但字保持水平 */
    if (!mobile && labels.length) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = (mobile ? '11px ' : '15px ') + 'LXGW, "Source Han Serif SC", serif';
      var cosT = Math.cos(g.tilt), sinT = Math.sin(g.tilt);
      for (var li = 0; li < labels.length; li++) {
        var lb = labels[li];
        var la = lb.a + t * 0.03;
        var lx = Math.cos(la) * (g.rx + lb.r);
        var ly = Math.sin(la) * (g.ry + lb.r * 0.4);
        var sx2 = lx * cosT - ly * sinT;
        var sy2 = lx * sinT + ly * cosT;
        if (sx2 * sx2 + sy2 * sy2 < g.pr * g.pr * 0.96) continue;  // 星体上的字不画
        var wx = g.cx + mx + sx2, wy = g.cy + my + sy2 + 16;
        if (wx < W * 0.5 || wx > W - 70 || wy > H * 0.78) continue;   // 正文区和边缘不放字
        var pulse = 0.62 + 0.38 * Math.sin(t * 0.45 + lb.ph);
        ctx.globalAlpha = (lb.red ? 0.8 : 0.72) * pulse * fade;
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(248,250,247,.9)';
        ctx.strokeText(lb.w, wx, wy);
        ctx.fillStyle = lb.red ? '#C0273A' : '#241015';
        ctx.fillText(lb.w, wx, wy);
        ctx.beginPath();
        ctx.arc(wx - ctx.measureText(lb.w).width / 2 - 10, wy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    /* 偶尔一颗流星，从左上往右下 */
    if (!mobile) {
      if (!meteor && t > nextMeteor) {
        meteor = { x: rnd(W * 0.04, W * 0.62), y: rnd(-20, H * 0.22), vx: rnd(6, 9), vy: rnd(1.4, 2.4), life: 0, max: rnd(80, 120) };
        nextMeteor = t + rnd(7, 13);
      }
      if (meteor) {
        meteor.life += 1;
        var k = meteor.life / meteor.max;
        var al = Math.sin(Math.PI * Math.min(1, k)) * 0.75 * fade;
        var tx2 = meteor.x - meteor.vx * 13;
        var ty2 = meteor.y - meteor.vy * 13;
        var tr = ctx.createLinearGradient(meteor.x, meteor.y, tx2, ty2);
        tr.addColorStop(0, 'rgba(192,39,58,' + al.toFixed(3) + ')');
        tr.addColorStop(1, 'rgba(192,39,58,0)');
        ctx.strokeStyle = tr;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
        var hg = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, 7);
        hg.addColorStop(0, 'rgba(192,39,58,' + (al * 0.9).toFixed(3) + ')');
        hg.addColorStop(1, 'rgba(192,39,58,0)');
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 7, 0, Math.PI * 2);
        ctx.fill();
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        if (meteor.life > meteor.max) meteor = null;
      }
    }
  }

  /* half = -1 背半圈（y<0），+1 前半圈（y>=0） */
  function paintBands(t, g, fade, half) {
    for (var b = 0; b < bands.length; b++) {
      var list = bands[b];
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var a = p.a + t * p.sp * 0.03;
        var x = Math.cos(a) * (g.rx * p.sc + p.off);
        var yy = Math.sin(a) * (g.ry * p.sc + p.off * 0.35);
        if ((half < 0 && yy >= 0) || (half > 0 && yy < 0)) continue;
        var tw = 0.6 + 0.4 * Math.sin(t * p.tw + p.ph);
        ctx.globalAlpha = Math.min(0.9, p.al * tw * fade);
        ctx.fillStyle = p.c;
        if (p.r < 1.05) ctx.fillRect(x, yy, p.r, p.r);
        else { ctx.beginPath(); ctx.arc(x, yy, p.r, 0, Math.PI * 2); ctx.fill(); }
      }
    }

    /* 环上的亮星 */
    for (var gi = 0; gi < glows.length; gi++) {
      var q = glows[gi];
      var aa = q.a + t * q.sp * 0.03;
      var gx = Math.cos(aa) * (g.rx + q.off);
      var gy = Math.sin(aa) * (g.ry + q.off * 0.35);
      if ((half < 0 && gy >= 0) || (half > 0 && gy < 0)) continue;
      var glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, q.r * 6);
      glow.addColorStop(0, q.c);
      glow.addColorStop(0.3, q.c);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = (0.55 + 0.35 * Math.sin(t * q.tw + q.ph)) * fade;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(gx, gy, q.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  var last = 0, running = true;
  function loop(ts) {
    if (!running) return;
    if (ts - last > 31) { last = ts; draw(ts); }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function (e) {
    tmx = (e.clientX / W - 0.5) * 20;
    tmy = (e.clientY / H - 0.5) * 14;
  }, { passive: true });
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) running = false;
    else if (!RM) { running = true; requestAnimationFrame(loop); }
  });

  resize();
  if (RM) draw(0);
  else requestAnimationFrame(loop);
})();

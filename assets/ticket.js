/* ============================================================
   示例预约单 · 匀速自转 + 拖动
   ------------------------------------------------------------
   自转 40 秒一圈；按住可以拖，松手从当前角度继续转。
   手机同样自转；只在「减少动态效果」下停住。
   ============================================================ */
(function () {
  'use strict';
  var flip = document.querySelector('.flip');
  var stage = document.querySelector('.ticket-stage');
  if (!flip || !stage) return;

  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (RM) { flip.style.transform = 'rotateY(0deg)'; return; }

  var angle = 0;
  var SPEED = 360 / 40;          // 度 / 秒
  var dragging = false, startX = 0, startAngle = 0;
  var captured = false, pointerId = null;
  var last = 0;

  function apply() {
    flip.style.transform = 'rotateY(' + angle.toFixed(2) + 'deg)';
  }

  function tick(ts) {
    if (!last) last = ts;
    var dt = Math.min(64, ts - last) / 1000;
    last = ts;
    if (!dragging && !document.hidden) angle = (angle + SPEED * dt) % 360;
    apply();
    requestAnimationFrame(tick);
  }

  stage.addEventListener('pointerdown', function (e) {
    dragging = true;
    captured = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startAngle = angle;
    stage.style.cursor = 'grabbing';
  });

  stage.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    if (!captured && Math.abs(dx) > 4) {
      captured = true;
      if (stage.setPointerCapture) { try { stage.setPointerCapture(pointerId); } catch (err) {} }
    }
    angle = startAngle + dx * 0.55;
  });

  function end() {
    if (!dragging) return;
    dragging = false;
    stage.style.cursor = 'grab';
    if (captured && stage.releasePointerCapture && pointerId !== null) {
      try { stage.releasePointerCapture(pointerId); } catch (err) {}
      captured = false;
    }
    angle = ((angle % 360) + 360) % 360;
  }
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  document.addEventListener('visibilitychange', function () { last = 0; });

  requestAnimationFrame(tick);
})();

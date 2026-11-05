/* ============================================================
   星火镇 · 宣讲台小游戏
   六个 20–30 秒的小游戏，共用一个画布和一个循环
   ============================================================ */

export const GAMES = [
  { id:'attention', title:'把这场讲完', tag:'控场',  desc:'台下不断有人打瞌睡、聊天、刷手机。点他们，把人拉回来，注意力条别掉空。', time:30, icon:'👥' },
  { id:'mic',       title:'稳住麦克风', tag:'手感',  desc:'按住把音量推上去，松开就掉下来。让指针一直停在绿区里。',           time:20, icon:'🎙' },
  { id:'clap',      title:'掌声',       tag:'节奏',  desc:'掌声越来越快。光圈收到跟前时按空格或点击。',                         time:22, icon:'👏' },
  { id:'passmic',   title:'递话筒',     tag:'瞄准',  desc:'台下有人举手要发言。点他把话筒扔过去，别扔空。',                     time:30, icon:'🙋' },
  { id:'catch',     title:'接字',       tag:'操作',  desc:'稿子上的字掉下来了。左右走动接住，拼成一句话。',                     time:30, icon:'✍' },
  { id:'flip',      title:'翻页',       tag:'手速',  desc:'PPT 在乱翻。把画面停到“该讲的那一页”上。',                           time:30, icon:'📄' }
];

const W = 900, H = 560;
const FONT = '"Songti SC","SimSun","Noto Serif SC",serif';

function rr(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function text(ctx, s, x, y, size=20, color='#2A2620', align='left', weight=400){
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/* 背景：幕布 + 聚光 + 台板 */
function backdrop(ctx){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#F8EDD6'); g.addColorStop(.55,'#F1E3C8'); g.addColorStop(1,'#E7D5B2');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  // 侧幕
  [0, W-54].forEach(x0=>{
    ctx.fillStyle = '#8E2F25'; ctx.fillRect(x0,0,54,H);
    for(let x=0;x<54;x+=13){ ctx.fillStyle='rgba(0,0,0,.14)'; ctx.fillRect(x0+x,0,5,H); }
  });
  // 顶幕
  ctx.fillStyle = '#7E2A21'; ctx.fillRect(0,0,W,26);
  // 聚光
  const lg = ctx.createRadialGradient(W/2,120,20,W/2,120,430);
  lg.addColorStop(0,'rgba(255,244,214,.55)'); lg.addColorStop(1,'rgba(255,244,214,0)');
  ctx.fillStyle = lg; ctx.fillRect(0,0,W,H);
  // 台板
  ctx.fillStyle = '#C69B66'; ctx.fillRect(0,H-74,W,74);
  ctx.fillStyle = 'rgba(0,0,0,.10)';
  for(let x=0;x<W;x+=64) ctx.fillRect(x,H-74,2,74);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(0,H-74,W,2);
}

/* 听众：椅子 + 腿 + 身体 + 手臂 + 头发 */
function person(ctx, x, y, scale, color, mood){
  const s = scale;
  // 椅子
  ctx.fillStyle = '#B99B6E';
  rr(ctx, x-14*s, y-2*s, 28*s, 5*s, 2*s); ctx.fill();
  ctx.fillStyle = '#8E7350';
  rr(ctx, x-13*s, y+3*s, 3*s, 9*s, 1*s); ctx.fill();
  rr(ctx, x+10*s, y+3*s, 3*s, 9*s, 1*s); ctx.fill();
  // 腿
  ctx.fillStyle = '#3B362E';
  rr(ctx, x-8*s, y-8*s, 6*s, 9*s, 2*s); ctx.fill();
  rr(ctx, x+2*s, y-8*s, 6*s, 9*s, 2*s); ctx.fill();
  // 身体
  ctx.fillStyle = color;
  rr(ctx, x-12*s, y-28*s, 24*s, 21*s, 6*s); ctx.fill();
  // 手臂
  ctx.fillStyle = color;
  rr(ctx, x-16*s, y-25*s, 5*s, 14*s, 2.5*s); ctx.fill();
  rr(ctx, x+11*s, y-25*s, 5*s, 14*s, 2.5*s); ctx.fill();
  // 头
  ctx.fillStyle = '#E9C6A2';
  ctx.beginPath(); ctx.arc(x, y-37*s, 9*s, 0, 7); ctx.fill();
  // 头发
  ctx.fillStyle = '#2A241E';
  ctx.beginPath(); ctx.arc(x, y-40*s, 9*s, Math.PI, 0); ctx.fill();
  // 脸
  if(mood === 'sleep'){
    ctx.strokeStyle = '#6B5B48'; ctx.lineWidth = 1.4*s;
    [-3,3].forEach(dx=>{ ctx.beginPath(); ctx.moveTo(x+dx*s-2*s,y-37*s); ctx.lineTo(x+dx*s+2*s,y-37*s); ctx.stroke(); });
  } else {
    ctx.fillStyle = '#2A2620';
    [-3,3].forEach(dx=>{ ctx.beginPath(); ctx.arc(x+dx*s, y-38*s, 1.5*s, 0, 7); ctx.fill(); });
  }
}

function pop(ctx, x, y, str, color){
  ctx.save();
  ctx.globalAlpha = 1;
  text(ctx, str, x, y, 20, color || '#B33A2B', 'center', 600);
  ctx.restore();
}

function ring(ctx, x, y, r, color, width=3){
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
}

export function startGame(id, canvas, api){
  const ctx = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;

  let raf = 0, last = performance.now(), alive = true;
  let state = null;
  const keys = {};
  const pointer = { x:0, y:0, down:false };

  function toLocal(e){
    const r = canvas.getBoundingClientRect();
    return { x:(e.clientX-r.left)*W/r.width, y:(e.clientY-r.top)*H/r.height };
  }
  function onDown(e){ pointer.down = true; const p = toLocal(e); pointer.x=p.x; pointer.y=p.y;
    state && state.onPointer && state.onPointer(p.x,p.y,true); }
  function onMove(e){ const p = toLocal(e); pointer.x=p.x; pointer.y=p.y;
    state && state.onMove && state.onMove(p.x,p.y); }
  function onUp(){ pointer.down = false; state && state.onPointerUp && state.onPointerUp(); }
  function onKey(e){
    keys[e.code] = true;
    if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) e.preventDefault();
    if(e.code === 'Escape'){ finish(false, '已退出'); return; }
    state && state.onKey && state.onKey(e.code, true);
  }
  function onKeyUp(e){ keys[e.code] = false; state && state.onKeyUp && state.onKeyUp(e.code); }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  addEventListener('pointerup', onUp);
  addEventListener('keydown', onKey);
  addEventListener('keyup', onKeyUp);

  function finish(win, msg, detail){
    if(!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    api.onEnd({ win, msg, detail });
  }

  const games = {
    /* ---------------- 1. 控场 ---------------- */
    attention(){
      const seats = [];
      for(let r=0;r<4;r++) for(let c=0;c<6;c++)
        seats.push({ x: 120 + c*136, y: 250 + r*94, state:'ok', timer:0, flash:0, s:1.18 });
      let attention = 100, t = 0, spawn = .8, score = 0, ended = false;

      function spawnOne(){
        const ok = seats.filter(s=>s.state==='ok');
        if(!ok.length) return;
        const s = ok[(Math.random()*ok.length)|0];
        s.state = ['sleep','chat','phone'][(Math.random()*3)|0];
        s.timer = 2.6 + Math.random()*1.4;
      }
      return {
        update(dt){
          t += dt; attention -= dt*1.15;
          spawn -= dt;
          if(spawn <= 0){ spawn = .85 + Math.random()*.9; spawnOne(); }
          seats.forEach(s=>{
            if(s.state==='ok'){ s.flash = Math.max(0, s.flash-dt); return; }
            s.timer -= dt;
            if(s.timer <= 0 && s.state !== 'gone'){
              s.state = 'gone'; attention -= 9;
            }
          });
          if(attention <= 0 || t >= 30){
            if(!ended){ ended = true; finish(attention>0, attention>0?'讲完了。台下有人点头。':'台下已经没人听了。', `稳住 ${Math.round(attention)} 点注意力`); }
          }
        },
        draw(){
          backdrop(ctx);
          text(ctx, '把这场讲完', 76, 58, 32, '#2A2620', 'left', 600);
          text(ctx, `${Math.max(0,Math.ceil(30-t))}s`, W-76, 58, 26, '#7A6C57', 'right');
          // 注意力条
          const barW = 380, a = Math.max(0, attention)/100;
          ctx.fillStyle = 'rgba(255,255,255,.45)'; rr(ctx, 76, 86, barW, 14, 7); ctx.fill();
          ctx.fillStyle = a>.5?'#6E8A5A':a>.25?'#D9A94E':'#B33A2B';
          rr(ctx, 76, 86, barW*a, 14, 7); ctx.fill();
          text(ctx, '注意力', 76, 120, 16, '#7A6C57');

          seats.forEach(s=>{
            person(ctx, s.x, s.y, s.s||1.18, s.state==='ok'?'#4A463D':'#6B5B48', s.state==='sleep'?'sleep':'awake');
            if(s.state==='sleep'){
              text(ctx, '💤', s.x, s.y-(s.s||1.18)*44, 26, '#7A6C57', 'center');
            } else if(s.state==='chat'){
              text(ctx, '💬', s.x, s.y-(s.s||1.18)*44, 26, '#7A6C57', 'center');
            } else if(s.state==='phone'){
              text(ctx, '📱', s.x, s.y-(s.s||1.18)*44, 24, '#7A6C57', 'center');
            } else if(s.state==='gone'){
              ctx.globalAlpha = .28; person(ctx, s.x, s.y, s.s||1.18, '#4A463D', 'sleep'); ctx.globalAlpha = 1;
            }
            if(s.flash > 0){
              ctx.globalAlpha = s.flash;
              ring(ctx, s.x, s.y-46, 30, '#6E8A5A', 3);
              ctx.globalAlpha = 1;
            }
          });
        },
        onPointer(x,y){
          let hit = null, best = 46;
          seats.forEach(s=>{
            if(s.state==='ok') return;
            const d = Math.hypot(x-s.x, y-(s.y-52));
            if(d < best){ best = d; hit = s; }
          });
          if(hit){
            const wasGone = hit.state === 'gone';
            hit.state = 'ok'; hit.timer = 0; hit.flash = .45;
            attention = Math.min(100, attention + (wasGone?4:2));
            score++;
          }
        }
      };
    },

    /* ---------------- 3. 麦克风 ---------------- */
    mic(){
      let level = .15, t = 0, good = 0, bad = 0, ended = false, phase = 0;
      return {
        update(dt){
          t += dt; phase += dt;
          const target = .5 + Math.sin(phase*.55)*.2;
          if(pointer.down || keys['Space']) level += dt*1.9;
          else level -= dt*1.5;
          level = Math.max(0, Math.min(1, level));
          if(Math.abs(level - target) < .085) good += dt; else bad += dt;
          if(t >= 20){
            if(!ended){ ended = true; const ok = good >= 13;
              finish(ok, ok?'声音刚好，后排也听得见。':'有点飘，台下开始交头接耳。', `稳住 ${good.toFixed(1)} 秒`); }
          }
        },
        draw(){
          ctx.fillStyle = '#F4EAD3'; ctx.fillRect(0,0,W,H);
          text(ctx, '稳住麦克风', 40, 46, 30, '#2A2620', 'left', 600);
          text(ctx, `${Math.max(0,Math.ceil(20-t))}s`, W-40, 46, 24, '#7A6C57', 'right');
          const target = .5 + Math.sin(phase*.55)*.2;
          const x = 450, top = 100, h = 380;
          // 竖条
          ctx.fillStyle = '#E4D8BE'; rr(ctx, x-36, top, 72, h, 14); ctx.fill();
          // 绿区
          const gy = top + h*(1-target) - h*.085, gh = h*.17;
          ctx.fillStyle = 'rgba(110,138,90,.42)'; rr(ctx, x-42, gy, 84, gh, 10); ctx.fill();
          ctx.strokeStyle = '#6E8A5A'; ctx.lineWidth = 2; rr(ctx, x-42, gy, 84, gh, 10); ctx.stroke();
          // 指针
          const py = top + h*(1-level);
          ctx.fillStyle = '#B33A2B'; rr(ctx, x-56, py-10, 112, 20, 8); ctx.fill();
          text(ctx, '按住鼠标 / 空格 推音量，松开回落', x, H-42, 16, '#7A6C57', 'center');
          text(ctx, good.toFixed(1)+'s', x, H-14, 14, '#6E8A5A', 'center');
        }
      };
    },

    /* ---------------- 5. 掌声 ---------------- */
    clap(){
      let t = 0, idx = 0, ringR = 0, interval = 1.15, perfect = 0, good = 0, miss = 0;
      let beats = 20, ended = false, flash = 0;
      function nextBeat(){ idx++; interval = Math.max(.42, 1.15 - idx*.035); ringR = 220; }
      return {
        update(dt){
          t += dt; flash = Math.max(0, flash-dt*3);
          ringR -= dt * (220/interval);
          if(ringR <= 0){ if(idx < beats){ miss++; } nextBeat(); }
          if(idx >= beats){
            if(!ended){ ended = true;
              const acc = (perfect + good*.6) / beats;
              const ok = acc >= .7;
              finish(ok, ok?'掌声跟上了。':'节奏慢半拍。', `完美 ${perfect} · 跟上 ${good} · 漏 ${miss}`); }
          }
          if(t > 40 && !ended){ ended = true; finish(false,'超时'); }
        },
        draw(){
          ctx.fillStyle = '#F4EAD3'; ctx.fillRect(0,0,W,H);
          text(ctx, '掌声', 40, 46, 30, '#2A2620', 'left', 600);
          text(ctx, `${idx}/${beats}`, W-40, 46, 24, '#7A6C57', 'right');
          const cx = 450, cy = 300;
          ring(ctx, cx, cy, 78, '#C9B98F', 2);
          ring(ctx, cx, cy, 120, '#E0D3B8', 1);
          ring(ctx, cx, cy, ringR, flash>0?'#B33A2B':'#6E8A5A', 4);
          text(ctx, '👏', cx, cy, 54, '#2A2620', 'center');
          text(ctx, '光圈收到跟前时按 空格 / 点击', cx, H-40, 16, '#7A6C57', 'center');
          if(flash>0){ ctx.globalAlpha = flash; ctx.fillStyle='#FFF4D8'; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1; }
        },
        hit(){
          const d = Math.abs(ringR - 78);
          if(d < 16){ perfect++; flash = .35; }
          else if(d < 34){ good++; flash = .2; }
          else miss++;
          nextBeat();
        },
        onKey(code){ if(code === 'Space') this.hit(); },
        onPointer(){ this.hit(); }
      };
    },

    /* ---------------- 6. 递话筒 ---------------- */
    passmic(){
      const seats = [];
      for(let r=0;r<3;r++) for(let c=0;c<7;c++)
        seats.push({ x: 110 + c*112, y: 280 + r*86, up:0, life:0, s:1.35, color: ['#5A6B75','#7A5C46','#4A463D'][(r+c)%3] });
      let t = 0, hits = 0, misses = 0, spawn = .6, flying = [], ended = false;
      function raise(){
        const down = seats.filter(s=>!s.up);
        if(!down.length) return;
        const s = down[(Math.random()*down.length)|0];
        s.up = 1; s.life = 2.4;
      }
      return {
        update(dt){
          t += dt; spawn -= dt;
          if(spawn <= 0){ spawn = 1.1 + Math.random()*.8; raise(); }
          seats.forEach(s=>{
            if(!s.up) return;
            s.life -= dt;
            if(s.life <= 0){ s.up = 0; misses++; }
          });
          flying = flying.filter(f=>{
            f.t += dt*2.6;
            if(f.t >= 1) return false;
            return true;
          });
          if(t >= 30){
            if(!ended){ ended = true; const ok = hits >= 10;
              finish(ok, ok?'话筒递得稳。':'有几个人一直没发上言。', `递到 ${hits} 人 · 漏 ${misses} 人`); }
          }
        },
        draw(){
          backdrop(ctx);
          text(ctx, '递话筒', 76, 58, 32, '#2A2620', 'left', 600);
          text(ctx, `${Math.max(0,Math.ceil(30-t))}s · ${hits}/10`, W-76, 58, 26, '#7A6C57', 'right');
          seats.forEach(s=>{
            person(ctx, s.x, s.y, s.s||1.35, s.color, 'awake');
            if(s.up){
              // 举起的手
              ctx.strokeStyle = '#E9C6A2'; ctx.lineWidth = 7; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(s.x+10, s.y-2); ctx.lineTo(s.x+16, s.y-54); ctx.stroke();
              ctx.fillStyle = '#F0E0C6';
              ctx.beginPath(); ctx.arc(s.x+16, s.y-58, 8, 0, 7); ctx.fill();
            }
          });
          flying.forEach(f=>{
            const x = f.x0 + (f.x1-f.x0)*f.t;
            const y = f.y0 + (f.y1-f.y0)*f.t - Math.sin(f.t*Math.PI)*90;
            ctx.fillStyle = '#2E2A24';
            rr(ctx, x-7, y-16, 14, 22, 5); ctx.fill();
            ctx.beginPath(); ctx.arc(x, y-18, 8, 0, 7); ctx.fill();
          });
          text(ctx, '点举手的人，把话筒扔过去', 450, H-36, 16, '#7A6C57', 'center');
        },
        onPointer(x,y){
          let hit = null, best = 52;
          seats.forEach(s=>{
            if(!s.up) return;
            const d = Math.hypot(x-(s.x+16), y-(s.y-58));
            if(d < best){ best = d; hit = s; }
          });
          if(hit){
            hit.up = 0; hits++;
            flying.push({ x0:450, y0:H+30, x1:hit.x+16, y1:hit.y-58, t:0 });
          }
        }
      };
    },

    /* ---------------- 7. 接字 ---------------- */
    catch(){
      const sentence = '微里话初心宣时践使命';
      const chars = sentence.split('');
      const drops = [];
      let t = 0, got = 0, missed = 0, px = 450, spawn = .4, ended = false;
      const speedup = () => 1 + t*0.02;
      return {
        update(dt){
          t += dt; spawn -= dt;
          if(px < 30) px = 30; if(px > W-30) px = W-30;
          if(keys['ArrowLeft'] || keys['KeyA']) px -= 420*dt;
          if(keys['ArrowRight'] || keys['KeyD']) px += 420*dt;
          if(pointer.down) px += (pointer.x - px) * Math.min(1, dt*8);
          if(spawn <= 0){
            spawn = Math.max(.28, .62 - t*.008);
            drops.push({ x: 60 + Math.random()*(W-120), y: -30, ch: chars[(Math.random()*chars.length)|0], v: 150 + Math.random()*70 });
          }
          for(let i=drops.length-1;i>=0;i--){
            const d = drops[i];
            d.y += d.v * speedup() * dt;
            if(d.y > H-90 && Math.abs(d.x - px) < 44){
              drops.splice(i,1); got = Math.min(chars.length, got+1);
              if(got >= 12 && !ended){ ended = true; finish(true, '拼好了：「'+sentence+'」', `接住 ${got} 个字`); }
            } else if(d.y > H-20){
              drops.splice(i,1); missed++;
            }
          }
          if(t >= 30 && !ended){ ended = true;
            finish(got >= 8, got>=8?'字接得不错。':'掉了不少字。', `接住 ${got} 个 · 漏 ${missed} 个`); }
        },
        draw(){
          ctx.fillStyle = '#F4EAD3'; ctx.fillRect(0,0,W,H);
          text(ctx, '接字', 40, 46, 30, '#2A2620', 'left', 600);
          text(ctx, `${Math.max(0,Math.ceil(30-t))}s · ${got}/12`, W-40, 46, 24, '#7A6C57', 'right');
          text(ctx, sentence.split('').map((c,i)=> i<got? c : '·').join(' '), 450, 96, 24, '#B33A2B', 'center');
          drops.forEach(d=>{
            text(ctx, d.ch, d.x, d.y, 34, '#2A2620', 'center', 600);
          });
          // 角色（接字）
          ctx.fillStyle = '#3C3A34';
          rr(ctx, px-26, H-80, 52, 34, 8); ctx.fill();
          ctx.fillStyle = '#E9C6A2';
          ctx.beginPath(); ctx.arc(px, H-92, 16, 0, 7); ctx.fill();
          ctx.fillStyle = '#2A241E';
          ctx.beginPath(); ctx.arc(px, H-100, 15, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#B33A2B';
          rr(ctx, px-30, H-96, 60, 10, 5); ctx.fill();
          text(ctx, '← →  /  A D  或拖动', 450, H-24, 15, '#7A6C57', 'center');
        },
        onPointer(x){ px = x; }
      };
    },

    /* ---------------- 8. 翻页 ---------------- */
    flip(){
      let t = 0, score = 0, target = 1, cards = [1,2,3], shuffle = 0, ended = false, flash=0, bad=0;
      function newRound(){
        target = 1 + ((Math.random()*12)|0);
        cards = [1,2,3].map(()=> 1 + ((Math.random()*12)|0));
        if(!cards.includes(target)) cards[(Math.random()*3)|0] = target;
      }
      newRound();
      return {
        update(dt){
          t += dt; shuffle -= dt; flash = Math.max(0, flash-dt*3);
          if(shuffle <= 0){
            shuffle = Math.max(.45, 1.1 - t*.02);
            // 只打乱非目标卡，避免一直变
            cards = [1,2,3].map(()=> 1+((Math.random()*12)|0));
            cards[(Math.random()*3)|0] = target;
          }
          if(t >= 30 && !ended){ ended = true;
            finish(score >= 10, score>=10?'页面一直是对的。':'翻得有点乱。', `答对 ${score} 次 · 错 ${bad} 次`); }
        },
        draw(){
          ctx.fillStyle = '#F4EAD3'; ctx.fillRect(0,0,W,H);
          text(ctx, '翻页', 40, 46, 30, '#2A2620', 'left', 600);
          text(ctx, `${Math.max(0,Math.ceil(30-t))}s · ${score}/10`, W-40, 46, 24, '#7A6C57', 'right');
          text(ctx, '该讲第', 450, 130, 22, '#7A6C57', 'center');
          text(ctx, `${target} 页`, 450, 186, 54, '#B33A2B', 'center', 700);
          cards.forEach((n,i)=>{
            const x = 170 + i*230, y = 250, w = 190, h = 210;
            ctx.fillStyle = flash>0 && n===target ? '#FFF6DF' : '#FBF4E2';
            rr(ctx, x, y, w, h, 8); ctx.fill();
            ctx.strokeStyle = '#C9B98F'; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 8); ctx.stroke();
            text(ctx, String(n), x+w/2, y+h/2, 72, '#2A2620', 'center', 600);
            text(ctx, '第 ' + n + ' 页', x+w/2, y+h-28, 15, '#7A6C57', 'center');
          });
          text(ctx, '点“该讲的那一页”', 450, H-34, 16, '#7A6C57', 'center');
        },
        onPointer(x,y){
          if(y < 250 || y > 460) return;
          const i = Math.floor((x-170)/230);
          if(i<0 || i>2) return;
          if(cards[i] === target){ score++; flash = .4; newRound(); }
          else { bad++; score = Math.max(0, score-1); }
        }
      };
    }
  };

  const make = games[id];
  if(!make){ api.onEnd({ win:false, msg:'没有这个游戏' }); return { stop(){} }; }
  state = make();

  let acc = 0;
  function loop(now){
    if(!alive) return;
    const dt = Math.min(.05, (now-last)/1000); last = now;
    state.update && state.update(dt);
    if(!alive) return;
    state.draw && state.draw();
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  return {
    stop(){
      alive = false; cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('keydown', onKey);
      removeEventListener('keyup', onKeyUp);
    }
  };
}

/*
 * KV：写真の上に果物が降ってくる。果物をつかんで投げて、果物かごのゴールに入れられる
 * 物理演算に matter.js（js/vendor/matter.min.js）を使用
 *
 * 操作
 *  - 果物をつかんで（ドラッグして）離すと、その勢いで飛んでいく
 *  - 果物をタップするとポンと跳ねる
 *  - PCではマウスを動かすと果物を押しのけられる
 *  - 果物のないところをスワイプした場合は、ふつうにページがスクロールする
 */
(function () {
  "use strict";
  var M = window.Matter, FR = window.MIKAWA_FRUITS;
  var hero = document.querySelector("[data-hero]");
  var canvas = document.querySelector("[data-hero-canvas]");
  if (!M || !FR || !hero || !canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var engine = M.Engine.create({ gravity: { x: 0, y: 1.1 }, enableSleeping: true });
  var world = engine.world;
  var kinds = Object.keys(FR);
  var images = {};
  kinds.forEach(function (k) { var im = new Image(); im.src = FR[k].url; images[k] = im; });

  var allDropped = false, W = 0, H = 0, dpr = 1, walls = [], fruits = [], running = false, inView = true, raf = 0;
  var bubble = document.querySelector("[data-hero-bubble]");
  var scoreEl = document.querySelector("[data-hero-score]");
  var score = 0;

  /* ---- ゴール（果物かご）の位置と大きさ ---- */
  var G = { x: 0, y: 0, half: 0, boardX: 0, boardTop: 0, boardBottom: 0, netDepth: 0, swish: 0 };
  function layoutGoal() {
    var r = radiusBase();
    var mobile = W < 700;
    G.half = r * 1.75;                                   /* 輪の半径（果物よりひと回り大きく） */
    G.boardX = W - (mobile ? 14 : Math.max(40, W * 0.06));
    G.x = G.boardX - 10 - G.half;                         /* 輪の中心 */
    G.y = Math.round(H * (mobile ? 0.6 : 0.42));          /* 輪の高さ */
    G.boardTop = G.y - r * 3.4;
    G.boardBottom = G.y + r * 0.9;
    G.netDepth = r * 2.1;
  }

  function size() {
    var rect = hero.getBoundingClientRect();
    W = Math.round(rect.width); H = Math.round(rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    layoutGoal();
    walls.forEach(function (w) { M.Composite.remove(world, w); });
    var t = 200, opt = { isStatic: true, friction: 0.4, restitution: 0.2 };
    var rimOpt = { isStatic: true, restitution: 0.5, friction: 0.1 };
    var boardH = G.boardBottom - G.boardTop;
    walls = [
      M.Bodies.rectangle(W / 2, H + t / 2, W * 3, t, opt),
      M.Bodies.rectangle(-t / 2, H / 2 - H, t, H * 4, opt),
      M.Bodies.rectangle(W + t / 2, H / 2 - H, t, H * 4, opt),
      /* ボード（木の板）と輪の左右の縁 */
      M.Bodies.rectangle(G.boardX + 4, G.boardTop + boardH / 2, 8, boardH, { isStatic: true, restitution: 0.4 }),
      M.Bodies.circle(G.x - G.half, G.y, 4, rimOpt),
      M.Bodies.circle(G.x + G.half, G.y, 4, rimOpt)
    ];
    M.Composite.add(world, walls);
    fruits.forEach(function (b) {
      if (b.position.x > W - 10 || b.position.y > H) M.Body.setPosition(b, { x: Math.min(W - 40, Math.max(40, b.position.x)), y: H - 80 });
    });
  }

  function radiusBase() { return W < 600 ? 24 : W < 1100 ? 32 : 38; }
  function count() { return W < 600 ? 18 : W < 1100 ? 22 : 28; }

  function addFruit(i) {
    var k = kinds[i % kinds.length];
    var rr = radiusBase() * FR[k].r * (0.85 + Math.random() * 0.3);
    /* ゴールの真上には落とさない */
    var x = 40 + Math.random() * Math.max(40, (G.x - G.half - 30) - 40);
    var b = M.Bodies.circle(x, -60 - Math.random() * 200, rr, {
      restitution: 0.45, friction: 0.25, frictionAir: 0.008, density: 0.002
    });
    b.kind = k; b.rr = rr; b.prevY = b.position.y; b.lastGoal = 0;
    M.Body.setAngle(b, Math.random() * Math.PI * 2);
    M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.2);
    fruits.push(b);
    M.Composite.add(world, b);
  }

  /* ---- 描画 ---- */
  function drawBoard() {
    var r = radiusBase();
    var w = r * 1.1, top = G.boardTop, h = G.boardBottom - G.boardTop;
    /* 支柱 */
    ctx.fillStyle = "rgba(29,75,51,.85)";
    ctx.fillRect(G.boardX, G.boardBottom - 2, 6, H - G.boardBottom + 2);
    /* 木の板 */
    ctx.save();
    ctx.translate(G.boardX - w + 8, top);
    ctx.fillStyle = "#c99c62";
    roundRect(0, 0, w, h, 6); ctx.fill();
    ctx.strokeStyle = "rgba(90,58,20,.35)"; ctx.lineWidth = 1;
    for (var y = 6; y < h; y += 7) { ctx.beginPath(); ctx.moveTo(4, y); ctx.lineTo(w - 4, y); ctx.stroke(); }
    /* 帯（美川青果） */
    ctx.fillStyle = "#1d4b33";
    roundRect(w * 0.18, h * 0.08, w * 0.64, h * 0.6, 3); ctx.fill();
    ctx.fillStyle = "#f6f1e4";
    ctx.font = (r * 0.42) + "px 'Dela Gothic One', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var chars = ["美", "川", "青", "果"];
    for (var i = 0; i < 4; i++) ctx.fillText(chars[i], w / 2, h * 0.08 + h * 0.6 * (i + 0.5) / 4);
    ctx.restore();
  }
  function drawNet(front) {
    /* 果物かごのような編み目のネット。ゴールが決まると少し揺れる */
    var sw = G.swish > 0 ? Math.sin(G.swish * 0.6) * 4 * (G.swish / 30) : 0;
    var topL = G.x - G.half, topR = G.x + G.half;
    var botL = G.x - G.half * 0.62 + sw, botR = G.x + G.half * 0.62 + sw, botY = G.y + G.netDepth;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topL, G.y); ctx.lineTo(topR, G.y); ctx.lineTo(botR, botY); ctx.lineTo(botL, botY); ctx.closePath();
    if (!front) {
      ctx.fillStyle = "rgba(185,142,87,.35)";
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.clip();
    ctx.strokeStyle = "rgba(246,241,228,.9)";
    ctx.lineWidth = 2;
    var step = G.half / 2.6, span = G.netDepth + G.half * 2;
    for (var x = topL - span; x < topR + span; x += step) {
      ctx.beginPath(); ctx.moveTo(x, G.y); ctx.lineTo(x + span, G.y + span); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, G.y); ctx.lineTo(x - span, G.y + span); ctx.stroke();
    }
    ctx.restore();
    /* かごの縁取り */
    ctx.save();
    ctx.strokeStyle = "rgba(201,156,98,.95)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(botL, botY); ctx.lineTo(botR, botY); ctx.stroke();
    ctx.restore();
  }
  function drawRim() {
    ctx.save();
    ctx.strokeStyle = "#f28c18"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(G.x - G.half, G.y); ctx.lineTo(G.x + G.half + 8, G.y); ctx.stroke();
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawBoard();
    drawNet(false);
    for (var i = 0; i < fruits.length; i++) {
      var b = fruits[i], im = images[b.kind], s = b.rr * 2.2;
      if (!im.complete) continue;
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(b.angle);
      ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
      if (b === grab.body) { ctx.scale(1.08, 1.08); }
      ctx.drawImage(im, -s / 2, -s / 2, s, s);
      ctx.restore();
    }
    drawNet(true);
    drawRim();
  }

  /* ---- ゴール判定：輪の上から下へ、輪の内側を通過したら1点 ---- */
  M.Events.on(engine, "afterUpdate", function () {
    var now = performance.now();
    for (var i = 0; i < fruits.length; i++) {
      var b = fruits[i], y = b.position.y, x = b.position.x;
      if (b !== grab.body && now - (b.touched || -1e9) < 5000 && b.prevY < G.y && y >= G.y && b.velocity.y > 0 &&
          x > G.x - G.half + 2 && x < G.x + G.half - 2 && now - b.lastGoal > 800) {
        b.lastGoal = now;
        goal(b);
      }
      b.prevY = y;
    }
    if (G.swish > 0) G.swish--;
  });

  var LINES = ["ナイスシュート！", "入った！", "お見事！", "ゴール！"];
  function goal(b) {
    score++;
    G.swish = 30;
    say(LINES[Math.floor(Math.random() * LINES.length)], G.x, G.y - radiusBase() * 3.6);
    if (scoreEl) {
      scoreEl.hidden = false;
      scoreEl.textContent = score + " ゴール";
      scoreEl.classList.remove("is-pop"); void scoreEl.offsetWidth; scoreEl.classList.add("is-pop");
    }
  }

  var last = 0;
  function loop(t) {
    raf = 0;
    if (!running || !inView || document.hidden) return;
    var dt = last ? Math.min(t - last, 32) : 16.7; last = t;
    M.Engine.update(engine, dt);
    draw();
    /* 全部止まったらループを休ませる（電池にやさしく） */
    if (allDropped && !grab.body && G.swish <= 0 && fruits.every(function (b) { return b.isSleeping; })) return;
    raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && running && inView && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } }

  function hit(x, y) {
    for (var i = fruits.length - 1; i >= 0; i--) {
      var b = fruits[i], dx = b.position.x - x, dy = b.position.y - y;
      var rr = b.rr + (W < 600 ? 12 : 8);
      if (dx * dx + dy * dy < rr * rr) return b;
    }
    return null;
  }

  var bubbleTimer = 0;
  function say(text, x, y) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.left = Math.min(W - 60, Math.max(60, x)) + "px";
    bubble.style.top = Math.max(70, y) + "px";
    bubble.classList.remove("is-on"); void bubble.offsetWidth; bubble.classList.add("is-on");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.classList.remove("is-on"); }, 1100);
  }

  /* ---- つかんで投げる ---- */
  var grab = { body: null, id: null, x: 0, y: 0, hist: [], startT: 0, moved: 0 };
  function local(e) { var r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  /* 果物に触れたときだけスクロールを止める（果物以外ならふつうにスクロールできる） */
  hero.addEventListener("touchstart", function (e) {
    if (!running || e.touches.length !== 1 || e.target.closest("a, button")) return;
    var r = hero.getBoundingClientRect(), t = e.touches[0];
    if (hit(t.clientX - r.left, t.clientY - r.top)) e.preventDefault();
  }, { passive: false });

  hero.addEventListener("pointerdown", function (e) {
    if (!running || grab.body || e.target.closest("a, button")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    var p = local(e), b = hit(p.x, p.y);
    if (!b) return;
    grab.body = b; grab.id = e.pointerId; grab.x = p.x; grab.y = p.y;
    grab.hist = [{ x: p.x, y: p.y, t: performance.now() }]; grab.startT = performance.now(); grab.moved = 0;
    grab.offX = b.position.x - p.x; grab.offY = b.position.y - p.y;
    M.Sleeping.set(b, false);
    try { hero.setPointerCapture(e.pointerId); } catch (err) {}
    hero.classList.add("is-grabbing");
    kick();
  });
  hero.addEventListener("pointermove", function (e) {
    var p = local(e);
    if (grab.body && e.pointerId === grab.id) {
      grab.moved += Math.abs(p.x - grab.x) + Math.abs(p.y - grab.y);
      grab.x = p.x; grab.y = p.y;
      grab.hist.push({ x: p.x, y: p.y, t: performance.now() });
      if (grab.hist.length > 6) grab.hist.shift();
      return;
    }
    if (e.pointerType === "mouse") pushAround(p);
  });
  function release(e) {
    if (!grab.body || e.pointerId !== grab.id) return;
    var b = grab.body, h = grab.hist, now = performance.now();
    grab.body = null;
    b.touched = now;
    hero.classList.remove("is-grabbing");
    if (grab.moved < 8 && now - grab.startT < 300) {
      /* ほぼ動かさずに離した → タップ扱いで跳ねる */
      M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 8, y: -(9 + Math.random() * 5) });
      M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.5);
      say(FR[b.kind].name, b.position.x, b.position.y - b.rr - 60);
    } else {
      /* 直近の指の動きから投げる速さを計算 */
      var a = h[0], z = h[h.length - 1], dt = Math.max(16, z.t - a.t);
      var vx = (z.x - a.x) / dt * 16.7, vy = (z.y - a.y) / dt * 16.7;
      var max = 32, sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > max) { vx *= max / sp; vy *= max / sp; }
      M.Body.setVelocity(b, { x: vx, y: vy });
      M.Body.setAngularVelocity(b, vx * 0.02);
    }
    kick();
  }
  hero.addEventListener("pointerup", release);
  hero.addEventListener("pointercancel", release);

  /* つかんでいる果物を指に追従させる */
  M.Events.on(engine, "beforeUpdate", function () {
    var b = grab.body;
    if (!b) return;
    var tx = Math.min(W - b.rr, Math.max(b.rr, grab.x + grab.offX));
    var ty = Math.min(H - b.rr, Math.max(b.rr, grab.y + grab.offY));
    M.Body.setVelocity(b, { x: (tx - b.position.x) * 0.5, y: (ty - b.position.y) * 0.5 });
    M.Body.setPosition(b, { x: b.position.x + (tx - b.position.x) * 0.5, y: b.position.y + (ty - b.position.y) * 0.5 });
    M.Body.setAngularVelocity(b, b.angularVelocity * 0.8);
  });

  /* ---- PC：マウスで果物を押せる ---- */
  var px = null, py = null;
  function pushAround(p) {
    if (px !== null) {
      var vx = p.x - px, vy = p.y - py;
      for (var i = 0; i < fruits.length; i++) {
        var b = fruits[i], dx = b.position.x - p.x, dy = b.position.y - p.y, rr = b.rr + 14;
        if (dx * dx + dy * dy < rr * rr && (Math.abs(vx) + Math.abs(vy)) > 6) {
          M.Sleeping.set(b, false); kick();
          M.Body.setVelocity(b, { x: b.velocity.x + vx * 0.3, y: b.velocity.y + Math.min(vy * 0.3, 2) - 1 });
        }
      }
    }
    px = p.x; py = p.y;
    hero.style.cursor = hit(p.x, p.y) ? "grab" : "";
  }
  hero.addEventListener("pointerleave", function () { px = py = null; });

  /* ---- 表示中だけ動かす ---- */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; kick(); }).observe(hero);
  }
  document.addEventListener("visibilitychange", kick);
  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { size(); fruits.forEach(function (b) { M.Sleeping.set(b, false); }); draw(); kick(); }, 150);
  });

  function start() {
    size();
    var n = count();
    if (reduce) {
      /* 動きを減らす設定：最初から積み上がった状態で表示 */
      for (var i = 0; i < n; i++) addFruit(i);
      for (var s = 0; s < 400; s++) M.Engine.update(engine, 16.7);
      allDropped = true;
      running = true;
      var wait = setInterval(function () {
        if (kinds.every(function (k) { return images[k].complete; })) { clearInterval(wait); draw(); }
      }, 50);
      return;
    }
    running = true;
    var j = 0;
    var drop = setInterval(function () {
      addFruit(j++);
      if (j >= n) { clearInterval(drop); allDropped = true; }
    }, 110);
    kick();
  }

  /* 動作確認用（URLに ?kvdebug を付けたときだけ） */
  if (/kvdebug/.test(location.search)) window.__kv = { fruits: fruits, G: G };

  /* フォントを読み込んでからボードの文字を描く */
  var go = function () { setTimeout(start, reduce ? 0 : 700); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
})();

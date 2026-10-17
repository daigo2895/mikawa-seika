/*
 * KV：写真の上に果物が降ってくる。果物をつかんで投げて、中央の玉入れのかごに入れられる
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

  /* ---- ゴール：中央に立てた玉入れのかご ---- */
  var G = { x: 0, rimY: 0, half: 0, bottomHalf: 0, bottomY: 0, band: 0, swish: 0 };
  function layoutGoal() {
    var r = radiusBase();
    var mobile = W < 700;
    G.x = Math.round(W / 2);
    G.half = r * 2.5;                                   /* かごの口の半分の幅 */
    G.bottomHalf = r * 1.8;                             /* かごの底の半分の幅 */
    G.rimY = Math.round(H * (mobile ? 0.56 : 0.6));     /* かごの口の高さ */
    G.bottomY = G.rimY + r * 2.1;
    G.band = r * 0.5;                                   /* 口の帯の太さ */
  }
  function segment(x1, y1, x2, y2, th, opt) {
    var dx = x2 - x1, dy = y2 - y1;
    return M.Bodies.rectangle((x1 + x2) / 2, (y1 + y2) / 2, Math.sqrt(dx * dx + dy * dy), th,
      Object.assign({ isStatic: true, angle: Math.atan2(dy, dx) }, opt));
  }
  /* その位置での、かごの内側の半分の幅 */
  function innerHalf(y) {
    var t = Math.min(1, Math.max(0, (y - G.rimY) / (G.bottomY - G.rimY)));
    return G.half + (G.bottomHalf - G.half) * t - 6;
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
    var basket = { restitution: 0.25, friction: 0.3 };
    walls = [
      M.Bodies.rectangle(W / 2, H + t / 2, W * 3, t, opt),
      M.Bodies.rectangle(-t / 2, H / 2 - H, t, H * 4, opt),
      M.Bodies.rectangle(W + t / 2, H / 2 - H, t, H * 4, opt),
      /* かごの左右の壁と底、支柱 */
      segment(G.x - G.half, G.rimY, G.x - G.bottomHalf, G.bottomY, 8, basket),
      segment(G.x + G.half, G.rimY, G.x + G.bottomHalf, G.bottomY, 8, basket),
      segment(G.x - G.bottomHalf, G.bottomY, G.x + G.bottomHalf, G.bottomY, 8, basket),
      M.Bodies.rectangle(G.x, (G.bottomY + H) / 2, 10, H - G.bottomY, { isStatic: true, restitution: 0.3 })
    ];
    M.Composite.add(world, walls);
    fruits.forEach(function (b) {
      if (b.position.x > W - 10 || b.position.y > H || isInBasket(b)) respawn(b);
    });
  }

  function radiusBase() { return W < 600 ? 24 : W < 1100 ? 32 : 38; }
  function count() { return W < 600 ? 18 : W < 1100 ? 22 : 28; }

  /* かごと支柱の真上を避けて、左右どちらかに落とす */
  function spawnX() {
    var gap = G.half + 30, left = Math.random() < 0.5;
    var lo = left ? 40 : G.x + gap, hi = left ? G.x - gap : W - 40;
    if (hi - lo < 20) { lo = 40; hi = W - 40; }
    return lo + Math.random() * (hi - lo);
  }
  function addFruit(i) {
    var k = kinds[i % kinds.length];
    var rr = radiusBase() * FR[k].r * (0.85 + Math.random() * 0.3);
    var b = M.Bodies.circle(spawnX(), -60 - Math.random() * 200, rr, {
      restitution: 0.45, friction: 0.25, frictionAir: 0.008, density: 0.002
    });
    b.kind = k; b.rr = rr; b.counted = false; b.insideSince = 0;
    M.Body.setAngle(b, Math.random() * Math.PI * 2);
    M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.2);
    fruits.push(b);
    M.Composite.add(world, b);
  }
  function respawn(b) {
    M.Sleeping.set(b, false);
    M.Body.setPosition(b, { x: spawnX(), y: -60 - Math.random() * 120 });
    M.Body.setVelocity(b, { x: 0, y: 0 });
    b.counted = false; b.insideSince = 0; b.touched = 0;
  }
  function isInBasket(b) {
    var y = b.position.y;
    return y > G.rimY && y < G.bottomY + 4 && Math.abs(b.position.x - G.x) < innerHalf(y);
  }

  /* ---- 描画 ---- */
  function drawPole() {
    /* 紅白ではなく、お店の深緑と生成りのしま模様の支柱 */
    var w = 10, top = G.bottomY, x = G.x - w / 2;
    ctx.save();
    ctx.fillStyle = "#1d4b33"; ctx.fillRect(x, top, w, H - top);
    ctx.fillStyle = "#f6f1e4";
    for (var y = top + 18; y < H; y += 36) ctx.fillRect(x, y, w, 18);
    ctx.restore();
  }
  function basketPath() {
    ctx.beginPath();
    ctx.moveTo(G.x - G.half, G.rimY); ctx.lineTo(G.x + G.half, G.rimY);
    ctx.lineTo(G.x + G.bottomHalf, G.bottomY); ctx.lineTo(G.x - G.bottomHalf, G.bottomY); ctx.closePath();
  }
  function drawBasketBack() {
    ctx.save();
    basketPath();
    ctx.fillStyle = "rgba(90,58,20,.45)";
    ctx.fill();
    ctx.restore();
  }
  function drawBasketFront() {
    var sw = G.swish > 0 ? Math.sin(G.swish * 0.7) * 3 * (G.swish / 30) : 0;
    ctx.save();
    ctx.translate(sw, 0);
    /* 竹かごの編み目（中の果物が透けて見える） */
    basketPath(); ctx.save(); ctx.clip();
    ctx.strokeStyle = "rgba(233,207,160,.95)"; ctx.lineWidth = 3;
    var step = G.half / 3, span = (G.bottomY - G.rimY) + G.half * 2;
    for (var x = G.x - G.half - span; x < G.x + G.half + span; x += step) {
      ctx.beginPath(); ctx.moveTo(x, G.rimY); ctx.lineTo(x + span, G.rimY + span); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, G.rimY); ctx.lineTo(x - span, G.rimY + span); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "#b98e57"; ctx.lineWidth = 4; ctx.lineJoin = "round";
    basketPath(); ctx.stroke();
    /* 口の帯（美川青果） */
    var bw = G.half * 2 + 10, bx = G.x - bw / 2, by = G.rimY - G.band / 2;
    ctx.fillStyle = "#1d4b33";
    roundRect(bx, by, bw, G.band, G.band / 2); ctx.fill();
    ctx.strokeStyle = "#f28c18"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#f6f1e4";
    ctx.font = (G.band * 0.62) + "px 'Dela Gothic One', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("美 川 青 果", G.x, G.rimY + 1);
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawFruit(b) {
    var im = images[b.kind], s = b.rr * 2.2;
    if (!im.complete) return;
    ctx.save();
    ctx.translate(b.position.x, b.position.y);
    ctx.rotate(b.angle);
    ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    if (b === grab.body) { ctx.scale(1.08, 1.08); }
    ctx.drawImage(im, -s / 2, -s / 2, s, s);
    ctx.restore();
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawPole();
    drawBasketBack();
    var outside = [];
    for (var i = 0; i < fruits.length; i++) {
      if (isInBasket(fruits[i])) drawFruit(fruits[i]); else outside.push(fruits[i]);
    }
    drawBasketFront();
    for (var j = 0; j < outside.length; j++) drawFruit(outside[j]);
  }

  /* ---- 判定：自分で投げた果物がかごに入ったら1点。少しすると外に戻る ---- */
  M.Events.on(engine, "afterUpdate", function () {
    var now = performance.now();
    for (var i = 0; i < fruits.length; i++) {
      var b = fruits[i];
      if (b === grab.body || !isInBasket(b)) { b.insideSince = 0; continue; }
      if (!b.insideSince) b.insideSince = now;
      if (!b.counted && now - (b.touched || -1e9) < 6000) { b.counted = true; goal(b); }
      /* かごの中に2秒ほどたまったら、また上から降ってくる */
      if (now - b.insideSince > 2000) respawn(b);
    }
    if (G.swish > 0) G.swish--;
  });

  var LINES = ["ナイスシュート！", "入った！", "お見事！", "ゴール！"];
  function goal(b) {
    score++;
    G.swish = 30;
    say(LINES[Math.floor(Math.random() * LINES.length)], G.x, G.rimY - radiusBase() * 3);
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
    if (allDropped && !grab.body && G.swish <= 0 && fruits.every(function (b) { return b.isSleeping && !b.insideSince; })) return;
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
    e.preventDefault(); /* 背景写真がドラッグされてつかみが外れるのを防ぐ */
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
      /* 離す直前（0.1秒以内）の指の動きだけを使う。止めてから離したら、そっと落ちる */
      var recent = h.filter(function (q) { return now - q.t < 100; });
      var vx = 0, vy = 0;
      if (recent.length >= 2) {
        var a = recent[0], z = recent[recent.length - 1], dt = Math.max(16, z.t - a.t);
        vx = (z.x - a.x) / dt * 16.7; vy = (z.y - a.y) / dt * 16.7;
      }
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
  if (/kvdebug/.test(location.search)) window.__kv = { fruits: fruits, G: G, grab: grab };

  /* フォントを読み込んでからボードの文字を描く */
  var go = function () { setTimeout(start, reduce ? 0 : 700); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
})();

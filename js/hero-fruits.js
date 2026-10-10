/*
 * KV：写真の上に果物が降ってきて、タップすると跳ねる仕掛け
 * 物理演算に matter.js（js/vendor/matter.min.js）を使用
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

  function size() {
    var r = hero.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    walls.forEach(function (w) { M.Composite.remove(world, w); });
    var t = 200, opt = { isStatic: true, friction: 0.4, restitution: 0.2 };
    walls = [
      M.Bodies.rectangle(W / 2, H + t / 2, W * 3, t, opt),
      M.Bodies.rectangle(-t / 2, H / 2 - H, t, H * 4, opt),
      M.Bodies.rectangle(W + t / 2, H / 2 - H, t, H * 4, opt)
    ];
    M.Composite.add(world, walls);
    fruits.forEach(function (b) {
      if (b.position.x > W - 10 || b.position.y > H) M.Body.setPosition(b, { x: Math.min(W - 40, Math.max(40, b.position.x)), y: H - 80 });
    });
  }

  function radiusBase() { return W < 600 ? 24 : W < 1100 ? 32 : 38; }
  function count() { return W < 600 ? 20 : W < 1100 ? 24 : 30; }

  function addFruit(i) {
    var k = kinds[i % kinds.length];
    var rr = radiusBase() * FR[k].r * (0.85 + Math.random() * 0.35);
    var b = M.Bodies.circle(40 + Math.random() * (W - 80), -60 - Math.random() * 200, rr, {
      restitution: 0.45, friction: 0.25, frictionAir: 0.008, density: 0.002
    });
    b.kind = k; b.rr = rr;
    M.Body.setAngle(b, Math.random() * Math.PI * 2);
    M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.2);
    fruits.push(b);
    M.Composite.add(world, b);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < fruits.length; i++) {
      var b = fruits[i], im = images[b.kind], s = b.rr * 2.2;
      if (!im.complete) continue;
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(b.angle);
      ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
      ctx.drawImage(im, -s / 2, -s / 2, s, s);
      ctx.restore();
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
    if (allDropped && fruits.every(function (b) { return b.isSleeping; })) return;
    raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && running && inView && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } }

  /* ---- タップで跳ねる ---- */
  function hit(x, y) {
    for (var i = fruits.length - 1; i >= 0; i--) {
      var b = fruits[i], dx = b.position.x - x, dy = b.position.y - y;
      if (dx * dx + dy * dy < (b.rr + 8) * (b.rr + 8)) return b;
    }
    return null;
  }
  var bubbleTimer = 0;
  function say(b) {
    if (!bubble) return;
    bubble.textContent = FR[b.kind].name;
    bubble.style.left = b.position.x + "px";
    bubble.style.top = Math.max(70, b.position.y - b.rr - 60) + "px";
    bubble.classList.remove("is-on"); void bubble.offsetWidth; bubble.classList.add("is-on");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.classList.remove("is-on"); }, 1100);
  }
  hero.addEventListener("click", function (e) {
    if (e.target.closest("a, button")) return;
    var r = hero.getBoundingClientRect();
    var b = hit(e.clientX - r.left, e.clientY - r.top);
    if (!b) return;
    M.Sleeping.set(b, false);
    M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 8, y: -(9 + Math.random() * 5) });
    M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.5);
    say(b);
    kick();
  });

  /* ---- PC：マウスで果物を押せる ---- */
  var px = null, py = null;
  hero.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (px !== null) {
      var vx = x - px, vy = y - py;
      for (var i = 0; i < fruits.length; i++) {
        var b = fruits[i], dx = b.position.x - x, dy = b.position.y - y, rr = b.rr + 18;
        if (dx * dx + dy * dy < rr * rr) {
          M.Sleeping.set(b, false); kick();
          M.Body.setVelocity(b, { x: b.velocity.x + vx * 0.35, y: b.velocity.y + Math.min(vy * 0.35, 2) - 1.5 });
        }
      }
    }
    px = x; py = y;
    hero.style.cursor = hit(x, y) ? "pointer" : "";
  });
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

  /* KVの文字が先に見えてから降らせる */
  setTimeout(start, reduce ? 0 : 700);
})();

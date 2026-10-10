/*
 * 運命の品種：好きな果物をひとつ箱に詰めてふたをすると、その果物の品種がランダムに1つ出てくる
 * データ：js/varieties.js（元データは data/varieties.csv）
 * 見つけた品種は、その人のブラウザだけに記録されます（図鑑）。全体の品種数は表示しません。
 */
(function () {
  "use strict";
  var FR = window.MIKAWA_FRUITS, DB = window.MIKAWA_VARIETIES;
  var tray = document.querySelector("[data-unmei-picker]");
  var dialog = document.querySelector("[data-reveal]");
  var box = document.querySelector("[data-gbox]");
  if (!FR || !DB || !tray || !dialog || !box) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pocket = box.querySelector("[data-pocket]");
  var btnSeal = document.querySelector("[data-seal]");
  var status = document.querySelector("[data-unmei-status]");
  var LABEL = { mikan: "みかん・柑橘", ringo: "りんご", budou: "ぶどう", kaki: "かき", nashi: "なし", kiwi: "キウイ", momo: "もも" };
  var ORDER = ["mikan", "ringo", "budou", "kaki", "nashi", "kiwi", "momo"];
  var byFruit = {};
  DB.forEach(function (v) { (byFruit[v.fruit] = byFruit[v.fruit] || []).push(v); });
  var kinds = ORDER.filter(function (k) { return byFruit[k] && FR[k]; });

  /* ---- 図鑑（ブラウザに保存。使えない環境では、このページを開いている間だけ記録） ---- */
  var KEY = "mikawa-zukan-v1";
  var found = {};
  try { found = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { found = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(found)); } catch (e) {} }

  var countEl = document.querySelector("[data-zukan-count]");
  var listEl = document.querySelector("[data-zukan-list]");
  function renderZukan() {
    var n = DB.filter(function (v) { return found[v.id]; }).length;
    countEl.textContent = n === 0
      ? "出会った品種は、ここに記録されていきます。"
      : "これまでに出会った品種：" + n + "品種";
    listEl.innerHTML = "";
    kinds.forEach(function (k) {
      var got = byFruit[k].filter(function (v) { return found[v.id]; });
      if (!got.length) return;
      var p = document.createElement("p");
      p.className = "zukan__row";
      var head = document.createElement("strong");
      head.textContent = LABEL[k] + "：";
      p.appendChild(head);
      p.appendChild(document.createTextNode(got.map(function (v) { return v.name; }).join("、")));
      listEl.appendChild(p);
    });
    if (!listEl.childNodes.length) listEl.textContent = "まだありません。";
  }

  /* ---- 果物のトレー ---- */
  kinds.forEach(function (k) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tray-fruit";
    b.setAttribute("data-kind", k);
    b.setAttribute("aria-label", LABEL[k] + "を箱に詰める");
    b.innerHTML = '<img src="' + FR[k].url + '" alt="" width="56" height="56"><span>' + LABEL[k] + "</span>";
    tray.appendChild(b);
  });

  var kind = null, busy = false;

  function setStatus(t) { status.textContent = t; }
  function renderBox() {
    pocket.innerHTML = kind ? '<img src="' + FR[kind].url + '" alt="">' : "";
    pocket.classList.toggle("is-filled", !!kind);
    pocket.setAttribute("aria-label", kind ? LABEL[kind] + "（タップで取り出す）" : "空き");
    btnSeal.disabled = !kind || busy;
    tray.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-kind") === kind ? "true" : "false");
      b.disabled = busy;
    });
  }

  /* トレーから箱のくぼみへ飛んでいく動き */
  function fly(fromEl, url, cb) {
    if (reduce || !fromEl.animate) { cb(); return; }
    var a = fromEl.getBoundingClientRect(), b = pocket.getBoundingClientRect();
    var size = b.width * 0.78;
    var img = document.createElement("img");
    img.src = url; img.alt = ""; img.className = "flying-fruit";
    img.style.width = img.style.height = size + "px";
    img.style.left = (a.left + a.width / 2 - size / 2) + "px";
    img.style.top = (a.top + a.height / 2 - size / 2) + "px";
    document.body.appendChild(img);
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    img.animate([
      { transform: "translate(0,0) scale(.5) rotate(0deg)" },
      { transform: "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 90) + "px) scale(1.1) rotate(180deg)", offset: 0.55 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(1) rotate(360deg)" }
    ], { duration: 560, easing: "cubic-bezier(.3,.7,.4,1)" }).onfinish = function () { img.remove(); cb(); };
  }

  tray.addEventListener("click", function (e) {
    var b = e.target.closest("[data-kind]");
    if (!b || busy) return;
    var k = b.getAttribute("data-kind");
    if (k === kind) return;
    kind = null; renderBox();
    busy = true;
    fly(b, FR[k].url, function () {
      busy = false; kind = k; renderBox();
      if (!reduce) pocket.animate([{ transform: "scale(1.1)" }, { transform: "scale(1)" }], { duration: 240, easing: "ease-out" });
      setStatus(LABEL[k] + "を詰めました。");
    });
  });

  pocket.addEventListener("click", function () {
    if (!kind || busy) return;
    kind = null; renderBox();
    setStatus("好きな果物をひとつ選んで、箱に詰めてください。");
  });

  /* ---- 抽選：まだ出会っていない品種を優先。直前と同じ品種は避ける ---- */
  var last = null;
  function draw(k) {
    var pool = byFruit[k].filter(function (v) { return !found[v.id] && v !== last; });
    if (!pool.length) pool = byFruit[k].filter(function (v) { return v !== last; });
    if (!pool.length) pool = byFruit[k];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ---- モーダルの中身 ---- */
  var R = {};
  dialog.querySelectorAll("[data-r]").forEach(function (el) { R[el.getAttribute("data-r")] = el; });
  var FACTS = [["origin", "生まれ"], ["parents", "親"], ["year", "登場"], ["areas", "主な産地"], ["season", "旬の目安"], ["look", "見た目"]];

  function fillCard(v, isNew) {
    R.intro.textContent = LABEL[v.fruit] + "好きのあなたの、運命の品種は……";
    R.icon.src = FR[v.fruit].url;
    R.name.textContent = v.name;
    R.yomi.textContent = v.yomi || "";
    R["new"].hidden = !isNew;
    R.note.textContent = v.note || "";
    R.facts.innerHTML = "";
    FACTS.forEach(function (f) {
      if (!v[f[0]]) return;
      var row = document.createElement("div");
      var dt = document.createElement("dt"); dt.textContent = f[1];
      var dd = document.createElement("dd"); dd.textContent = v[f[0]];
      row.appendChild(dt); row.appendChild(dd);
      R.facts.appendChild(row);
    });
    R.aka.textContent = v.aka ? "ほかの呼び名など：" + v.aka : "";
    R.aka.hidden = !v.aka;
    R.source.href = v.source;
    R.source.textContent = v.source.replace(/^https?:\/\//, "").split("/")[0];
  }

  function openModal() {
    var v = draw(kind);
    var isNew = !found[v.id];
    found[v.id] = 1; save(); last = v;
    fillCard(v, isNew);
    renderZukan();
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
    dialog.scrollTop = 0;
    dialog.classList.remove("is-open"); void dialog.offsetWidth; dialog.classList.add("is-open");
  }

  /* ふたをする → 箱がカタカタ揺れる → 結果 */
  var timers = [];
  function seal() {
    if (!kind || busy) return;
    busy = true; renderBox();
    box.classList.add("is-closed");
    setStatus("ふたをしました。中を確かめています……");
    if (reduce) { openModal(); return; }
    timers.push(setTimeout(function () { box.classList.add("is-shaking"); }, 500));
    timers.push(setTimeout(openModal, 1500));
  }
  btnSeal.addEventListener("click", seal);

  function resetBox(msg) {
    timers.forEach(clearTimeout); timers = [];
    box.classList.remove("is-closed", "is-shaking");
    busy = false; renderBox();
    if (msg) setStatus(msg);
  }
  function closeModal() {
    if (dialog.open) { if (dialog.close) dialog.close(); else dialog.removeAttribute("open"); }
  }
  dialog.addEventListener("close", function () {
    dialog.classList.remove("is-open");
    resetBox(kind ? "もう一度ふたをすると、別の品種に出会えるかもしれません。" : null);
  });
  dialog.querySelector("[data-close]").addEventListener("click", closeModal);
  dialog.addEventListener("click", function (e) { if (e.target === dialog) closeModal(); });
  dialog.querySelector("[data-again]").addEventListener("click", function () {
    closeModal();
    setTimeout(seal, reduce ? 0 : 350);
  });
  dialog.querySelector("[data-other]").addEventListener("click", function () {
    var prev = kind;
    closeModal();
    kind = null; renderBox();
    setStatus("好きな果物をひとつ選んで、箱に詰めてください。");
    var b = tray.querySelector('[data-kind="' + prev + '"]');
    if (b) b.focus({ preventScroll: true });
    box.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  });

  setStatus("好きな果物をひとつ選んで、箱に詰めてください。");
  renderBox();
  renderZukan();
})();

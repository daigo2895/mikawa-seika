/*
 * 美川青果 トップページの動作
 * 設定値は js/config.js から読み込みます（このファイルは通常編集不要）
 */
(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};
  var shop = cfg.shop || {};
  var images = cfg.images || {};
  var username = String(cfg.instagramUsername || "").trim().replace(/^@/, "");
  var validUser = /^[A-Za-z0-9._]{1,30}$/.test(username);

  /* ---------- Instagram 関連リンク ----------
     data-link="instagram" … プロフィールページ
     data-link="dm"        … DM（ig.me/m/ユーザー名）
     ユーザー名が未設定の間は、ボタンを無効化して誤動作を防ぎます */
  var urls = validUser ? {
    instagram: "https://www.instagram.com/" + username + "/",
    dm: "https://ig.me/m/" + username
  } : {};

  document.querySelectorAll("[data-link]").forEach(function (el) {
    var url = urls[el.getAttribute("data-link")];
    if (url) {
      el.setAttribute("href", url);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      el.removeAttribute("aria-disabled");
      el.removeAttribute("tabindex");
    } else {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("role", "link");
      el.setAttribute("title", "Instagramのリンクは準備中です");
    }
  });
  document.querySelectorAll("[data-link-note]").forEach(function (el) {
    el.hidden = validUser;
  });

  /* ---------- 店舗情報 ---------- */
  function setText(key, value, href) {
    var el = document.querySelector('[data-shop="' + key + '"]');
    if (!el || !value) return;
    el.textContent = "";
    if (href) {
      var a = document.createElement("a");
      a.href = href;
      a.textContent = value;
      if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
      el.appendChild(a);
    } else {
      el.textContent = value;
    }
  }
  setText("address", shop.address);
  setText("hours", shop.hours);
  setText("closed", shop.closed);
  if (shop.phone) setText("phone", shop.phone, "tel:" + shop.phone.replace(/[^0-9+]/g, ""));
  if (validUser) setText("instagram", "@" + username, urls.instagram);

  var map = document.querySelector("[data-map]");
  if (map && /^https:\/\/(www\.)?google\.[a-z.]+\/maps(\/embed|\?.*output=embed)/.test(shop.mapEmbedUrl || "")) {
    map.innerHTML = "";
    var iframe = document.createElement("iframe");
    iframe.src = shop.mapEmbedUrl;
    iframe.title = "美川青果の地図";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    map.appendChild(iframe);
  }

  /* ---------- 画像の差し替え ----------
     data-image="キー" の要素に、config.js の images[キー] を表示 */
  document.querySelectorAll("[data-image]").forEach(function (fig) {
    var key = fig.getAttribute("data-image");
    var src = images[key];
    /* スマホ用の画像があれば、スマホではそちらを使う（例：images.heroMobile） */
    if (images[key + "Mobile"] && window.matchMedia("(max-width: 699px)").matches) src = images[key + "Mobile"];
    if (!src) return;
    var img = new Image();
    var alts = cfg.imageAlts || {};
    img.alt = alts[key] != null ? alts[key] : (fig.getAttribute("data-alt") || "");
    img.decoding = "async";
    img.onload = function () { fig.innerHTML = ""; fig.appendChild(img); };
    /* KV以外は、画面に近づいてから読み込む（表示を軽くするため） */
    if (key === "hero" || !("IntersectionObserver" in window)) { img.src = src; return; }
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      img.src = src; // 読み込みに失敗した場合はプレースホルダーのまま
    }, { rootMargin: "400px" });
    io.observe(fig);
  });

  /* ---------- ロゴ画像 ---------- */
  if (images.logo) {
    document.querySelectorAll("[data-logo]").forEach(function (box) {
      var img = new Image();
      img.alt = "美川青果 MIKAWA SEIKA くだものだもの";
      img.className = "logo-img";
      img.onload = function () { box.innerHTML = ""; box.appendChild(img); };
      img.src = images.logo;
    });
  }

  /* ---------- スマホ用メニュー ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a[href]")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); toggle.focus(); }
    });
  }

  /* ---------- フッターの年 ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();

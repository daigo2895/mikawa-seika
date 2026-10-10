/*
 * 果物のイラスト（SVG）
 * KVの「落ちてくる果物」と、贈り物セクションの「箱詰め体験」で共通して使います。
 * すべてオリジナルの簡単な図形で描いています。
 */
(function () {
  "use strict";

  var F = {};

  F.mikan = {
    name: "みかん", r: 1.0,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<circle cx="50" cy="54" r="40" fill="#f28c18"/>' +
      '<ellipse cx="36" cy="40" rx="12" ry="8" fill="#ffc46b" opacity=".75" transform="rotate(-30 36 40)"/>' +
      '<g fill="#d9720c" opacity=".55"><circle cx="62" cy="70" r="1.6"/><circle cx="70" cy="58" r="1.6"/><circle cx="56" cy="80" r="1.6"/><circle cx="74" cy="72" r="1.4"/><circle cx="44" cy="76" r="1.4"/><circle cx="66" cy="44" r="1.4"/></g>' +
      '<path d="M50 16 l4 4 -4 3 -4 -3z" fill="#4c7a2a"/>' +
      '<path d="M52 18 C 64 6, 80 8, 84 14 C 74 22, 60 22, 52 18z" fill="#3f8a3a"/>' +
      '</svg>'
  };

  F.ringo = {
    name: "りんご", r: 1.0,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<path d="M50 28 C 34 16, 10 24, 12 52 C 14 78, 32 94, 44 92 C 48 91, 52 91, 56 92 C 68 94, 86 78, 88 52 C 90 24, 66 16, 50 28z" fill="#d23a2c"/>' +
      '<path d="M50 28 C 60 22, 76 24, 82 40 C 70 30, 60 30, 50 32z" fill="#b02a20" opacity=".6"/>' +
      '<ellipse cx="30" cy="46" rx="7" ry="13" fill="#ff8a70" opacity=".55" transform="rotate(20 30 46)"/>' +
      '<path d="M50 30 C 50 22, 52 14, 56 8" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M54 18 C 62 8, 76 8, 80 12 C 74 20, 62 22, 54 18z" fill="#4f9a3c"/>' +
      '</svg>'
  };

  F.budou = {
    name: "ぶどう", r: 1.0,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<path d="M50 14 C 50 8, 54 4, 58 2" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M54 10 C 64 2, 80 4, 84 10 C 76 18, 62 18, 54 10z" fill="#5f9440"/>' +
      '<g fill="#6a3577">' +
      '<circle cx="30" cy="28" r="12"/><circle cx="52" cy="26" r="12"/><circle cx="72" cy="30" r="12"/>' +
      '<circle cx="40" cy="47" r="12"/><circle cx="62" cy="47" r="12"/>' +
      '<circle cx="50" cy="66" r="12"/>' +
      '<circle cx="50" cy="84" r="11"/>' +
      '</g>' +
      '<g fill="#a173b0" opacity=".8"><circle cx="26" cy="24" r="3.5"/><circle cx="48" cy="22" r="3.5"/><circle cx="68" cy="26" r="3.5"/><circle cx="36" cy="43" r="3.5"/><circle cx="58" cy="43" r="3.5"/><circle cx="46" cy="62" r="3.5"/><circle cx="46" cy="80" r="3"/></g>' +
      '</svg>'
  };

  F.kaki = {
    name: "かき", r: 1.0,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<path d="M50 22 C 80 22, 92 38, 90 60 C 88 82, 70 92, 50 92 C 30 92, 12 82, 10 60 C 8 38, 20 22, 50 22z" fill="#ec6a1c"/>' +
      '<ellipse cx="32" cy="48" rx="8" ry="14" fill="#ffa25c" opacity=".6" transform="rotate(25 32 48)"/>' +
      '<path d="M50 30 L30 20 L42 32 L28 38 L46 36 L50 46 L54 36 L72 38 L58 32 L70 20z" fill="#5d6b2a"/>' +
      '<rect x="47" y="16" width="6" height="12" rx="2" fill="#6b4423"/>' +
      '</svg>'
  };

  F.nashi = {
    name: "なし", r: 1.0,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<circle cx="50" cy="55" r="40" fill="#d8bf6a"/>' +
      '<ellipse cx="36" cy="42" rx="10" ry="7" fill="#f3e3a6" opacity=".8" transform="rotate(-30 36 42)"/>' +
      '<g fill="#a88a3c" opacity=".6"><circle cx="60" cy="40" r="1.5"/><circle cx="70" cy="56" r="1.5"/><circle cx="58" cy="66" r="1.5"/><circle cx="44" cy="70" r="1.5"/><circle cx="66" cy="76" r="1.5"/><circle cx="34" cy="60" r="1.5"/><circle cx="76" cy="44" r="1.3"/><circle cx="52" cy="82" r="1.3"/></g>' +
      '<path d="M50 18 C 50 12, 52 8, 55 5" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '</svg>'
  };

  F.kiwi = {
    name: "キウイ", r: 0.92,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<circle cx="50" cy="50" r="44" fill="#8a6a3c"/>' +
      '<circle cx="50" cy="50" r="38" fill="#8fc23c"/>' +
      '<circle cx="50" cy="50" r="28" fill="#a9d45a"/>' +
      '<ellipse cx="50" cy="50" rx="11" ry="9" fill="#f2f3d0"/>' +
      '<g fill="#2b2a1c">' +
      '<ellipse cx="50" cy="31" rx="1.8" ry="3.2"/><ellipse cx="50" cy="69" rx="1.8" ry="3.2"/>' +
      '<ellipse cx="31" cy="50" rx="3.2" ry="1.8"/><ellipse cx="69" cy="50" rx="3.2" ry="1.8"/>' +
      '<ellipse cx="37" cy="37" rx="1.8" ry="3" transform="rotate(-45 37 37)"/><ellipse cx="63" cy="63" rx="1.8" ry="3" transform="rotate(-45 63 63)"/>' +
      '<ellipse cx="63" cy="37" rx="1.8" ry="3" transform="rotate(45 63 37)"/><ellipse cx="37" cy="63" rx="1.8" ry="3" transform="rotate(45 37 63)"/>' +
      '<ellipse cx="42" cy="33" rx="1.5" ry="2.6" transform="rotate(-20 42 33)"/><ellipse cx="58" cy="67" rx="1.5" ry="2.6" transform="rotate(-20 58 67)"/>' +
      '<ellipse cx="58" cy="33" rx="1.5" ry="2.6" transform="rotate(20 58 33)"/><ellipse cx="42" cy="67" rx="1.5" ry="2.6" transform="rotate(20 42 67)"/>' +
      '</g>' +
      '</svg>'
  };

  F.momo = {
    name: "もも", r: 1.0,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<defs><radialGradient id="mg" cx=".35" cy=".4" r=".75"><stop offset="0" stop-color="#ffe0c2"/><stop offset=".55" stop-color="#f7a39a"/><stop offset="1" stop-color="#e2666a"/></radialGradient></defs>' +
      '<path d="M50 20 C 78 18, 92 40, 88 62 C 84 84, 66 94, 50 92 C 34 94, 16 84, 12 62 C 8 40, 22 18, 50 20z" fill="url(#mg)"/>' +
      '<path d="M50 22 C 58 40, 58 70, 50 90" stroke="#d65a5e" stroke-width="2.5" fill="none" opacity=".55"/>' +
      '<path d="M50 22 C 40 10, 22 10, 18 16 C 26 26, 40 28, 50 22z" fill="#5f9a40"/>' +
      '</svg>'
  };

  /* 画像として使うための data URL を作る */
  Object.keys(F).forEach(function (k) {
    F[k].id = k;
    F[k].url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(F[k].svg);
  });

  window.MIKAWA_FRUITS = F;
})();

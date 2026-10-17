/*
 * 美川青果 サイト設定ファイル
 * ------------------------------------------------------------
 * 店舗情報・Instagram・画像は、基本的にこのファイルだけ編集すれば反映されます。
 * 空欄（""）のままの項目は、ページ上で「未設定」のプレースホルダーとして表示されます。
 * 推測の値は入れず、確認が取れた情報だけを入力してください。
 */
window.SITE_CONFIG = {
  /* Instagram のユーザー名（@ は不要）。例: "mikawa_seika"
     設定すると「最新情報を見る」「DMで相談する」ボタンが有効になります。 */
  instagramUsername: "mikawa2229",

  /* 店舗情報（確定したものだけ入力） */
  shop: {
    address: "〒791-8016 愛媛県松山市久万ノ台347-1",
    hours: "9:00〜17:00",
    closed: "日曜日",
    phone: "089-924-5730",
    /* Google マップの「共有 → 地図を埋め込む」で表示される iframe の src の URL */
    mapEmbedUrl: "https://www.google.com/maps?q=" + encodeURIComponent("愛媛県松山市久万ノ台347-1 美川青果") + "&output=embed"
  },

  /* 画像ファイル（images/ フォルダに入れてファイル名を書く）
     空欄のあいだは、仮画像であることが分かるプレースホルダーが表示されます。 */
  images: {
    logo: "",                              // 正式ロゴ（未設定ならテキストの仮ロゴ）
    hero: "images/hero.jpg",               // KV（PC）※仮：店構え。本番は家族3人の写真の予定
    heroMobile: "images/hero-mobile.jpg",  // KV（スマホ用・縦長）※仮
    about: "images/shop-front.jpg",        // 美川青果について
    gift: "images/grape-display.jpg",      // 贈り物
    season1: "images/season-tone.jpg",     // おすすめ 1：刀根早生
    season2: "images/season-kiyota.jpg",   // おすすめ 2：きよた柿
    father: "images/father.jpg",           // 父
    mother: "",
    son: "images/son.jpg",                 // 息子
    reach: "images/reach.jpg",             // 看板犬リーチ
    shop: "images/shop-inside.jpg"         // 店舗情報（店内）
  },

  /* 画像の代替テキスト（読み上げ用）。HTML側の説明より優先されます */
  imageAlts: {
    hero: "「くだものだもの」の看板が掛かる美川青果の店構え",
    about: "美川青果の店構え",
    gift: "ネットに包まれて並ぶシャインマスカットとぶどう",
    season1: "かごに入った刀根早生",
    season2: "かごに入ったきよた柿",
    father: "美川青果のロゴ入りシャツを着て笑顔の父",
    son: "店の事務所で手元を見る息子",
    reach: "毛布にくるまってくつろぐ看板犬のリーチ",
    shop: "果物や野菜が並ぶ美川青果の店内"
  }
};

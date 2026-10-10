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
    logo: "",         // 例: "images/logo.png"（正式ロゴ。未設定ならテキストの仮ロゴ）
    hero: "",         // 例: "images/hero-family.jpg"（父・母・弟の3人の写真）
    about: "",        // 例: "images/shop-front.jpg"（店構え・店内）
    gift: "",         // 例: "images/gift-box.jpg"（贈答品の詰め合わせ）
    father: "",       // 例: "images/father.jpg"
    mother: "",       // 例: "images/mother.jpg"
    brother: "",      // 例: "images/brother.jpg"
    shop: ""          // 例: "images/shop-inside.jpg"
  }
};

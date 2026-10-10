# 美川青果 公式サイト（トップページ初版）

静的サイト（HTML / CSS / JavaScript）です。GitHub Pages でそのまま公開できます。

## ファイル構成

```
index.html      トップページ本体（文章・商品カードはここを編集）
css/style.css   デザイン（色・フォントは冒頭の :root で変更）
js/config.js    店舗情報・Instagram・画像の設定 ← 主にここを編集
js/main.js      動作（通常は編集不要）
images/         写真・ロゴを置くフォルダ
.nojekyll       GitHub Pages 用
```

## 確認方法

- 手元：`index.html` をブラウザで開く（またはフォルダで `python3 -m http.server` を実行し http://localhost:8000 を開く）
- 公開：GitHub にリポジトリを作ってこのフォルダの中身を置き、Settings → Pages で `main` ブランチ / `(root)` を選択

## 差し替え手順

1. 写真を `images/` に入れる（例：`images/hero-family.jpg`）
2. `js/config.js` の `images.hero` に `"images/hero-family.jpg"` と書く
3. Instagram のユーザー名を `instagramUsername` に入れると、DM・Instagramボタンが有効になります
4. 住所・営業時間・定休日・電話番号・地図URLは `shop` に入力

未入力の項目は「未設定」「仮画像」として表示されます。推測の値は入れないでください。

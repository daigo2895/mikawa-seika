# 美川青果 公式サイト（トップページ初版）

静的サイト（HTML / CSS / JavaScript）です。GitHub Pages でそのまま公開できます。

## ファイル構成

```
index.html      トップページ本体（文章・商品カードはここを編集）
css/style.css   デザイン（色・フォントは冒頭の :root で変更）
js/config.js    店舗情報・Instagram・画像の設定 ← 主にここを編集
js/main.js      リンク・画像・メニューの動作（通常は編集不要）
js/fruits.js    果物のイラスト（SVG）
js/hero-fruits.js KVの「降ってくる果物」
js/unmei.js     「運命の品種」（果物を選ぶと品種がランダムに出る）
js/varieties.js 品種データ（自動生成。直接編集しない）
data/varieties.csv 品種データベースの元データ ← 品種を追加・修正するのはここ
tools/build_varieties.py CSV から js/varieties.js を作り直すスクリプト
js/vendor/      物理演算ライブラリ matter.js（MITライセンス）
fonts/          Dela Gothic One・Zen Kaku Gothic New（SIL OFL、サイト内に同梱）
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

## 品種データベースの更新

1. `data/varieties.csv` を Excel や Googleスプレッドシートで開いて編集（UTF-8 の CSV で保存）
   - `fruit` は mikan / ringo / budou / kaki / nashi / kiwi / momo のいずれか
   - `id` は英数字で重複しないように
   - 空欄の項目は、モーダルに表示されません
   - `source` には情報の出典URLを必ず入れてください
2. サイトのフォルダで `python3 tools/build_varieties.py` を実行すると `js/varieties.js` が更新されます

見つけた品種（図鑑）は、訪問者それぞれのブラウザにだけ保存されます。

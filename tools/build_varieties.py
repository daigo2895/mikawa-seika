"""
品種データベース（data/varieties.csv）から、サイトが読み込む js/varieties.js を作り直すスクリプト。
使い方：サイトのフォルダで  python3 tools/build_varieties.py
CSV は Excel や Googleスプレッドシートで編集して、UTF-8 の CSV で保存してください。
"""
import csv, json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
rows = list(csv.DictReader(open(root / "data/varieties.csv", encoding="utf-8-sig")))
keys = ["id","fruit","name","yomi","aka","parents","origin","year","areas","season","look","note","source"]
out = [{k: (r.get(k) or "").strip() for k in keys} for r in rows if (r.get("id") or "").strip()]
ids = [r["id"] for r in out]
dup = {i for i in ids if ids.count(i) > 1}
if dup: raise SystemExit("id が重複しています: " + ", ".join(sorted(dup)))
js = ("/* 自動生成ファイル：直接編集せず data/varieties.csv を編集して tools/build_varieties.py を実行してください */\n"
      "window.MIKAWA_VARIETIES = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
(root / "js/varieties.js").write_text(js, encoding="utf-8")
print(f"{len(out)} 品種を書き出しました")

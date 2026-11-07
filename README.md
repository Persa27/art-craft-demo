# art-craft-demo
ArtCraftのデモサイト

ArtCraft 系の 13 個のヘッドレス CLI でできることを紹介する、非公式の静的サイトです。一般に紹介されている「タッチもゲートも不要の顔パス改札」の考え方を題材に、提案資料から完成動画までを CLI で生成しています。駅名、数値、データはすべて架空または仮の値で、顔認証は実行していません。

## 構成

- `data/`: 仕様書の原稿、テスト項目と結果、シナリオと認証履歴(`scenario.json`、`history.json` は生成物)
- `scripts/`: ツールごとの生成スクリプトとサイトのテンプレート
- `site/`: 公開するサイト(`index.html` と `assets/`)
- `src/worker.js`: 動画と音声に Range リクエストを返す Cloudflare Worker
- `build/`: 中間生成物(git の管理外)

## 再生成

Windows に 13 個の CLI が `C:\Program Files\<Name>Craft\` にインストールされている必要があります。

```bash
node scripts/build-all.mjs
```

`build/` と `site/assets/` を作り直し、最後に `site/index.html` を生成します。掲載するコマンドは、この実行で成功したものだけです。

## デプロイ

```bash
npx wrangler deploy
```

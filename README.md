# art-craft-demo
ArtCraftのデモサイト

ArtCraft 系の 13 個のヘッドレス CLI でできることを紹介する、非公式の静的サイトです。架空の駅の顔認証改札案件を題材に、提案資料から完成動画までを CLI で生成しています。駅名、数値、試験データはすべて架空で、顔認証は実行していません。

## 構成

- `data/`: 仕様書の原稿と、シナリオ(`scenario.json`、生成物)
- `scripts/`: ツールごとの生成スクリプトとサイトのテンプレート
- `site/`: 公開するサイト(`index.html` と `assets/`)
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

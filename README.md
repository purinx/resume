# resume

職務経歴書をコードで管理するリポジトリ。データとレイアウトを分離し、JSONを編集するだけでHTMLの職務経歴書を生成できる。

## 構成

```
resume/
├── src/
│   ├── {YYYYMMDD}.json  # 職歴データ（編集対象）
│   ├── template.njk   # Nunjucksテンプレート
│   ├── style.css      # スタイル
│   └── variables.css  # デザイントークン
├── editor/            # データ編集UI（Vite + React）
├── out/               # ビルド成果物
└── build.js           # ビルドスクリプト
```

## 使い方

### セットアップ

```sh
pnpm install
cd editor && pnpm install
```

### HTMLをビルド

```sh
node build.js src/{YYYYMMDD}.json
# → out/{YYYYMMDD}.html が生成される
```

### 編集UIを起動

```sh
pnpm editor
# → http://localhost:5173
```

ブラウザでフォームを編集し「保存 + ビルド」を押すと `src/{YYYYMMDD}.json` の更新と `out/{YYYYMMDD}.html` の再生成が行われる。

## デプロイ

`main` ブランチへ push すると GitHub Actions が自動でビルドし、`out/` の内容を GitHub Pages に公開する。

リポジトリの **Settings → Pages → Source** を `GitHub Actions` に設定すること。

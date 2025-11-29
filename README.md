# Vim Quest

GitHub Pages にそのまま配置できる、Vim の基本操作をローグライク風に学べるシングルページアプリです。h/j/k/l の移動から、挿入モード、:wq までの流れをゲームとして体験できます。

## 使い方

1. このリポジトリをクローンし、`index.html` をブラウザで開きます。
2. ヒーローセクションの「ゲームを始める」を押すか、ステージセクションへスクロールします。
3. 各ステージの指示に従って、キーボードで Vim 操作を入力してクリアしていきます。

## デプロイ（GitHub Pages）

ブランチを `gh-pages` に設定するだけでデプロイできます。ビルド工程は不要です。

```bash
git checkout --orphan gh-pages
git add index.html styles.css script.js README.md
git commit -m "Deploy Vim Quest"
git push origin gh-pages
```

## ステージ構成

- **ステージ 1: ダンジョン移動** — h/j/k/l でプレイヤーを出口まで移動。
- **ステージ 2: 挿入モード** — `i` で挿入し、テキストをタイプして `Esc` で戻る。
- **ステージ 3: コマンドライン** — `:` でコマンドラインを開き `:wq` を入力して保存終了。

すべてクリアする頃には Vim の基本操作フローを体に覚えさせられます。

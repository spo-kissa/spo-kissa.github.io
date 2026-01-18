---
sidebar_position: 12
title: ブロックログの設定
description: Midnight-blocklog のセットアップ方法について
---

## Midnight-blocklog について

Midnight-blocklog とは BTBF さんが開発・公開されている Midnight ノードのブロック生成スケジュール表示・記録ツールです。

詳しい情報は BTBF さんの [GitHub](https://github.com/btbf/Midnight-blocklog) をご覧下さい。

## インストール方法

Docker で構築された Midnight Node にインストールする方法を説明します。

### Rust のインストール

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup toolchain install stable
rustup default stable
rustc -V
cargo -V
```

### 依存関係のインストール

```bash
sudo apt-get update
```

```bash
sudo apt-get install -y build-essential pkg-config libssl-dev
```

### ビルド

```bash
mkdir -p $HOME/git
cd $HOME/git
```

```bash
git clone https://github.com/btbf/Midnight-blocklog.git
cd Midnight-blocklog
git checkout 0.3.2
cargo install --path . --bin mblog --locked --force
```

## 使い方

### スケジュール保存・表示・監視モード

```bash
mblog block \
  --keystore-path $HOME/midnight-node-docker/data/chains/partner_chains_template/keystore \
  --db $HOME/midnight-node-docker/mblog.db \
  --tz Asia/Tokyo \
  --watch
```

### blocks 表示

#### 最新のエポック

```bash
mblog log \
  --db $HOME/midnight-node-docker/mblog.db \
```

#### エポック指定

```bash
mblog log \
  --db $HOME/midnight-node-docker/mblog.db \
  --epoch 245525
```

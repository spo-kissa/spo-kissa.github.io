---
title: ノードアップグレード
description: cardano-node のアップグレード方法について
---

## 現在インストールされているノードバージョンを確認する

```bash
echo $(cardano-node version | grep cardano-node)
```

:::warning[注意]

  cardano-node v10.6.4以外の方はこのマニュアルの対象外となります！

:::

## システムアップデート

```bash
sudo apt update -y && sudo apt upgrade -y
```

## ノードアップデート

:::info[アップデート方法について]

  ビルド済みバイナリを使用する方法とソースコードからビルドする方法がありますが、このマニュアルではビルド済みバイナリを使用する方法のみを解説します。

:::

### 作業ディレクトリ作成

```bash
mkdir $HOME/git/cardano-node2
cd $HOME/git/cardano-node2
```

:::info[ここでエラーが発生する場合]

  ここで何かしらのエラーが発生する場合、前回のアップグレード時にディレクトリの名称変更をしていない可能性があります。
  以下を実行してから、再度実行してみてください。

  ```bash
  cd $HOME/git
  rm -rf cardano-node-old
  mv cardano-node/ cardano-node-old/
  mv cardano-node2/ cardano-node/
  ```

:::

### バイナリをダウンロード

```bash
wget -q --show-progress https://github.com/IntersectMBO/cardano-node/releases/download/10.7.1/cardano-node-10.7.1-linux.tar.gz
```

### バイナリを解凍する

```bash
tar xvf cardano-node-10.7.1-linux.tar.gz ./bin/cardano-node ./bin/cardano-cli
```

### バイナリのバージョンを確認

```bash
$(find $HOME/git/cardano-node2 -type f -name "cardano-cli") version
$(find $HOME/git/cardano-node2 -type f -name "cardano-node") version
```

:::info[以下の戻り値を確認してください]

  ```txt
  cardano-cli 10.16.0.0 - linux-x86_64 - ghc-9.6
  git rev 045bc187a36ef0cbd236db902b85dd8f202fb059

  cardano-node 10.7.1 - linux-x86_64 - ghc-9.6
  git rev 045bc187a36ef0cbd236db902b85dd8f202fb059
  ```

:::

### ノードを停止する

```bash
sudo systemctl stop cardano-node
```

### バイナリをシステムディレクトリにコピー

```bash
sudo cp $(find $HOME/git/cardano-node2 -type f -name "cardano-cli") /usr/local/bin/cardano-cli
```

```bash
sudo cp $(find $HOME/git/cardano-node2 -type f -name "cardano-node") /usr/local/bin/cardano-node
```

### コピーされたノードバージョンを確認

```bash
cardano-cli version
cardano-node version
```

:::info[以下の戻り値を確認してください]

```txt
  cardano-cli 10.16.0.0 - linux-x86_64 - ghc-9.6
  git rev 045bc187a36ef0cbd236db902b85dd8f202fb059

  cardano-node 10.7.1 - linux-x86_64 - ghc-9.6
  git rev 045bc187a36ef0cbd236db902b85dd8f202fb059
```

:::

## 設定ファイル更新

ノードバージョン 10.6.4 からアップグレードする場合は更新する必要がありません。

## DB更新

### Mithril インストール

### Mithril 環境変数設定

```bash
export AGGREGATOR_ENDPOINT=https://aggregator.release-mainnet.api.mithril.network/aggregator
export GENESIS_VERIFICATION_KEY=$(wget -q -O - https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-mainnet/genesis.vkey)
export ANCILLARY_VERIFICATION_KEY=$(wget -q -O - https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-mainnet/ancillary.vkey)
export SNAPSHOT_DIGEST=latest
```

### 既存DBを削除

```bash
rm -rf $NODE_HOME/db
```

### 最新スナップショットをダウンロード

```bash
mithril-client cardano-db download \
  --download-dir $NODE_HOME \
  --include-ancillary \
  $SNAPSHOT_DIGEST
```

## 作業ディレクトリの整理

### 旧バイナリを削除

```bash
rm -rf $HOME/git/cardano-node-old/
```

### ディレクトリの名称変更

```bash
cd $HOME/git
mv cardano-node/ cardano-node-old/
mv cardano-node2/ cardano-node/
```

## サーバーを再起動

### サーバーを再起動する

```bash
sudo reboot
```

### ノードの同期状態を確認する

```bash
sudo journalctl -u cardano-node -f
```

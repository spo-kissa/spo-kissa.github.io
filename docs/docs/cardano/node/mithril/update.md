---
title: Mithril Signer アップデート手順
description: Mithril Signer のアップデート手順について
---

## サービスを停止する

```bash
sudo systemctl stop mithril-signer.service
```

## 作業用ディレクトリの作成と移動

```bash
mkdir -p ~/mithril-signer-update
cd ~/mithril-signer-update
```

## Mithril Signer をダウンロード

```bash
curl --proto '=https' --tlsv1.2 -sSf \
https://raw.githubusercontent.com/input-output-hk/mithril/refs/heads/main/mithril-install.sh \
| sh -s -- -c mithril-signer -d latest -p $(pwd)
```

## バージョン確認

```bash
./mithril-signer -V
```

## システムバイナリを上書き

```bash
sudo cp ./mithril-signer /usr/local/bin/mithril-signer
```

## 確認

```bash
mithril-signer -V
```

## サービスをスタート

```bash
sudo systemctl restart mithril-signer.service
```

## 動作確認

```bash
sudo journalctl --unit=mithril-signer.service --follow
```

## お掃除

```bash
cd ~
rm -r ~/mithril-signer-update
```

## Mithril 登録確認

### 登録確認ツールの導入

```bash
mkdir -p $NODE_HOME/mithril-signer
cd $NODE_HOME/mithril-signer
wget https://mithril.network/doc/scripts/verify_signer_registration.sh
chmod +x verify_signer_registration.sh
```

### プールIDを指定して実行

```bash
PARTY_ID=$(cat $NODE_HOME/pool.id-bech32) \
AGGREGATOR_ENDPOINT=https://aggregator.release-mainnet.api.mithril.network/aggregator \
./verify_signer_registration.sh
```

#### 戻り値

- ✅ 登録成功
  - Congrats, your signer node is registered!
- ❌ エラー
  - Oops, your signer node is not registered. Party ID not found among the signers registered at epoch XXX.

### 最終確認 (Mithril Explorer)

[Mithril Explorer - Registrations](https://mithril.network/explorer/registrations?aggregator=https%3A%2F%2Faggregator.release-mainnet.api.mithril.network%2Faggregator&epoch=latest)

## #クレジット

この記事は、[hixさん](https://coffeepool.jp/) の許諾を得て DAISUKE がドキュメント化ものです。

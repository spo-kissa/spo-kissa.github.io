---
sidebar_position: 5
title: 各種アドレスの作成
description: プール運営で使用する各種アドレスを作成します
---
import Mermaid from '@theme/Mermaid';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 支払いアドレスキーの作成

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  cd $NODE_HOME
  cardano-cli conway address key-gen \
    --verification-key-file payment.vkey \
    --signing-key-file payment.skey
  ```

  </TabItem>
</Tabs>

## ステークアドレスキーの作成

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  cardano-cli conway stake-address key-gen \
    --verification-key-file stake.vkey \
    --signing-key-file stake.skey
  ```

  </TabItem>
</Tabs>

## 支払いアドレスの作成

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  cd $NODE_HOME
  cardano-cli conway address build \
    --payment-verification-key-file payment.vkey \
    --stake-verification-key-file stake.vkey \
    --out-file payment.addr \
    $NODE_NETWORK
  ```

  </TabItem>
</Tabs>

## ステークアドレスの作成

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  cardano-cli conway stake-address build \
    --stake-verification-key-file stake.vkey \
    --out-file stake.addr \
    $NODE_NETWORK
  ```

  </TabItem>
</Tabs>

## パーミッションを設定

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  chmod 400 payment.vkey payment.skey stake.vkey stake.skey stake.addr payment.addr
  ```

  </TabItem>
</Tabs>

## 支払いアドレスに入金

テスト用ADA (tADA)を請求します。

### アドレスファイルを転送

:::info[ファイル転送]

エアギャップマシンの `payment.addr` と `stake.addr` を BPノードの `cnode` ディレクトリにコピーします。

<Mermaid
  value={`flowchart LR;
    エアギャップ-->|payment.addr / stake.addr|BP;
  `}
/>

:::

### tADA を請求

支払いアドレスを表示します。

```bash
echo "$(cat $NODE_HOME/payment.addr)"
```

表示されたアドレスを[テストネット用faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)
ページに貼り付けてtADAを請求します。

### tADAの残高確認

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cardano-cli conway query utxo \
    --address $(cat $NODE_HOME/payment.addr) \
    $NODE_NETWORK \
    --output-text
  ```

  </TabItem>
</Tabs>

次のような戻りがあれば着金完了です
```txt
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
9358d225224197089ac7cd05f6b4e771b053e6be969cde7a97693b71344ffb83     0        10000000000 lovelace + TxOutDatumNone
```


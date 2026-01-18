---
sidebar_position: 6
title: ステークアドレスの登録
description: ステークアドレスを登録します
---
import Mermaid from '@theme/Mermaid';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## ステーク証明書の作成

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  cd $NODE_HOME
  cardano-cli conway stake-address registration-certificate \
    --stake-verification-key-file stake.vkey \
    --key-reg-deposit-amt 2000000 \
    --out-file stake.cert
  ```

  </TabItem>
</Tabs>

:::info[ファイル転送]

  エアギャップマシンの `stake.cert` をBPノードの `cnode` ディレクトリにコピーします。

  <Mermaid
    value={`flowchart LR;
      エアギャップ-->|stake.cert|BP;
    `}
  />

:::

## ステークアドレスの登録

### プロトコルパラメータの取得

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  cardano-cli conway query protocol-parameters \
    $NODE_NETWORK \
    --out-file params.json
  ```

  </TabItem>
</Tabs>

### ステーク証明書を作成

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  currentSlot=$(cardano-cli conway query tip $NODE_NETWORK | jq -r '.slot')
  echo Current Slot: $currentSlot
  ```

  </TabItem>
</Tabs>

### payment.addr の残高を出力

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
    cardano-cli conway query utxo \
      --address $(cat payment.addr) \
      $NODE_NETWORK \
      --output-text \
      --out-file fullUtxo.out

    tail -n +3 fullUtxo.out | sort -k3 -nr > balance.out
    cat balance.out
  ```

  </TabItem>
</Tabs>

### UTXO を算出

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  tx_in=""
  total_balance=0
  while read -r utxo; do
    in_addr=$(awk '{ print $1 }' <<< "${utxo}")
    idx=$(awk '{ print $2 }' <<< "${utxo}")
    utxo_balance=$(awk '{ print $3 }' <<< "${utxo}")
    total_balance=$((${total_balance}+${utxo_balance}))
    echo TxHash: ${in_addr}#${idx}
    echo ADA: ${utxo_balance}
    tx_in="${tx_in} --tx-in ${in_addr}#${idx}"
  done < balance.out
  txcnt=$(cat balance.out | wc -l)
  echo Total ADA balance: ${total_balance}
  echo Number of UTXOs: ${txcnt}
  ```

  </TabItem>
</Tabs>

### Deposit の値を出力

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  keyDeposit=$(cat $NODE_HOME/params.json | jq -r '.stakeAddressDeposit')
  echo keyDeposit: $keyDeposit
  ```

  </TabItem>
</Tabs>

### トランザクション仮ファイルを作成

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
    cardano-cli conway transaction build-raw \
      ${tx_in} \
      --tx-out $(cat payment.addr)+$(( ${total_balance} - ${keyDeposit} )) \
      --invalid-hereafter $(( ${currentSlot} + 10000)) \
      --fee 200000 \
      --out-file tx.tmp \
      --certificate stake.cert
  ```

  </TabItem>
</Tabs>

### 最低手数料を計算

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
    fee=$(cardano-cli conway transaction calculate-min-fee \
      --tx-body-file tx.tmp \
      --witness-count 2 \
      --output-text \
      --protocol-params-file params.json | awk '{ print $1 }')
    echo fee: $fee
  ```

  </TabItem>
</Tabs>

### 計算結果を出力

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  txOut=$((${total_balance}-${keyDeposit}-${fee}))
  echo Change Output: ${txOut}
  ```

  </TabItem>
</Tabs>

### ステークアドレスを登録するトランザクションファイルを作成

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cardano-cli conway transaction build-raw \
    ${tx_in} \
    --tx-out $(cat payment.addr)+${txOut} \
    --invalid-hereafter $(( ${currentSlot} + 10000)) \
    --fee ${fee} \
    --certificate-file stake.cert \
    --out-file tx.raw
  ```

  </TabItem>
</Tabs>

:::info[ファイル転送]

BPノードの `tx.raw` をエアギャップマシンの `cnode` ディレクトリにコピーします。

<Mermaid
  value={`flowchart LR;
    BP-->|tx.raw|エアギャップ;
  `}
/>

:::

### トランザクションに署名

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  cd $NODE_HOME
  cardano-cli conway transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --signing-key-file stake.skey \
    $NODE_NETWORK \
    --out-file tx.signed
  ```

  </TabItem>
</Tabs>

:::info[ファイル転送]

エアギャップマシンの `tx.signed` を BPノードの 'cnode' ディレクトリにコピーします。

<Mermaid
  value={`flowchart LR;
    エアギャップ-->|tx.signed|BP;
  `}
/>

:::

### トランザクションを送信

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  cardano-cli conway transaction submit \
    --tx-file tx.signed \
    $NODE_NETWORK
  ```

  </TabItem>
</Tabs>

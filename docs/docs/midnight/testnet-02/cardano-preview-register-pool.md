---
sidebar_position: 7
title: ステークプールの登録
description: プレビューネットにプールを登録します
---
import TemplateCodeGenerator from '@site/src/components/TemplateCodeGenerator';
import GeneratePoolCertCode from '@site/src/components/GeneratePoolCertCode';
import Mermaid from '@theme/Mermaid';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## プールメタデータの作成

### プールメタデータの作成方法

メタデータは メインネットで使用しているものを流用可能です。

## プールメタデータの登録準備

### メターデータのダウンロード

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  <TemplateCodeGenerator
    title="プールメタデータJSONのURLを入力してコマンドをコピーしてください"
    initialVars={{
      META_URL: 'https://example.com/poolMetaData.json',
    }}
  >{`cd $NODE_HOME
  wget {{META_URL}} -O poolMetaData.json`}
  </TemplateCodeGenerator>

  </TabItem>
</Tabs>

### メタデータの構文をチェック

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cat $NODE_HOME/poolMetaData.json | jq .
  ```

  </TabItem>
</Tabs>

### メタデータのハッシュ値を算出

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  cardano-cli conway stake-pool metadata-hash --pool-metadata-file poolMetaData.json > poolMetaDataHash.txt
  ```

  </TabItem>
</Tabs>

## プール登録証明書の作成

:::info[ファイル転送]

BPノードの `vrf.vkey` と `poolMetaDataHash.txt` をエアギャップマシンの `cnode` ディレクトリにコピーします。

<Mermaid
  value={`flowchart LR;
    BP-->|vrf.vkey / poolMetaDataHash.txt|エアギャップ
  `}
/>

:::

### プール登録証明書を作成

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  <GeneratePoolCertCode
    title="各項目を入力してコマンドをコピーしてください"
  >{`cd $NODE_HOME
  cardano-cli conway stake-pool registration-certificate \\
      --cold-verification-key-file $HOME/cold-keys/node.vkey \\
      --vrf-verification-key-file vrf.vkey \\
      --pool-pledge {{PLEDGE}} \\
      --pool-cost {{COST}} \\
      --pool-margin {{MARGIN}} \\
      --pool-reward-account-verification-key-file stake.vkey \\
      --pool-owner-stake-verification-key-file stake.vkey \\
      $NODE_NETWORK \\
      --pool-relay-ipv4 {{RELAY_IP}} \\
      --pool-relay-port {{RELAY_PORT}} \\
      --metadata-url {{META_URL}} \\
      --metadata-hash $(cat poolMetaDataHash.txt) \\
      --out-file pool.cert
  `}</GeneratePoolCertCode>

  </TabItem>
</Tabs>

### 委任証明書を作成

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  cardano-cli conway stake-address stake-delegation-certificate \
    --stake-verification-key-file stake.vkey \
    --cold-verification-key-file $HOME/cold-keys/node.vkey \
    --out-file deleg.cert
  ```

  </TabItem>
</Tabs>

:::info[ファイル転送]

エアギャップの `pool.cert` と `deleg.cert` をBPの `cnode` ディレクトリにコピーします

<Mermaid
  value={`flowchart LR;
  エアギャップ-->|pool.cert / deleg.cert|BP;
  `}
/>

:::

### プール登録

プール登録トランザクションを送信します。

### スロットを取得

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  currentSlot=$(cardano-cli conway query tip $NODE_NETWORK | jq -r '.slot')
  echo Current Slot: $currentSlot
  ```

  </TabItem>
</Tabs>

### payment.addrの残高を出力

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

### デポジットを出力

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  poolDeposit=$(cat $NODE_HOME/params.json | jq -r '.stakePoolDeposit')
  echo poolDeposit: $poolDeposit
  ```

  </TabItem>
</Tabs>

### トランザクション仮ファイルを作成

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cardano-cli conway transaction build-raw \
    ${tx_in} \
    --tx-out $(cat payment.addr)+$(( ${total_balance} - ${poolDeposit})) \
    --invalid-hereafter $(( ${currentSlot} + 10000)) \
    --fee 200000 \
    --certificate-file pool.cert \
    --certificate-file deleg.cert \
    --out-file tx.tmp
  ```

  </TabItem>
</Tabs>

### 最低手数料を計算

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  fee=$(cardano-cli conway transaction calculate-min-fee \
    --tx-body-file tx.tmp \
    --witness-count 3 \
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
  txOut=$((${total_balance}-${poolDeposit}-${fee}))
  echo txOut: ${txOut}
  ```

  </TabItem>
</Tabs>

### トランザクションファイルを作成

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cardano-cli conway transaction build-raw \
    ${tx_in} \
    --tx-out $(cat payment.addr)+${txOut} \
    --invalid-hereafter $(( ${currentSlot} + 10000)) \
    --fee ${fee} \
    --certificate-file pool.cert \
    --certificate-file deleg.cert \
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
    --signing-key-file $HOME/cold-keys/node.skey \
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

## プール登録確認

### ステークプールIDを出力

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  chmod u+rwx $HOME/cold-keys
  cardano-cli conway stake-pool id --cold-verification-key-file $HOME/cold-keys/node.vkey --output-format bech32 --out-file pool.id-bech32
  cardano-cli conway stake-pool id --cold-verification-key-file $HOME/cold-keys/node.vkey --output-format hex --out-file pool.id
  chmod a-rwx $HOME/cold-keys
  ```

  </TabItem>
</Tabs>

:::info[ファイル転送]

エアギャップマシンの `pool.id-bech32` と `pool.id` を BPノードの 'cnode' ディレクトリにコピーします。

<Mermaid
  value={`flowchart LR;
    エアギャップ-->|pool.id-bech32 / pool.id|BP;
  `}
/>

:::

### Koios APIで登録確認

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  curl -s -X POST "https://preview.koios.rest/api/v1/pool_info" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -d '{"_pool_bech32_ids":["'$(cat $NODE_HOME/pool.id-bech32)'"]}' | jq .
  ```

  </TabItem>
</Tabs>

### Cardanoscanで登録確認

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  echo $(cat pool.id-bech32)
  ```

  表示されたプールIDで次のサイトで確認してください。

  [CardanoScan](https://preview.cardanoscan.io/)

  </TabItem>
</Tabs>

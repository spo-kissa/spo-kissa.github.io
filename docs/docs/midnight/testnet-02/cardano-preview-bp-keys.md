---
sidebar_position: 4
title: BPキーの作成
description: BPキーの作成手順
---
import Mermaid from '@theme/Mermaid';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## KES キーの作成

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  cardano-cli conway node key-gen-KES \
    --verification-key-file kes.vkey \
    --signing-key-file kes.skey
  ```

  </TabItem>
</Tabs>

## コールドキーの作成

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" label="エアギャップマシン">

  ```bash
  mkdir -p $HOME/cold-keys
  cd $HOME/cold-keys
  cardano-cli conway node key-gen \
    --cold-verification-key-file node.vkey \
    --cold-signing-key-file node.skey \
    --operational-certificate-issue-counter node.counter
  ```

  ```bash
  chmod 400 node.vkey node.skey
  ```

  </TabItem>
</Tabs>

## プール証明書の作成

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  slotsPerKESPeriod=$(cat $NODE_HOME/shelley-genesis.json | jq -r '.slotsPerKESPeriod')
  echo slotsPerKESPeriod: ${slotsPerKESPeriod}
  ```

  ```bash
  slotNo=$(cardano-cli conway query tip $NODE_NETWORK | jq -r '.slot')
  echo slotNo: ${slotNo}
  ```

  ```bash
  kesPeriod=$((${slotNo} / ${slotsPerKESPeriod}))
  echo kesPeriod: ${kesPeriod}
  startKesPeriod=${kesPeriod}
  echo startKesPeriod: ${startKesPeriod}
  ```

  :::info[ファイル転送]

  BPノードの `kes.skey` と `kes.vkey` をエアギャップマシンの `cnode` ディレクトリにコピーします。

  <Mermaid
    value={`flowchart LR;
      BP-->|kes.skey / kes.vkey|エアギャップ;
    `}
  />

  :::

  </TabItem>
</Tabs>

<Tabs groupId="node" queryString="node">
  <TabItem value="airgap" value="エアギャップマシン">

  ```bash
  cd $NODE_HOME
  read -p "BPで表示されたstartKesPeriodを入力してください:" kes
  ```

  ```bash
  echo "startKeyPeriodは$kesです"
  ```

  ```bash
  cardano-cli conway node issue-op-cert \
    --kes-verification-key-file kes.vkey \
    --cold-signing-key-file $HOME/cold-keys/node.skey \
    --operational-certificate-issue-counter $HOME/cold-keys/node.counter \
    --kes-period $kes \
    --out-file node.cert
  ```

  :::info[ファイル転送]

  エアギャップの `node.cert` をBPノードの `cnode` ディレクトリにコピーします。

  <Mermaid
    value={`flowchart LR;
      エアギャップ-->|node.cert|BP;
    `}
  />

  :::

  </TabItem>
</Tabs>

## VRF キーの作成

<Tabs groupId="node" queryString="node">
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  cardano-cli conway node key-gen-VRF \
    --verification-key-file vrf.vkey \
    --signing-key-file vrf.skey
  ```

  ```bash
  chmod 400 vrf.skey vrf.vkey
  ```

  </TabItem>
</Tabs>

## BPノードとして起動する

BPノードにて作業してください。

### ポート番号を確認する

```bash
PORT=`grep "PORT=" $NODE_HOME/startBlockProducingNode.sh`
BP_PORT=${PORT#"PORT="}
echo "BPポートは${BP_PORT}です"
```

### 起動スクリプトを書き換える

```bash
cat > $NODE_HOME/startBlockProducingNode.sh << EOF 
#!/bin/bash
DIRECTORY=$NODE_HOME
PORT=${BP_PORT}
HOSTADDR=0.0.0.0
TOPOLOGY=\${DIRECTORY}/topology.json
DB_PATH=\${DIRECTORY}/db
SOCKET_PATH=\${DIRECTORY}/db/socket
CONFIG=\${DIRECTORY}/${NODE_CONFIG}-config.json
KES=\${DIRECTORY}/kes.skey
VRF=\${DIRECTORY}/vrf.skey
CERT=\${DIRECTORY}/node.cert
/usr/local/bin/cardano-node +RTS -N --disable-delayed-os-memory-return -I0.1 -Iw300 -A32m -n4m -F1.5 -H2500M -RTS run --topology \${TOPOLOGY} --database-path \${DB_PATH} --socket-path \${SOCKET_PATH} --host-addr \${HOSTADDR} --port \${PORT} --config \${CONFIG} --shelley-kes-key \${KES} --shelley-vrf-key \${VRF} --shelley-operational-certificate \${CERT}
EOF
```

### cardano-nodeを再起動する

```bash
sudo systemctl restart cardano-node
```

### ログを確認する

```bash
sudo journalctl -u cardano-node -f
```

### BPとして起動しているか確認する

```bash
glive
```

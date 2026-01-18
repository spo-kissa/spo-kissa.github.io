---
sidebar_position: 2
title: ノードインストール
description: Cardano ノードのインストール方法
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TemplateCodeGenerator from '@site/src/components/TemplateCodeGenerator';

## Ubuntu の初期設定

[Ubuntu Server の初期設定](./setup-ubuntu-server.md) を実施してから次の手順に進んでください。

## PreviewNet ノードインストール

### 依存関係のインストール

```bash
sudo apt update -y && sudo apt upgrade -y
```

```bash
sudo apt install jq tmux htop curl bc tcptraceroute -y
```

### バイナリをダウンロード

```bash
mkdir -p $HOME/git/cardano-node2
cd $HOME/git/cardano-node2
wget -q https://github.com/IntersectMBO/cardano-node/releases/download/10.5.3/cardano-node-10.5.3-linux.tar.gz
```

### 解凍する

```bash
tar zxvf cardano-node-10.5.3-linux.tar.gz ./bin/cardano-node ./bin/cardano-cli
```

### バージョン確認

```bash
$(find $HOME/git/cardano-node2 -type f -name "cardano-cli") version  
$(find $HOME/git/cardano-node2 -type f -name "cardano-node") version
```

```txt
cardano-cli 10.11.0.0 - linux-x86_64 - ghc-9.6
git rev 6c034ec038d8d276a3595e10e2d38643f09bd1f2

cardano-node 10.5.3 - linux-x86_64 - ghc-9.6
git rev 6c034ec038d8d276a3595e10e2d38643f09bd1f2
```

### インストール

```bash
sudo cp $(find $HOME/git/cardano-node2 -type f -name "cardano-cli") /usr/local/bin/cardano-cli
```

```bash
sudo cp $(find $HOME/git/cardano-node2 -type f -name "cardano-node") /usr/local/bin/cardano-node
```

### インストールされたバージョン確認

```bash
cardano-cli version
cardano-node version
```

```txt
cardano-cli 10.11.0.0 - linux-x86_64 - ghc-9.6
git rev 6c034ec038d8d276a3595e10e2d38643f09bd1f2

cardano-node 10.5.3 - linux-x86_64 - ghc-9.6
git rev 6c034ec038d8d276a3595e10e2d38643f09bd1f2
```

## 環境変数の設定

### 環境変数を設定する

```bash
echo PATH="$HOME/.local/bin:$PATH" >> $HOME/.bashrc
echo export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH" >> $HOME/.bashrc
echo export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH" >> $HOME/.bashrc
echo export NODE_HOME=$HOME/cnode >> $HOME/.bashrc
echo export NODE_CONFIG=preview >> $HOME/.bashrc
echo export NODE_NETWORK='"--testnet-magic 2"' >> $HOME/.bashrc
echo export CARDANO_NODE_NETWORK_ID=2 >> $HOME/.bashrc
echo export CARDANO_NODE_SOCKET_PATH="$NODE_HOME/db/socket" >> $HOME/.bashrc
```

### 環境変数を反映する

```bash
source $HOME/.bashrc
```

## ノード構成ファイルを設定する

### ノード構成ファイルを取得する

```bash
mkdir $NODE_HOME
cd $NODE_HOME
wget -q https://book.play.dev.cardano.org/environments/preview/byron-genesis.json \
  -O ${NODE_CONFIG}-byron-genesis.json
wget -q https://book.play.dev.cardano.org/environments/preview/topology.json \
  -O ${NODE_CONFIG}-topology.json
wget -q https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json \
  -O ${NODE_CONFIG}-shelley-genesis.json
wget -q https://book.play.dev.cardano.org/environments/preview/alonzo-genesis.json \
  -O ${NODE_CONFIG}-alonzo-genesis.json
wget -q https://book.play.dev.cardano.org/environments/preview/conway-genesis.json \
  -O ${NODE_CONFIG}-conway-genesis.json
wget -q https://book.play.dev.cardano.org/environments/preview/peer-snapshot.json \
  -O ${NODE_CONFIG}-peer-snapshot.json
```

<Tabs groupId="node" queryString="node">
  <TabItem value="relay" label="リレーノード">

  ```bash
  wget --no-use-server-timestamps -q https://docs.spo-kissa.org/midnight/10.5.3/preview-config.json \
    -O ${NODE_CONFIG}-config.json
  ```

  </TabItem>
  <TabItem value="bp" label="BPノード">

  ```bash
  wget --no-use-server-timestamps -q https://docs.spo-kissa.org/midnight/10.5.3/preview-config-bp.json \
    -O ${NODE_CONFIG}-config.json
  ```

  </TabItem>
</Tabs>

## 起動スクリプトを作成する

### 起動スクリプトの作成

<Tabs groupId="node" queryString="node">
  <TabItem value="relay" label="リレーノード">

  <TemplateCodeGenerator
    title="リレーノードが使用するポートを入力してコマンドをコピーしてください"
    initialVars={{
      PORT: 'XXXXX',
    }}
  >{`cat > $NODE_HOME/startRelayNode1.sh << EOF
  #!/bin/bash
  DIRECTORY=$NODE_HOME
  PORT={{PORT}}
  HOSTADDR=0.0.0.0
  TOPOLOGY=\${DIRECTORY}/$NODE_CONFIG-topology.json
  DB_PATH=\${DIRECTORY}/db
  SOCKET_PATH=\${DIRECTORY}/db/socket
  CONFIG=\${DIRECTORY}/$NODE_CONFIG-config.json
  /usr/local/bin/cardano-node +RTS -N --disable-delayed-os-memory-return -I0.1 -Iw300 -A16m -F1.5 -H2500M -RTS run --topology \${TOPOLOGY} --database-path \${DB_PATH} --socket-path \${SOCKET_PATH} --host-addr \${HOSTADDR} --port \${PORT} --config \${CONFIG}
  EOF`}
  </TemplateCodeGenerator>

  </TabItem>
  <TabItem value="bp" label="BPノード">

  <TemplateCodeGenerator
    title="BPノードが使用するポートを入力してコマンドをコピーしてください"
    initialVars={{
      PORT: 'XXXXX',
    }}
  >{`cat > $NODE_HOME/startBlockProducingNode.sh << EOF
  #!/bin/bash
  DIRECTORY=$NODE_HOME
  PORT={{PORT}}
  HOSTADDR=0.0.0.0
  TOPOLOGY=\${DIRECTORY}/$NODE_CONFIG-topology.json
  DB_PATH=\${DIRECTORY}/db
  SOCKET_PATH=\${DIRECTORY}/db/socket
  CONFIG=\${DIRECTORY}/$NODE_CONFIG-config.json
  /usr/local/bin/cardano-node +RTS -N --disable-delayed-os-memory-return -I0.1 -Iw300 -A16m -F1.5 -H2500M -RTS run --topology \${TOPOLOGY} --database-path \${DB_PATH} --socket-path \${SOCKET_PATH} --host-addr \${HOSTADDR} --port \${PORT} --config \${CONFIG}
  EOF`}
  </TemplateCodeGenerator>

  </TabItem>
</Tabs>

### 実行権限の付与と実行テスト

<Tabs groupId="node" queryString="node">
  <TabItem value="relay" label="リレーノード">

  ```bash
  cd $NODE_HOME
  chmod +x startRelayNode1.sh
  ./startRelayNode1.sh
  ```

  </TabItem>
  <TabItem value="bp" label="BPノード">

  ```bash
  cd $NODE_HOME
  chmod +x startBlockProducingNode.sh
  ./startBlockProducingNode.sh
  ```

  </TabItem>
</Tabs>

## サービス化する

### サービスユニットファイルを作成する

<Tabs groupId="node" queryString="node">
  <TabItem value="relay" label="リレーノード">

  ```bash
  cat > $NODE_HOME/cardano-node.service << EOF 
  # The Cardano node service (part of systemd)
  # file: /etc/systemd/system/cardano-node.service 

  [Unit]
  Description     = Cardano node service
  Wants           = network-online.target
  After           = network-online.target 

  [Service]
  User            = ${USER}
  Type            = simple
  WorkingDirectory= ${NODE_HOME}
  ExecStart       = /bin/bash -c '${NODE_HOME}/startRelayNode1.sh'
  KillSignal=SIGINT
  RestartKillSignal=SIGINT
  TimeoutStopSec=300
  LimitNOFILE=32768
  Restart=always
  RestartSec=5
  StandardOutput=syslog
  StandardError=syslog
  SyslogIdentifier=cardano-node

  [Install]
  WantedBy    = multi-user.target
  EOF
  ```

  </TabItem>
  <TabItem value="bp" label="BPノード">

  ```bash
  cat > $NODE_HOME/cardano-node.service << EOF 
  # The Cardano node service (part of systemd)
  # file: /etc/systemd/system/cardano-node.service 

  [Unit]
  Description     = Cardano node service
  Wants           = network-online.target
  After           = network-online.target 

  [Service]
  User            = ${USER}
  Type            = simple
  WorkingDirectory= ${NODE_HOME}
  ExecStart       = /bin/bash -c '${NODE_HOME}/startBlockProducingNode.sh'
  KillSignal=SIGINT
  RestartKillSignal=SIGINT
  TimeoutStopSec=300
  LimitNOFILE=32768
  Restart=always
  RestartSec=5
  StandardOutput=syslog
  StandardError=syslog
  SyslogIdentifier=cardano-node

  [Install]
  WantedBy    = multi-user.target
  EOF
  ```

  </TabItem>
</Tabs>

### systemd にユニットファイルをコピーする

```bash
sudo cp $NODE_HOME/cardano-node.service /etc/systemd/system/cardano-node.service
```

### ユニットファイルのパーミッションを設定する

```bash
sudo chmod 644 /etc/systemd/system/cardano-node.service
```

### 自動起動設定を有効にする

```bash
sudo systemctl daemon-reload
```

```bash
sudo systemctl enable cardano-node
```

### サービスを起動する

```bash
sudo systemctl start cardano-node
```

### ログを確認する

```bash
sudo journalctl --unit=cardano-node --follow
```

### サービスを停止する

```bash
sudo systemctl stop cardano-node
```

## Mithril による同期

### ダウンロードディレクトリ作成

```bash
mkdir -p $HOME/git
cd $HOME/git
```

### mithril-client をダウンロード

```bash
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/input-output-hk/mithril/refs/heads/main/mithril-install.sh | sh -s -- -c mithril-client -d latest -p $HOME/git/
```

### システムディレクトリにインストール

```bash
sudo mv $HOME/git/mithril-client /usr/local/bin/mithril-client
```

### mithril-client バージョン確認

```bash
mithril-client -V
```

### 環境変数を設定

```bash
export AGGREGATOR_ENDPOINT=https://aggregator.testing-preview.api.mithril.network/aggregator
export GENESIS_VERIFICATION_KEY=$(curl -fsSL https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/testing-preview/genesis.vkey)
export ANCILLARY_VERIFICATION_KEY=$(curl -fsSL https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/testing-preview/ancillary.vkey)
```

### 既存のDBフォルダを削除

```bash
rm -rf $NODE_HOME/db
```

### 最新のスナップショットをダウンロード

```bash
mithril-client cardano-db download \
  --backend v2 \
  --run-mode testing-preview \
  --download-dir "$NODE_HOME" \
  --include-ancillary \
  latest
```

### cardano-node を起動する

```bash
sudo systemctl start cardano-node
```

### journalctl でログを確認する

```bash
sudo journalctl -u cardano-node -f
```

## Guild LiveView のインストール

### glive をインストールする

```bash
mkdir $NODE_HOME/scripts
cd $NODE_HOME/scripts
```

```bash
curl -s -o gLiveView.sh https://raw.githubusercontent.com/cardano-community/guild-operators/master/scripts/cnode-helper-scripts/gLiveView.sh
curl -s -o env https://raw.githubusercontent.com/cardano-community/guild-operators/master/scripts/cnode-helper-scripts/env
chmod 755 gLiveView.sh
```

### ノードのポートを確認する

<Tabs groupId="node" queryString="node">
  <TabItem value="relay" label="リレーノード">

  ```bash
  PORT=`grep "PORT=" $NODE_HOME/startRelayNode1.sh`
  b_PORT=${PORT#"PORT="}
  echo "リレーポートは${b_PORT}です"
  ```

  </TabItem>
  <TabItem value="bp" label="BPノード">

  ```bash
  PORT=`grep "PORT=" $NODE_HOME/startBlockProducingNode.sh`
  b_PORT=${PORT#"PORT="}
  echo "BPポートは${b_PORT}です"
  ```

  </TabItem>
</Tabs>

### 構成ファイルを書き換える

```bash
sed -i $NODE_HOME/scripts/env \
    -e '1,73s!#CNODE_HOME="/opt/cardano/cnode"!CNODE_HOME=${NODE_HOME}!' \
    -e '1,73s!#CNODE_PORT=6000!CNODE_PORT='${b_PORT}'!' \
    -e '1,73s!#UPDATE_CHECK="Y"!UPDATE_CHECK="N"!' \
    -e '1,73s!#CONFIG="${CNODE_HOME}/files/config.json"!CONFIG="${CNODE_HOME}/'${NODE_CONFIG}'-config.json"!' \
    -e '1,73s!#SOCKET="${CNODE_HOME}/sockets/node.socket"!SOCKET="${CNODE_HOME}/db/socket"!' \
    -e '1,73s!#PROM_HOST=127.0.0.1!PROM_HOST=127.0.0.1!' \
    -e '1,73s!#PROM_PORT=12798!PROM_PORT=12798!'
```

### エイリアスを設定する

`glive` で起動出来るようにします。

```bash
echo alias glive="'cd $NODE_HOME/scripts; ./gLiveView.sh'" >> $HOME/.bashrc
source $HOME/.bashrc
```

### glive を起動してノードの状態を確認する

```bash
glive
```

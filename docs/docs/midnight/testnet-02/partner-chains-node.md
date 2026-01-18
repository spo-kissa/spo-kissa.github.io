---
sidebar_position: 8
title: Partner-Chains-Node の構築
description: Partner Chains Node の構築手順
---

:::warning[はじめに]

[Ubuntu Server の初期設定](./setup-ubuntu-server.md) をおこなってください

:::

## Docker 環境を構築

### apt リポジトリをアップデート

```bash
sudo apt update -y
```

### 依存関係をインストール

```bash
sudo NEEDRESTART_MODE=a apt-get install ca-certificates curl jq uidmap direnv -y
```

### keyrings ディレクトリを設定

```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

### Docker 公式のGPGキーをインポート

```bash
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
```

### パーミッションを設定

```bash
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

### apt ソースにリポジトリを追加

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### apt リポジトリをアップデート

```bash
sudo apt get update -y
```

### Dockerの最新版をインストール

```bash
sudo NEEDRESTART_MODE=a apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

## Docker を rootless モードで動作させる

### Docker サービスを停止・無効化する

```bash
sudo systemctl disable --now docker.service docker.socket
```

### ソケットファイルを削除

```bash
sudo rm /var/run/docker.sock
```

### セットアップスクリプトを起動

```bash
dockerd-rootless-setuptool.sh install
```

### Docker の設定ファイルを作成する

```bash
sudo tee /etc/docker/daemon.json <<EOF > /dev/null
{
  "iptables": false
}
EOF
```

### ログアウトしても Docker コンテナが起動し続けるようにする

```bash
loginctl enable-linger "$USER"
```

### .bashrc に追記する

`.bashrc` に `direnv` が動作するように設定を追記します。

```bash
cat <<EOF >> ~/.bashrc
eval "\$(direnv hook bash)"
EOF
```

### .bashrc を再読み込み

```bash
source ~/.bashrc
```

## ソースを GitHub から取得する

### GitHub からクローン

```bash
cd $HOME
rm -rf midnight-node-docker
git clone https://github.com/midnightntwrk/midnight-node-docker.git
cd midnight-node-docker
```

:::warning[エラーが表示されます]

以下のエラーが表示されますが正常です

```txt
direnv: error /home/cardano/midnight-node-docker/.envrc is blocked. Run `direnv allow` to approve its content
```

:::

### direnv を許可する

```bash
direnv allow
```

## Partner-Chainsを立ち上げる

### Docker Compose コマンドで起動する

```bash
cd $HOME/midnight-node-docker
docker compose -f compose-partner-chains.yml up -d
```

### 同期の進捗をチェックする

```bash
curl -s localhost:1337/health | jq '.'
```

:::info[戻り値について]
以下の戻り値の例の `"networkSynchronization": 1,` の行の `1` が 100%を表します。

この値が `0.01` だった場合は 1% の進捗率です。

例)

```json
{
    "startTime": "2025-10-16T04:15:35.560800405Z",
    "lastKnownTip": {
    "slot": 93950347,
    "id": "af11ea0773230dc562b5cbb6702896737039bb0d558e04173e683c3c0e481500",
    "height": 3693002
    },
    "lastTipUpdate": "2025-10-16T09:19:07.137082421Z",
    "networkSynchronization": 1,
    "currentEra": "conway",
    "metrics": {
    "activeConnections": 0,
    "runtimeStats": {
        "cpuTime": 53945188690,
        "currentHeapSize": 804,
        "gcCpuTime": 46822759954,
        "maxHeapSize": 885
    },
    "sessionDurations": {
        "max": 0,
        "mean": 0,
        "min": 0
    },
    "totalConnections": 0,
    "totalMessages": 0,
    "totalUnrouted": 0
    },
    "connectionStatus": "connected",
    "currentEpoch": 1087,
    "slotInEpoch": 33547,
    "version": "v6.11.0 (6356ede9)",
    "network": "preview"
}
```

:::

### DB-Sync の同期の進捗を確認する

PostgreSQLに接続します

```bash
docker exec -it db-sync-postgres psql -U postgres -d cexplorer
```

SQL を実行します

```sql
SELECT 100 * (
    EXTRACT(EPOCH FROM (MAX(time) AT TIME ZONE 'UTC')) -
    EXTRACT(EPOCH FROM (MIN(time) AT TIME ZONE 'UTC'))
) / (
    EXTRACT(EPOCH FROM (NOW() AT TIME ZONE 'UTC')) -
    EXTRACT(EPOCH FROM (MIN(time) AT TIME ZONE 'UTC'))
) AS sync_percent
FROM block;
```

:::info[戻り値について]
以下の例では、99.9999...%同期が完了しています。
おおよそこの程度同期が完了していればOKです。

例)
```txt
    sync_percent     
---------------------
    99.9999016400555159
(1 row)
```

:::

## 同期が完了するのを待つ

同期が完全に完了するまでお待ちください。

---
sidebar_position: 3
title: トポロジーとファイアーウォール
description: トポロジーの形成とファイアーウォールの設定
---
import TemplateCodeGenerator from '@site/src/components/TemplateCodeGenerator';

## ファイアーウォールの開放

### リレーノードの場合

```bash
PORT=`grep "PORT=" $NODE_HOME/startRelayNode1.sh`
b_PORT=${PORT#"PORT="}
echo "リレーポートは${b_PORT}です"
```

```bash
sudo ufw allow ${b_PORT}/tcp
```

```bash
sudo ufw reload
```

### BPノードの場合

```bash
PORT=`grep "PORT=" $NODE_HOME/startBlockProducingNode.sh`
b_PORT=${PORT#"PORT="}
echo "BPポートは${b_PORT}です"
```

<TemplateCodeGenerator
  title="リレーノードのIPを入力しコマンドをコピーしてください"
  initialVars={{
    RELAY_IP: 'XXX.XXX.XXX.XXX',
  }}
>{`sudo ufw allow from {{RELAY_IP}} to any port $b_PORT proto tcp`}
</TemplateCodeGenerator>

```bash
sudo ufw reload
```

## トポロジーファイルの更新

### リレーノードの場合

<TemplateCodeGenerator
  title="BPノードのIPアドレスとポート番号を入力しコマンドをコピーしてください"
  initialVars={{
    BP_IP: 'XXX.XXX.XXX.XXX',
    BP_PORT: 'XXXXX',
  }}
>{`cat > $NODE_HOME/topology.json << EOF
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [
        {
          "address": "{{BP_IP}}",
          "port": {{BP_PORT}}
        }
      ],
      "advertise": false,
      "trustable": true,
      "valency": 1
    }
  ],
  "peerSnapshotFile": "preview-peer-snapshot.json",
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 83116868
}
EOF`}
</TemplateCodeGenerator>

ノードを再起動します

```bash
sudo systemctl restart cardano-node
```

### BPノードの場合

<TemplateCodeGenerator
  title="リレーノードのIPアドレスとポート番号を入力しコマンドをコピーしてください"
  initialVars={{
    RELAY_IP: 'YYY.YYY.YYY.YYY',
    RELAY_PORT: 'YYYYY'
  }}
>{`cat > $NODE_HOME/topology.json << EOF
{
  "bootstrapPeers": null,
  "localRoots": [
    {
      "accessPoints": [
        {
          "address": "{{RELAY_IP}}",
          "port": {{RELAY_PORT}}
        }
      ],
      "advertise": false,
      "trustable": true,
      "valency": 1
    }
  ],
  "publicRoots": [],
  "useLedgerAfterSlot": -1
}
EOF`}
</TemplateCodeGenerator>

ノードを再起動します

```bash
sudo systemctl restart cardano-node
```

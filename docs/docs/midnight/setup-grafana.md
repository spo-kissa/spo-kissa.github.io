---
description: Grafana の設置
position: 1
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TemplateCodeGenerator from '@site/src/components/TemplateCodeGenerator';

# Grafana の設定

Midnight Node の状況を Grafana で監視する設定方法を説明します

![Grafana](/img/midnight/preview/grafana.png)

## Prometheus のインストール

<Tabs groupId="node" queryString="node">
  <TabItem value="relay1" label="リレーノード">

    ### Prometheus をインストール

    ```bash
    sudo apt install -y prometheus
    ```
  </TabItem>
</Tabs>

## Grafana のインストール

<Tabs groupId="node" queryString="node">
  <TabItem value="relay1" label="リレーノード">

    ### Grafana のインストール準備

    ```bash
    sudo apt install -y apt-transport-https software-properties-common
    ```

    ### Grafana の GPGキーをインポート

    ```bash
    sudo wget -q -O /usr/share/keyrings/grafana.key https://apt.grafana.com/gpg.key
    ```
    ```bash
    cd $HOME
    echo "deb [signed-by=/usr/share/keyrings/grafana.key] https://apt.grafana.com stable main" > grafana.list
    sudo mv grafana.list /etc/apt/sources.list.d/grafana.list
    ```

    ### Grafana をインストール

    ```bash
    sudo apt update -y && sudo apt install -y grafana
    ```

    ### Grafana のサービスを有効化

    ```bash
    sudo systemctl enable --now grafana-server.service
    ```

    ### Prometheus のサービスを有効化

    ```bash
    sudo systemctl enable --now prometheus.service prometheus-node-exporter
    ```

    ### Prometheus の設定を書き換え

    <TemplateCodeGenerator
      title="MidnightノードのIPアドレスを入力しコマンドをコピーしてください"
      initialVars={{
        MID_NODE_IP: 'XXX.XXX.XX.XX',
      }}
    >{`sudo tee /etc/prometheus/prometheus.yml <<EOF >/dev/null
global:
  scrape_interval: 15s # By default, scrape targets every 15 seconds.

scrape_configs:
   - job_name: 'midnight-pool-preview'
     scrape_interval: 10s
     metrics_path: /metrics
     static_configs:
       - targets: ['{{MID_NODE_IP}}:9615']
         labels:
           alias: 'midnight-validator-preview'
EOF`}
    </TemplateCodeGenerator>

    ### Grafana プラグインをインストール

    `grafana-clock-panel` プラグインをインストールします

    ```bash
    sudo grafana-cli plugins install grafana-clock-panel
    ```

    ### Grafana の再起動

    ```bash
    sudo systemctl restart grafana-server.service
    ```

  </TabItem>
</Tabs>

<Tabs groupId="node" queryString="node">
  <TabItem value="midnight" label="Midnightノード">

    ### ファイアーウォールの設定
    
    リレーノードからメトリクスポートへのアクセスを許可します

    <TemplateCodeGenerator
      title="リレーノードの IPアドレスを入力してコマンドをコピーしてください"
      initialVars={{
        RELAY_IP: 'XX.XXX.XX.XXX',
      }}
    >{`sudo ufw allow from {{RELAY_IP}} to any port 9615 proto tcp comment 'Grafana'`}
    </TemplateCodeGenerator>

  </TabItem>
</Tabs>

## Grafana パネル設定

オリジナルは [こちら](https://github.com/DevStakePool/DevStakePool/tree/main/midnight) で公開されています

以下のどちらからかjsonファイルをローカルにダウンロードします。

- [grafana-midnight-validator.json](https://raw.githubusercontent.com/DevStakePool/DevStakePool/refs/heads/main/midnight/grafana-midnight-validator.json)
- [grafana-midnight-validator.json](/midnight/grafana-midnight-validator.json) (mirror)

### Grafana を開く

以下のアドレスをブラウザで開く

http://リレーのIPアドレス:3000

開かない場合はリレーノードにてファイアーウォールを解放する

```bash
sudo ufw allow 3000/tcp
```

#### 初期ユーザーでログイン

初期ユーザーは `admin`、パスワードは `admin` です

#### 初期ユーザーのパスワードを変更

パスワード変更画面が表示されるので `admin` のパスワードを変更します

### Data Source を追加する

左メニューの `Connections` から `Data Sources` を選択し `Add data source` ボタンをクリックします

![Add data source](/img/midnight/preview/grafana/add-data-source.png)

`Prometheus` を一覧から探し選択します

![Add data source Prometheus](/img/midnight/preview/grafana/add-data-source-prometheus.png)

`Connection` の `Prometheus server URL` の値を `http://localhost:9090` に設定します

![Prometheus server URL](/img/midnight/preview/grafana/prometheus-server-url.png)

画面を一番下までスクロールし `Save & test` をクリックします

![Prometheus Save & test](/img/midnight/preview/grafana/prometheus-save-and-test.png)

`Successfully queried the Prometheus API.` と表示されたら、`building a dashboard` をクリックします

![Prometheus Save & test Successfully](/img/midnight/preview/grafana/prometheus-save-and-test-successfully.png)

`Import dashboard` ボタンをクリックします

![New dashboard](/img/midnight/preview/grafana/new-dashboard.png)

`Upload dashboard JSON file` の箇所に、先ほどダウンロードしたJSONファイルをドラッグ&ドロップするか、クリックしてJSONファイルを選択します

![Import dashboard](/img/midnight/preview/grafana/import-dashboard.png)

下記の画面になったら、`Import`ボタンをクリックします

![Import dashboard](/img/midnight/preview/grafana/import-dashboard-ready.png)

以上でダッシュボードが表示されるようになるかと思います

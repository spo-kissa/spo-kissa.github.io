---
sidebar_position: 4
title: ctool のセットアップ
---

## ctool の起動方法

Docker Airgap のコンソールで以下のコマンドを実行します (実行場所はどこでも構いません)

```bash
ctool
```

## ctool の初回設定

### 1. ネットワークの選択

ctool を初めて起動すると下記のように、使用するネットワークを選択する画面が表示されます

上下キーを使って使用するネットワークを選択し、Enterキーを押して確定します

**特に理由がなければ `メインネット` を選択してください**

![Select Network](/img/airgap/ctool/select-network.png)

### 2. 確認

選択したネットワークの確認メッセージが表示されます

左右キーまたはy/nキーを使って `はい` か `いいえ` を選択してください

![Select Network Confirm](/img/airgap/ctool/select-network-confirm.png)

### 3. 初期化メニュー

初期化メニューが表示されます

1. 既存プールのエアギャップから移行する場合は `コールドキーをインポートする` を選択します
2. 新しいプールを立ち上げる場合は `新規ノードを立ち上げる` を選択します

![Setup Menu](/img/airgap/ctool/setup-menu.png)

### 4. コールドキーのインポート準備

`airgap-ticker/share` ディレクトリ内に全てのコールドキーファイルを貼り付けます

![Copy Key Files](/img/airgap/ctool/copy-key-files.png)

### 5. コールドキーのチェック失敗時

Enterキーを押下するとコールドキーファイルのチェックがおこなわれます

キーファイルの一部に問題があれば以下のような画面になりますので、そのファイルを確認してください

![Check Key Files Failed](/img/airgap/ctool/check-key-files-failed.png)

### 6. コールドキーのチェック成功

ファイルに問題がなければインポート開始できます

![Check Key File Success](/img/airgap/ctool/check-key-files-success.png)

### 7. コールドキーのインポート

キーファイルがエアギャップ内にインポートされます

同時にコールドキーの暗号化をおこなうかどうかを選択できます

※ コールドキーの暗号化については後述します

ここでは `いいえ` を選択します

![Import Success](/img/airgap/ctool/import-key-files-success.png)

### 8. 完了

`ctool` の初期化が完了し、メインメニューが表示されます

![Main Menu](/img/airgap/ctool/main-menu.png)

## ctool のヘッダーの見方

![Header](/img/airgap/ctool/header.png)

- SPO JAPAN GUILD TOOL for Airgap
- vX.X.XX on Dockerfile vYY.Y.Y.Z
  - X.X.XX
    - ctoolのバージョンを表します
  - YY.Y.Y
    - cardano-cliが含まれていたノードバージョンが設定されます
  - .Z
    - Dockerfileのリビジョン番号を表します
- Network
  - ネットワークを表します
    - mainnet
    - preprod
    - preview
- CLI
  - cardano-cli のバージョンを表します
- Disk残容量
  - エアギャップが使用出来るディスク残容量
- Calidus Keys
  - Calidus 鍵が保管されているかを表します
- Cold Keys
  - コールド 鍵が保管されているかを表します
    - ENCRYPTED🔒 - 暗号化されている状態
    - YES🔓 - 暗号化されていない状態

## メニューの構成

- ウォレット操作
  - プール報酬(stake.addr)を任意のアドレス(ADAHandle)へ出金
  - プール報酬(stake.addr)をpayment.addrへ出金
  - プール資金(payent.addr)を任意のアドレス(ADAHandle)へ出金
  - ホームへ戻る
  - 終了
- KES更新
- ガバナンス(登録・投票)
  - SPO投票
  - ホームへ戻る
  - 終了
- Calidusキーの発行
- ファイル転送
  - shareディレクトリにコピー
  - shareディレクトリからコピー
  - ホームへ戻る
  - 終了
- 各種設定
  - キーをインポート
  - cardano-cliバージョンアップ
  - ctoolバージョンアップ
  - キー暗号化
  - キー復号化
  - キーハッシュ生成
  - キーハッシュ検証
  - ホームへ戻る
  - 終了
- 終了

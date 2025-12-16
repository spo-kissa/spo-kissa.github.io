---
title: Docker Airgap の使い方
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Docker Airgap とは？

1. Docker Airgap は Windows / macOS / Linux いずれの環境でも同様の操作性を提供します
1. `cardano-cli`、`cardano-signer` コマンドが標準で付属します
1. 各コマンドを簡単に扱うためのツール `ctool` というツールが付属しています
    - `ctool` は `gtool` と連携しエアギャップで作業効率を向上させる事ができます

## Docker Airgap をダウンロードする

[GitHub Releases](https://github.com/spo-kissa/cardano-airgap/releases)
ページから環境に応じたファイルをダウンロードします。

<Tabs groupId="operating-systems" queryString="os">
  <TabItem value="win" label="Windows">
    **airgap-xx.x.x.x-win.zip**
  </TabItem>
  <TabItem value="mac" label="macOS">
    **airgap-xx.x.x.x.tar.gz**
  </TabItem>
</Tabs>

## Docker Airgap を初期設定する

<Tabs groupId="operating-systems" queryString="os">
  <TabItem value="win" label="Windows">
    1. C ドライブ直下に `Cardano` ディレクトリを作成します

    2. `Cardano` ディレクトリ内に先ほどダウンロードした ZIP ファイルをコピーまたは移動します

    3. ZIP ファイルを右クリックし、メニューから `全て展開...` を選択します

    ![](/img/airgap/docker/win-zip-popup-menu.png)

    4. `圧縮(ZIP形式)フォルダーの展開` ダイアログで展開先を `C:\Cardano` にし `展開` を選択します

    ![](/img/airgap/docker/win-unzip-dialog.png)

    5. `C:\Cardano` ディレクトリ内に `airgap` ディレクトリが作成されている事を確認します

    ![](/img/airgap/docker/win-unzip-airgap-folder.png)

    6. `airgap` ディレクトリの名称を `airgap-ticker` に変更します

    7. `airgap-ticker` ディレクトリを右クリックし `ターミナルで開く` を選択します

    ![](/img/airgap/docker/win-open-terminal.png)

    8. ターミナルで以下のコマンドを実行します

    ```bash
    .\start.bat
    ```

    9. ターミナルのプロンプトが緑色で `cardano@xxxxxxx:~$` と表示されれば、初期設定は完了です

    ![](/img/airgap/docker/win-airgap-started.png)

  </TabItem>
  <TabItem value="mac" label="macOS">
    1. ターミナルアプリを起動し、以下のコマンドを実行すると、Finder が表示されます

    ```bash
    mkdir ~/Cardano
    cd ~/Cardano
    open .
    ```

    2. `Cardano` ディレクトリ内に先ほどダウンロードした `tar.gz` ファイルをコピーまたは起動します

    3. `tar.gz` ファイルをダブルクリックし解凍します

    4. `Cardano` ディレクトリ内に `airgap` ディレクトリが作成されている事を確認します

    5. `airgap` ディレクトリを `airgap-ticker` に変更します

    6. ターミナルで、以下のコマンドを実行します

    ```bash
    cd ~/Cardano/airgap-ticker
    ./start.sh
    ```

    7. ターミナルのプロンプトが緑色で `cardano@xxxxxxx:~$` と表示されれば、初期設定は完了です

  </TabItem>
</Tabs>

## Docker Airgap の共有フォルダ

**Docker Airgap では直接ネットワークには繋がらないように設定されています**
<Tabs groupId="operating-systems" queryString="os">
  <TabItem value="win" label="Windows">
    `Docker Airgap` の `/mnt/share/` ディレクトリと Windows の `airgap-ticker\share\` ディレクトリが共有ディレクトリとなり、ファイルやフォルダのやり取りが可能です
  </TabItem>
  <TabItem value="mac" label="macOS">
    `Docker Airgap` の `/mnt/share/` ディレクトリと macOS の `airgap-ticker/share/` ディレクトリが共有ディレクトリとなり、ファイルやフォルダのやり取りが可能です
  </TabItem>
</Tabs>

## Docker Airgap の終了のしかた

1. `Docker Airgap` のプロンプトで `exit` コマンドを実行しログアウトします

<Tabs groupId="operating-systems" queryString="os">
  <TabItem value="win" label="Windows">
    2. ターミナルで `exit` を実行しターミナル画面を閉じます
  </TabItem>
  <TabItem value="mac" label="macOS">
    2. ターミナルの左上の赤い✖ボタンをクリックしてターミナル画面を閉じます
  </TabItem>
</Tabs>
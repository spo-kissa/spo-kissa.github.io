---
sidebar_position: 1
title: Ubuntu Server の初期設定
description: Ubuntu Server 22.04 のセキュリティ設定など
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TemplateCodeGenerator from '@site/src/components/TemplateCodeGenerator';

## Cardano ユーザーを作成する

### 現在のユーザーを確認する

```bash
echo "現在のユーザーは $(whoami) です"
```

### 新しいユーザー名を設定する

```bash
NAME="cardano"
```

<Tabs groupId="user" queryString="user">
  <TabItem value="root" label="現在のユーザーがrootの場合">

  ```bash
  adduser $NAME
  ```

  </TabItem>
  <TabItem value="other" label="それ以外の場合">

  ```bash
  sudo adduser $NAME
  ```

  </TabItem>
</Tabs>

```txt
New Password:
Retype new password:
Enter the new value, or press ENTER for the default
        Full Name []:
        Room Number []:
        Work Phone []:
        Home Phone []:
        Other []:
Is the information correct? [Y/n]:
```

### ユーザーを sudo グループに追加する

<Tabs groupId="user" queryString="user">
  <TabItem value="root" label="現在のユーザーがrootの場合">

  ```bash
  usermod -G sudo $NAME
  ```

  </TabItem>
  <TabItem value="other" label="それ以外の場合">

  ```bash
  sudo usermod -G sudo $NAME
  ```

  </TabItem>
</Tabs>

### ログアウトする

```bash
exit
```

### 新しいユーザーでログインする

先ほど作成した ユーザー と パスワード で再接続します。

## ユーザーの設定をする

### ブランケットペーストモードをOFFにする

```bash
echo "set enable-bracketed-paste off" >> ~/.inputrc
```

### 再度ログアウトして再接続する

ログアウトし再接続することでブランケットペーストモードOFFを有効にします。

```bash
exit
```

## SSH 鍵認証方式へ切り替え

### 鍵ペアの作成

```bash
ssh-keygen -t ed25519 -N '' -C ssh_connect -f ~/.ssh/ssh_ed25519
```

### 鍵ペアの確認

.ssh ディレクトリ内に ssh_ed25519 ファイルと ssh_ed25519.pub ファイルが出来ている事を確認します。

```bash
cd ~/.ssh
ls
```

### 鍵で認証出来るようにする

公開鍵 (ssh_ed25519.pub) を authorized_keys ファイルにコピーすることで秘密鍵 (ssh_ed25519) で認証が出来るようにします。

```bash
cat ssh_ed25519.pub >> authorized_keys
```

### 鍵ファイルの権限を設定する

セキュリティのためにパーミッションを設定します。

```bash
chmod 600 authorized_keys
chmod 700 ~/.ssh
```

### 鍵ファイルをダウンロードする

SFTPなどを使用して .ssh フォルダ内の ssh_ed25519.pub ファイルと ssh_ed25519 ファイルをローカルにダウンロードします。

### ssh_config を書き換える

SSH の設定ファイル `/etc/ssh/sshd_config` のセキュリティ設定を書き換えます。

```bash
sudo sed -i.bak -E '/^[[:space:]]*#/!{
  /^([[:space:]]*)KbdInteractiveAuthentication\b/{ s/^/#/; a\
KbdInteractiveAuthentication no
  }
  /^([[:space:]]*)PasswordAuthentication\b/{ s/^/#/; a\
PasswordAuthentication no
  }
  /^([[:space:]]*)PermitRootLogin\b/{ s/^/#/; a\
PermitRootLogin no
  }
  /^([[:space:]]*)PermitEmptyPasswords\b/{ s/^/#/; a\
PermitEmptyPasswords no
  }
}' /etc/ssh/sshd_config
```

### SSH ポート番号を変更する

SSH のポート番号をデフォルトの 22 番から変更します。
ポート番号は 49513～65535 の間の数値を自由に決めて設定してください。

<TemplateCodeGenerator
  title="ポート番号を入力しコマンドをコピーしてください"
  initialVars={{
    SSH_PORT: 'XXXXX'
  }}
>{`sudo sed -i.port -E "s/^#Port[[:space:]]*22([[:space:]].*)?$/Port {{SSH_PORT}}/" /etc/ssh/sshd_config`}
</TemplateCodeGenerator>

### SSH 設定ファイルの構文をチェックする

```bash
sudo sshd -t
```

### SSH 設定ファイルを再読み込みする

```bash
sudo service sshd reload
```

## ファイアーウォールを有効化する

### SSH のポートを確認する

```bash
SSH_PORT=`grep "Port" /etc/ssh/sshd_config | sed -e 's/[^0-9]//g'`
echo "SSHのポート番号は ${SSH_PORT} です"
```

### SSH のポートを開放する

```bash
sudo ufw allow ${SSH_PORT}/tcp
```

### ファイアーウォールを有効にする

```bash
sudo ufw enable
```

### ファイアーウォールの状態を確認する

```bash
sudo ufw status numbered
```

### SSH 新規接続

接続中の SSH 接続はそのままにして、秘密鍵を指定、ポート番号を変更して新規接続してみる。

## システムの自動更新を有効にする

### パッケージのインストール

```bash
sudo apt install unattended-upgrades -y
```

### 自動更新を有効にする

```bash
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## fail2ban のインストール

### fail2ban をインストールする

```bash
sudo apt install fail2ban -y
```

### SSH ポート番号を確認する

```bash
SSH_PORT=`grep "Port" /etc/ssh/sshd_config | sed -e 's/[^0-9]//g'`
echo "SSHのポート番号は ${SSH_PORT} です"
```

### 設定ファイルを作成する

```bash
sudo tee /etc/fail2ban/jail.local <<EOF >/dev/null
[sshd]
enabled = true
port = $SSH_PORT
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF
```

### fail2ban を再起動する

再起動し設定を反映させます。

```bash
sudo systemctl restart fail2ban
```

## Chrony のインストール

### chrony をインストールする

```bash
sudo apt install chrony -y
```

### 設定ファイルを変更する

```bash
sudo tee /etc/chrony/chrony.conf <<EOF >/dev/null
pool time.google.com       iburst minpoll 2 maxpoll 2 maxsources 3 maxdelay 0.3
pool time.facebook.com     iburst minpoll 2 maxpoll 2 maxsources 3 maxdelay 0.3
pool time.euro.apple.com   iburst minpoll 2 maxpoll 2 maxsources 3 maxdelay 0.3
pool time.apple.com        iburst minpoll 2 maxpoll 2 maxsources 3 maxdelay 0.3
pool ntp.ubuntu.com        iburst minpoll 2 maxpoll 2 maxsources 3 maxdelay 0.3

# This directive specify the location of the file containing ID/key pairs for
# NTP authentication.
keyfile /etc/chrony/chrony.keys

# This directive specify the file into which chronyd will store the rate
# information.
driftfile /var/lib/chrony/chrony.drift

# Uncomment the following line to turn logging on.
#log tracking measurements statistics

# Log files location.
logdir /var/log/chrony

# Stop bad estimates upsetting machine clock.
maxupdateskew 5.0

# This directive enables kernel synchronisation (every 11 minutes) of the
# real-time clock. Note that it can’t be used along with the 'rtcfile' directive.
rtcsync

# Step the system clock instead of slewing it if the adjustment is larger than
# one second, but only in the first three clock updates.
makestep 0.1 -1

# Get TAI-UTC offset and leap seconds from the system tz database
leapsectz right/UTC

# Serve time even if not synchronized to a time source.
local stratum 10
EOF
```

### ファイアーウォールを開放する

```bash
sudo ufw allow 123/udp
```

### 設定を有効化する

```bash
sudo systemctl restart chronyd
```

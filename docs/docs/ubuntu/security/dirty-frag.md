---
title: Dirty Frag 脆弱性
description: Dirty Frag 脆弱性の確認との対処方法
---

## 確認方法

### 以下のコマンドを実行

```bash
grep -qE '^(esp4|esp6|rxrpc) ' /proc/modules && echo "脆弱性有り" || echo "脆弱性無し"
```

脆弱性有りと表示された場合にのみ次の手順を行ってください。

## 手動による緩和策

### モジュールをブロックする

`/etc/modprobe.d/dirty-frag.conf` ファイルを作成してモジュールをブロックします。

```bash
echo "install esp4 /bin/false" | sudo tee /etc/modprobe.d/dirty-frag.conf
echo "install esp6 /bin/false" | sudo tee -a /etc/modprobe.d/dirty-frag.conf
echo "install rxrpc /bin/false" | sudo tee -a /etc/modprobe.d/dirty-frag.conf
```

起動時にモジュールがロードされないように、initramfs イメージを再生成します。

```bash
sudo update-initramfs -u -k all
```

### モジュールのアンロード

```bash
sudo rmmod esp4 esp6 rxrpc 2>/dev/null 
```

### モジュールがロードされていないことを確認する

```bash
grep -qE '^(esp4|esp6|rxrpc) ' /proc/modules && echo "脆弱性有り" || echo "脆弱性無し"
```

ここで「脆弱性無し」となっていれば次の手順は不要です。

「脆弱性あり」となっている場合は、次の手順で再起動が必要となり、アプリケーションに何らかの影響が出る可能性があります。

### システム再起動

```bash
sudo reboot
```

## 緩和策を無効にする

カーネルのアップデートが利用可能になりインストールされたら、この緩和策は以下の手順で削除出来ます。

```bash
sudo rm /etc/modprobe.d/dirty-frag.conf
sudo update-initramfs -u -k all
```

出典：[Dirty Frag Linux kernel local privilege escalation vulnerability mitigations](https://ubuntu.com/blog/dirty-frag-linux-vulnerability-fixes-available)

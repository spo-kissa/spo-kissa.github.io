---
title: コミット署名する
description: 署名付きコミットをおこなう
---
import TemplateCodeGenerator from '@site/src/components/TemplateCodeGenerator';

## macOS の場合

### GPG で署名する

#### 必要なツールを入れる

```bash
brew install gnupg pinentry-mac
```

#### GPG 鍵を作成する

```bash
gpg --full-generate-key
```

- 鍵の種類: RSA と RSA
- 鍵長: 4096
- 有効期限: お好みで(デフォルト:無期限)
- 本名: ハンドル名可
- 電子・メールアドレス: **GitHub に登録しているメールアドレスと同じものを指定する(重要)**
- コメント: 省略可

#### 鍵IDの確認

```bash
gpg --list-secret-keys --keyid-format=long
```

戻り値の例:

```txt
sec   rsa4096/1234ABCD5678EFGH 2025-12-21 [SC]
      9AAA1111BBBB2222CCCC3333DDDD4444EEEE5555
uid                 [  究極  ] Your Name <you@example.com>
ssb   rsa4096/AAAA9999BBBB8888 2025-12-21 [E]
```

上記の例で鍵IDは、`1234ABCD5678EFGH` になります

#### Git に「この鍵で署名する」と指定する

<TemplateCodeGenerator
  title="鍵IDを入力してコマンドをコピーしてください"
  language="bash"
  initialVars={{
    KEYID: '1234ABCD5678EFGH',
  }}
>{`git config --global user.signingkey {{KEYID}}
git config --global commit.gpgsign true
`}</TemplateCodeGenerator>

### pinentry の設定

```bash
mkdir -p ~/.gnupg
echo "pinentry-program $(brew --prefix)/bin/pinentry-mac" > ~/.gnupg/gpg-agent.conf
echo "use-agent" > ~/.gnupg/gpg.conf
echo 'export GPG_TTY=$(tty)' >> ~/.zshrc
source ~/.zshrc
gpgconf --kill gpg-agent
```

### 公開鍵を GitHub に登録

#### 公開鍵を ASCII 形式で出力

<TemplateCodeGenerator
  title="鍵IDを入力してコマンドをコピーしてください"
  language="bash"
  initialVars={{
    KEYID: '1234ABCD5678EFGH',
  }}
>{`gpg --armor --export {{KEYID}}`}</TemplateCodeGenerator>

### コミット時にエラーが出る場合

:::warning[Git の "user.name" と "user.email" を構成していることを確認してください。]

以下を実行して user.name と user.email の設定をしてください

<TemplateCodeGenerator
  title="ユーザー名とメールアドレスを入力してコマンドをコピーしてください"
  language="bash"
  initialVars={{
    USER_NAME: 'Your Name',
    USER_EMAIL: 'your-email@example.com',
  }}
>{`git config --global user.name "{{USER_NAME}}"
git config --global user.email "{{USER_EMAIL}}"
`}</TemplateCodeGenerator>

:::

---
sidebar_position: 1
title: Docker Airgap の概要
---
import Mermaid from '@theme/Mermaid';

## Docker Airgap とは？

Docker を利用し軽量な Ubuntu 環境を全自動で構築します

1. Docker Airgap は Windows / macOS / Linux いずれの環境でも同様の操作性を提供します
1. `cardano-cli`、`cardano-signer` コマンドが標準で付属します
1. 各コマンドを簡単に扱うためのツール `ctool` というツールが付属しています
    - `ctool` は `gtool` と連携しエアギャップでの作業効率を向上させます

## ctool とは？

SJGTool (gtool) と組み合わせて使用することでエアギャップでの作業効率を向上させます

エアギャップの共有ディレクトリから `cnode` ディレクトリにファイルを自動的にコピーをおこなったり、
`cnode` ディレクトリから共有ディレクトリにファイルを自動的にコピーするなど、
一手間二手間をを補完する事で作業効率をアップさせます。

### 出金トランザクション送信例

<Mermaid
  value={`sequenceDiagram;
    participant G as gtool<br/>BPのcnode;
    participant S as share;
    participant C as ctool<br/>エアギャップのcnode;
    Note over G: 出金処理開始;
    G->>S: tx.raw ファイルを転送;
    critical ctoolを使用すれば
      S-->>C: tx.raw ファイル自動コピー;
      Note over C: tx.raw 署名処理;
      Note over C: tx.signed 生成;
      C-->>S: tx.signed ファイル自動コピー;
    end
    S->>G: tx.signed ファイルを転送;
    Note over G: トランザクション送信;`}
/>

## 動作環境

- Windows
- macOS (Intel / Apple Silicon)
- Linux

## GitHub リポジトリ

[https://github.com/spo-kissa/cardano-airgap](https://github.com/spo-kissa/cardano-airgap)

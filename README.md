## セットアップと実行手順

以下の手順に従って、アプリケーションをローカル環境にセットアップし実行してください。

### 前提条件
以下がインストールされていること

- git
- corretto17jdk
- maven
- docker-desktop
- yarn
- nodejs-lts

### インストール手順

1. リポジトリをクローンします：
```bash
git clone <リポジトリのURL>
cd <リポジトリ名>
```

2. 依存関係をインストールします：
```bash
yarn install
```

### アプリケーションの実行
```bash
yarn dev --open
```



# Fly.io でマルチプレイゲームサーバーを立てる

## techniques

- Fly.io では、1つのアプリにつき1つのURLしか割り当てられない
  - 専用ゲームサーバーを立てる場合は、サーバー毎(マッチ毎)にurlが割り当てられる必要がある
  - 別のゲームサーバーは別のアプリ名で立てる？
  - https://community.fly.io/t/how-to-create-multiple-servers-with-unique-urls-for-region-based-selection/11375


## drizzle-orm

drizzle-orm
`drizzle-kit` を使うには、依存関係を別途インストールしておく必要がある

```sh
yarn add drizzle-orm pg
yarn add -D drizzle-kit @types/pg

or 

deno cache npm:drizzle-orm npm:pg
deno cache npm:drizzle-kit npm:@types/pg
```

一瞬、bun migrateが聞かない事があった
node_modules を削除してから、再度インストールしたら動いた

## Fly machine API

Fly の VM を手動でスケールイン・アウトさせるための low level API

https://fly.io/docs/machines/

### Machine state

- created
- started
- stopped
  
すぐに使い回す場合は、新しく作り直すよりstoppedなマシンを使い回した方が早い

### flyctl machine clone

clone で既存のマシンを複製して新しいマシンを作る。
コマンドを実行するランタイムに Dockerfile やソースコードを用意しなくても良さそう。
Machine to Machine 操作でサーバーを用意するのに使えそう

clone

```sh
fly machine clone [machine-id]
or
fly machine clone -a [app-name] --region nrt [machine-id]
```



machine-id を省くとcliで聞かれる
ただし、 Machine API でマシンを増やしても同じApp内に増えるので、URLが同じ？

### flyctl machine destroy



# Drizzle ORM

SQLite の Strict table モードがサポートされてない

# bun build

https://bun.sh/docs/bundler

コードをバンドリングすることができる。
しかし、環境変数が埋込されるのでサーバーサイドアプリはバンドルしないほうがいいかも


本番関係の依存だけをインストールして、node_modules をビルド後イメージに含めて実行
```sh
bun install --production
```



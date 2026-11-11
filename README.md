# スタンプでつたえる（stamp-call）

気持ちや「おわりました」を言葉で伝えにくい子が、タブレットのスタンプを押すだけで職員に伝えられるアプリ（PWA）です。
ストアには出さず、GitHub Pages の URL を開いて使います。

- 児童の端末：大きなスタンプを押す → 画面がふわっと光り、音が鳴る。3秒間は続けて送れない
- 職員の端末：届いたスタンプが新しい順に並ぶ。届くと音・画面の点滅（Android はバイブも）。確認していないものがあると30秒ごとに鳴り直す
- 「確認した」を押すと、児童の画面に「👀 せんせいが みたよ」
- 届いたスタンプは24時間で消える
- 子どもの名前は入れない（端末は 🐶あお などのしるしで見分ける）

使っている物：React + Vite / vite-plugin-pwa / Firebase Realtime Database（無料枠）＋匿名ログイン / GitHub Pages

> **このリポジトリは公開です。** 子どもの名前・写真・事業所名などは、コードにも設定ファイルにも入れないでください。

---

## 1. Firebase のプロジェクトを作る（最初の1回）

1. https://console.firebase.google.com を開いてログイン
2. 「プロジェクトを作成」→ 名前（例：`stamp-call`）→ Googleアナリティクスはオフで OK → 作成
3. **匿名ログインをオンにする**
   左のメニュー「構築」→「Authentication」→「始める」→「ログイン方法」タブ →「匿名」→ 有効にする → 保存
4. **承認済みドメインを足す**
   Authentication の「設定」タブ →「承認済みドメイン」→「ドメインを追加」→ `jy-welfapps.github.io`
5. **データベースを作る**
   「構築」→「Realtime Database」→「データベースを作成」→ 場所：**シンガポール（asia-southeast1）**→「**ロックモードで開始**」
6. **ルールを貼る**
   Realtime Database の「ルール」タブに、このリポジトリの [`database.rules.json`](database.rules.json) の中身を**全部貼り替えて**「公開」
7. **ウェブアプリを登録**
   歯車 →「プロジェクトの設定」→「マイアプリ」→「</>」（ウェブ）→ ニックネームを入れて登録（Hosting はチェックしない）
   → `const firebaseConfig = { ... }` が出る

## 2. Firebase の設定値を入れる

[`src/firebaseConfig.js`](src/firebaseConfig.js) の `''` の所に、7. で出た値を入れます。

```js
export const firebaseConfig = {
  apiKey: 'AIza....' || env.VITE_FIREBASE_API_KEY,
  authDomain: 'stamp-call-xxxx.firebaseapp.com' || env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: 'https://stamp-call-xxxx-default-rtdb.asia-southeast1.firebasedatabase.app' || env.VITE_FIREBASE_DATABASE_URL,
  ...
}
```

- この値はパスワードではありません（アプリに入って公開される前提の値）。データは 6. のルールで守ります
- `databaseURL` が入っていない時は、Realtime Database の画面の上に出ている URL を入れてください

## 3. GitHub Pages で公開する（最初の1回）

1. このリポジトリの「Settings」→ 左の「Pages」
2. 「Build and deployment」の Source：**GitHub Actions**
3. `main` に変更を入れると自動でビルドして公開されます（「Actions」タブで緑のチェックが出たら完了）
4. URL：`https://jy-welfapps.github.io/stamp-call/`

## 4. 現場での使い方

### はじめの設定（端末ごとに1回）
1. **職員の端末**で URL を開く →「職員モード」→ 部屋コードの「新しく作る」→「はじめる」
   - 画面の上に出る**部屋コード**を控える（同じコードの端末どうしがつながる）
2. **児童の端末**で URL を開く →「児童モード」→ 同じ部屋コードを入れる
   - しるし（🐶あお など）を選ぶ。職員の画面にはこのしるしで出る
   - スタンプの数を選ぶ（**最初は「1こ（おわった だけ）」から**がおすすめ）
3. どちらも「**ホーム画面に追加**」しておくと、アプリのように開ける
   - iPad（Safari）：共有ボタン →「ホーム画面に追加」
   - Android（Chrome）：右上の「︙」→「ホーム画面に追加」または「アプリをインストール」
4. 次からは、開くと自動で同じ画面になる

### 職員の端末
- **画面はつけっぱなしにする**。閉じたり画面が消えたりすると届かない
  - アプリは「画面を消さない」機能を使う（上に「画面ON」と出ていれば OK）
  - 端末の自動ロックも「なし」に（iPad：設定 → 画面表示と明るさ → 自動ロック → なし）
  - 充電しながら置く
- 開いた時に「🔔 ここをタップして音をオンにする」が出たら、タップする（iPad は一度タップしないと音が出ない）
- 部屋コードの確認・最初の画面にもどる時は、右上の「⚙ 設定」
- 「× つながっていません」と出たら Wi-Fi を確認する。もどると自動でつながる
- 届いたら子どものところへ行き、「確認した」を押す
- iPad はバイブしません（音と画面の点滅で知らせます）

### 児童の端末
- iPad は「アクセスガイド」、Android は「画面の固定」を使うと、ほかのアプリに行けなくなる
- 部屋コードの確認・設定の画面にもどる時：**右上のうすい ⚙ を2秒長押し、またはすばやく5回タップ**（押している間オレンジになる）→ 職員用の問題に答える

## 5. スタンプを変える

[`src/config/stamps.json`](src/config/stamps.json) を書きかえます。

- `stamps`：スタンプの文言（`label`）・絵文字（`emoji`）・背景の色（`color`）
- 自作の絵にする時：`public/stamps/` に SVG（または PNG）を置き、`"image": "stamps/owatta.svg"` のように書く（`emoji` より優先）
- `sets`：子ども（端末）ごとに選べるセット。`columns` は横に並べる数
- `devices`：端末のしるし（アイコン・色）
- `cooldownSeconds`（連打防止の秒数）、`keepHours`（何時間で消すか）、`staffRepeatSeconds`（未確認を鳴らし直す間隔）

## 手元で動かす（開発する人向け）

```bash
npm install
npm run dev
```

Firebase エミュレーターで試す時は、`firebase emulators:start --only auth,database --project demo-stamp` を起動し、
`VITE_USE_EMULATOR=1` と `VITE_FIREBASE_*`（`VITE_FIREBASE_DATABASE_URL=http://127.0.0.1:9000?ns=demo-stamp-default-rtdb` など）を付けて `npm run dev`。

## しくみ（メモ）

- データ：`rooms/{部屋コード}/members/{uid}`（部屋に入った端末）、`rooms/{部屋コード}/stamps/{id}`（スタンプ）
- ルール：ログインしていて、その部屋に登録した端末だけが、その部屋のスタンプを読み書きできる。決まった項目以外は書けない
- 24時間で消す：Realtime Database には自動で消す機能がないので、職員の端末が開いた時と1時間ごとに古いものを消す。画面にも24時間より前のものは出さない

## 新しい版にする

アプリは一度開くと端末に保存されます。新しい版を公開すると、開いた時・画面に戻った時に自動で入れ替わります。
入れ替わらない時は、アプリを閉じて開き直す（児童の画面の左下・設定の画面に版の番号 v0.2.0 などが出ます）。

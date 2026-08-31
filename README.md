# iPhone購入管理

外出先でiPhone購入情報を素早く入力し、Googleスプレッドシートへ転記するWebアプリ（MVP）です。

## 機能

- 購入情報の選択式入力（ID、メール、機種、色、個数、カード、注文番号）
- 合計金額の自動計算
- localStorage による一時保存（ブラウザを閉じてもデータ保持）
- 未転記件数・合計金額の表示
- Googleスプレッドシートへの一括転記
- 二重転記防止（購入IDベース）
- 未転記データの削除
- iPhone Safari 最優先のUI設計

## ファイル構成

```
├── index.html          # メイン画面（ホーム + 購入追加）
├── css/styles.css      # スタイル
├── js/
│   ├── config.js       # マスターデータ・GAS URL設定
│   ├── storage.js      # localStorage操作
│   ├── api.js          # GAS連携
│   ├── app.js          # ホーム画面ロジック
│   └── add.js          # 購入入力フォーム
├── gas/Code.gs         # Google Apps Script
├── manifest.json       # PWA設定
└── icons/              # アプリアイコン
```

## ローカルでの動作確認

静的ファイルサーバーで起動してください。

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

ブラウザで `http://localhost:8080` を開きます。

## Googleスプレッドシート連携のセットアップ

### 1. スプレッドシート作成

Googleスプレッドシートを新規作成し、URLからスプレッドシートIDを控えます。

```
https://docs.google.com/spreadsheets/d/【ここがスプレッドシートID】/edit
```

### 2. Google Apps Script デプロイ

1. スプレッドシートで **拡張機能 > Apps Script** を開く
2. `gas/Code.gs` の内容を貼り付け
3. `SPREADSHEET_ID` を自分のスプレッドシートIDに変更
4. **デプロイ > 新しいデプロイ > ウェブアプリ**
   - 種類: ウェブアプリ
   - 実行ユーザー: 自分
   - アクセス: **全員**
5. デプロイURLをコピー

### 3. フロントエンド設定

`js/config.js` の `GAS_WEB_APP_URL` にデプロイURLを設定します。

```javascript
GAS_WEB_APP_URL: 'https://script.google.com/macros/s/xxxxx/exec',
```

### 4. ホスティング

以下のいずれかでWebアプリを公開します。

- **GitHub Pages** — リポジトリの Settings > Pages
- **Google Drive** — HTMLファイルを公開
- **Netlify / Vercel** — 静的サイトとしてデプロイ

## iPhoneでホーム画面に追加

1. SafariでWebアプリのURLを開く
2. 共有ボタン（□↑）をタップ
3. **ホーム画面に追加** を選択
4. 名前「iPhone購入管理」で追加

## マスターデータの変更

`js/config.js` を編集するだけで以下を更新できます。

- 使用ID / メールアドレス
- iPhone機種 / 単価
- 色
- クレジットカード

## スプレッドシートの列

| 列 | 内容 |
|---|---|
| A | 購入ID |
| B | 登録日時 |
| C | 使用ID |
| D | メールアドレス |
| E | 機種 |
| F | 色 |
| G | 個数 |
| H | 単価 |
| I | 合計金額 |
| J | 使用クレジットカード |
| K | 注文番号 |
| L | 転記日時 |

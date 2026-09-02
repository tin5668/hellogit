# iPhone購入管理

外出先でiPhone購入情報を素早く入力し、Googleスプレッドシート「りんご」の「2026年」タブへ転記するWebアプリ（MVP）です。

## 機能

- 購入情報の選択式入力（ID、番号、機種、色、個数、カード、注文番号）
- 定価・実質価格・合計金額の自動計算
- localStorage による一時保存（ブラウザを閉じてもデータ保持）
- 未転記件数・合計金額の表示
- Googleスプレッドシート「2026年」タブへの一括転記
- 二重転記防止（注文番号ベース）
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

```bash
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080` を開きます。

## Googleスプレッドシート連携のセットアップ

### 1. スプレッドシート

対象: [りんご](https://docs.google.com/spreadsheets/d/18av7_xrjaCsDpswipkJ20OP5lsMZJ6cOZytTCQPiCJ0/edit) > 「2026年」タブ

GASコード内の `SPREADSHEET_ID` はすでに設定済みです。

### 2. Google Apps Script デプロイ

1. スプレッドシートで **拡張機能 > Apps Script** を開く
2. `gas/Code.gs` の内容を貼り付け
3. **デプロイ > 新しいデプロイ > ウェブアプリ**
   - 種類: ウェブアプリ
   - 実行ユーザー: 自分
   - アクセス: **全員**
4. デプロイURLをコピー

### 3. フロントエンド設定

`js/config.js` の `GAS_WEB_APP_URL` にデプロイURLを設定します。

```javascript
GAS_WEB_APP_URL: 'https://script.google.com/macros/s/xxxxx/exec',
```

### 4. ホスティング

GitHub Pages / Netlify / Vercel 等で静的ファイルを公開します。

## iPhoneでホーム画面に追加

1. SafariでWebアプリのURLを開く
2. 共有ボタン（□↑）をタップ
3. **ホーム画面に追加** を選択

## マスターデータの変更

`js/config.js` を編集するだけで以下を更新できます。

| 設定 | 内容 |
|---|---|
| `phoneNumbers` | 番号の選択肢 |
| `models` | 機種名と定価 |
| `colors` | 色の選択肢 |
| `creditCards` | カード名と割引率 |
| `actualPrices` | 機種×割引率ごとの実質価格 |

## スプレッドシート列マッピング（2026年タブ）

| 列 | シート列名 | アプリのデータ |
|---|---|---|
| A | 領収書 | FALSE（固定） |
| B | 購入日 | 登録日時（M/D形式） |
| C | 購入場所 | apple（固定） |
| D | 名義 | ゲスト（固定） |
| E | 番号 | 番号（電話番号） |
| F | メアド | 使用ID（226等） |
| G | 注文番号 | 注文番号 |
| H | クレカ | クレジットカード |
| I | 割引率 | カードに紐づく割引率 |
| J | 購入品 | 機種 |
| K | 色 | 色 |
| L | 個数 | 個数 |
| M | 定価 | 定価 |
| N | 定価合計 | 定価×個数 |
| O | 実質価格 | 割引後単価 |
| P | 合計 | 定価合計 |
| Q〜Z | 到着・販売関連 | 空欄（フェーズ2以降） |

## 入力画面の流れ

1. **番号** — 選択式（7057671947 等）
2. **メアド** — 手入力（226 等の短縮コード）
3. **購入する機種** — 17Pro256GB / 17ProMAX 256GB
4. **色** — 銀 / 橙 / 青
5. **購入個数** — −/＋ボタンで調整
6. **クレジットカード** — カード選択（割引率付き）
7. **注文番号** — 手入力
8. **合計金額** — 自動計算

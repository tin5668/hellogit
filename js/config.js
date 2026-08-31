/**
 * マスターデータ設定
 * MVPではこのファイルを編集するだけで各種マスターを更新できます。
 * 将来的にはスプレッドシートのマスターシートから取得する方式に移行可能です。
 */

const CONFIG = {
  // Google Apps Script ウェブアプリのURL（デプロイ後に設定）
  GAS_WEB_APP_URL: '',

  // 使用IDとメールアドレスの紐づけ
  userIds: [
    {
      id: 'ID-01',
      emails: ['iphone01@example.com', 'sub01@example.com'],
    },
    {
      id: 'ID-02',
      emails: ['iphone02@example.com', 'sub02@example.com'],
    },
    {
      id: 'ID-03',
      emails: ['iphone03@example.com', 'sub03@example.com'],
    },
  ],

  // 機種と単価
  models: [
    { name: 'iPhone 18 Pro 256GB', price: 200000 },
    { name: 'iPhone 18 Pro 512GB', price: 220000 },
  ],

  // 色
  colors: ['ブラック', 'シルバー', 'ブルー'],

  // クレジットカード
  creditCards: ['カードA', 'カードB', 'カードC'],

  // localStorage キー
  STORAGE_KEY: 'iphone_purchase_data',
};

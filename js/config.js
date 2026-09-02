/**
 * マスターデータ設定
 * 実スプレッドシート「りんご」>「2026年」タブのデータに基づく
 * 変更時はこのファイルを編集するだけでOK
 */

const CONFIG = {
  // Google Apps Script ウェブアプリのURL（デプロイ後に設定）
  GAS_WEB_APP_URL: '',

  // 固定値（シート転記時に使用）
  defaults: {
    receipt: false,       // 領収書
    purchasePlace: 'apple', // 購入場所
    accountName: 'ゲスト',  // 名義
  },

  // 使用ID（メアド）と番号の紐づけ
  // id = メアド（シートの「メアド」列）, number = 番号（シートの「番号」列）
  userIds: [
    { id: '226', number: '7057671947' },
    { id: '227', number: '7096563485' },
    { id: '228', number: '7088737042' },
    { id: '229', number: '7068975991' },
    { id: '230', number: '7025864123' },
    { id: '231', number: '7088678160' },
    { id: '235', number: '7094965669' },
    { id: '236', number: '7057940897' },
    { id: '237', number: '7034685728' },
    { id: '238', number: '7057332402' },
    { id: '239', number: '7094410395' },
    { id: '240', number: '7067491878' },
    { id: '241', number: '7094851899' },
    { id: '242', number: '7034420619' },
    { id: '243', number: '7082893945' },
    { id: '244', number: '7096310888' },
    { id: '245', number: '7095735844' },
    { id: '246', number: '7060817613' },
    { id: '247', number: '7095041107' },
    { id: '248', number: '7060865745' },
    { id: '249', number: '7067364096' },
  ],

  // 機種と定価
  models: [
    { name: '17Pro256GB', price: 179800 },
    { name: '17ProMAX 256GB', price: 194800 },
  ],

  // 色
  colors: ['銀', '橙', '青'],

  // クレジットカード（割引率付き）
  creditCards: [
    { name: '2026.1①', discountRate: 3 },
    { name: '2026.1②', discountRate: 3 },
    { name: '2026.2①', discountRate: 3 },
    { name: '2026.2②', discountRate: 3 },
    { name: '2026.3①', discountRate: 3 },
    { name: '2026.4①', discountRate: 3 },
    { name: '2026.4②', discountRate: 3 },
    { name: '2026.5①', discountRate: 3 },
    { name: '2026.5②', discountRate: 3 },
    { name: '2026.5③', discountRate: 3 },
    { name: '2026.6①', discountRate: 3 },
    { name: 'AP\u3000paypayゴールド', discountRate: 2 },
    { name: 'paypayカード', discountRate: 2 },
    { name: 'マリオット', discountRate: 0 },
  ],

  // 実質価格ルックアップ（機種 + 割引率 → 実質価格）
  // シートの既存データから抽出した値
  actualPrices: {
    '17Pro256GB_0': 179800,
    '17Pro256GB_2': 176531,
    '17Pro256GB_3': 174896,
    '17ProMAX 256GB_0': 194800,
    '17ProMAX 256GB_2': 191258,
    '17ProMAX 256GB_3': 191258, // シートに3%データなし、2%と同率で暫定
  },

  // localStorage キー
  STORAGE_KEY: 'iphone_purchase_data',

  /**
   * 実質価格を取得
   */
  getActualPrice(model, discountRate) {
    const key = `${model}_${discountRate}`;
    if (this.actualPrices[key] !== undefined) {
      return this.actualPrices[key];
    }
    const m = this.models.find((x) => x.name === model);
    return m ? m.price : 0;
  },

  /**
   * カード名から割引率を取得
   */
  getDiscountRate(cardName) {
    const card = this.creditCards.find((c) => c.name === cardName);
    return card ? card.discountRate : 0;
  },
};

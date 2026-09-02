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

  // 番号（選択式）— シートの「番号」列。メアドは手入力
  phoneNumbers: [
    '7057671947',
    '7096563485',
    '7088737042',
    '7068975991',
    '7025864123',
    '7088678160',
    '7094965669',
    '7057940897',
    '7034685728',
    '7057332402',
    '7094410395',
    '7067491878',
    '7094851899',
    '7034420619',
    '7082893945',
    '7096310888',
    '7095735844',
    '7060817613',
    '7095041107',
    '7060865745',
    '7067364096',
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

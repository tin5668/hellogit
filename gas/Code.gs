/**
 * iPhone購入管理 - Google Apps Script
 *
 * 対象スプレッドシート: りんご
 * 対象シート: 2026年
 *
 * セットアップ手順:
 * 1. スプレッドシートで 拡張機能 > Apps Script を開く
 * 2. このコードを貼り付け
 * 3. デプロイ > 新しいデプロイ > ウェブアプリ
 *    - 実行ユーザー: 自分
 *    - アクセス: 全員
 * 4. デプロイURLを js/config.js の GAS_WEB_APP_URL に設定
 */

const SPREADSHEET_ID = '18av7_xrjaCsDpswipkJ20OP5lsMZJ6cOZytTCQPiCJ0';
const SHEET_NAME = '2026年';

// シート列定義（1始まり）
const COL = {
  RECEIPT: 1,        // 領収書
  PURCHASE_DATE: 2,  // 購入日
  PLACE: 3,          // 購入場所
  ACCOUNT: 4,        // 名義
  NUMBER: 5,         // 番号
  MAIL_CODE: 6,      // メアド
  ORDER_NUMBER: 7,   // 注文番号
  CARD: 8,           // クレカ
  DISCOUNT: 9,       // 割引率
  PRODUCT: 10,       // 購入品
  COLOR: 11,         // 色
  QUANTITY: 12,      // 個数
  UNIT_PRICE: 13,    // 定価
  LIST_TOTAL: 14,    // 定価合計
  ACTUAL_PRICE: 15,  // 実質価格
  TOTAL: 16,         // 合計
};

/**
 * GET リクエスト（動作確認用）
 */
function doGet(e) {
  return jsonResponse({ status: 'ok', message: 'iPhone購入管理 API', sheet: SHEET_NAME });
}

/**
 * POST リクエスト（購入データ転記）
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const purchases = data.purchases;

    if (!purchases || !Array.isArray(purchases) || purchases.length === 0) {
      return jsonResponse({ success: false, error: '転記データがありません' });
    }

    const sheet = getSheet_();
    const existingOrders = getExistingOrderNumbers_(sheet);
    const syncedIds = [];

    purchases.forEach(function (p) {
      // 二重転記防止: 注文番号が既に存在する場合はスキップ（転記済み扱い）
      if (existingOrders.has(String(p.orderNumber))) {
        syncedIds.push(p.purchaseId);
        return;
      }

      // アプリ側の購入IDでも二重チェック
      if (p.purchaseId && isPurchaseIdSynced_(sheet, p.purchaseId)) {
        syncedIds.push(p.purchaseId);
        return;
      }

      const row = buildRow_(p);
      sheet.appendRow(row);

      existingOrders.add(String(p.orderNumber));
      syncedIds.push(p.purchaseId);
    });

    return jsonResponse({ success: true, syncedIds: syncedIds });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * シートを取得
 */
function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('「' + SHEET_NAME + '」シートが見つかりません');
  }
  return sheet;
}

/**
 * 購入データからシート行を構築（26列）
 */
function buildRow_(p) {
  const row = new Array(26).fill('');

  row[COL.RECEIPT - 1] = false;
  row[COL.PURCHASE_DATE - 1] = formatPurchaseDate_(new Date(p.registeredAt));
  row[COL.PLACE - 1] = p.purchasePlace || 'apple';
  row[COL.ACCOUNT - 1] = p.accountName || 'ゲスト';
  row[COL.NUMBER - 1] = p.phoneNumber;
  row[COL.MAIL_CODE - 1] = p.mailCode;
  row[COL.ORDER_NUMBER - 1] = p.orderNumber;
  row[COL.CARD - 1] = p.creditCard;
  row[COL.DISCOUNT - 1] = p.discountRate || '';
  row[COL.PRODUCT - 1] = p.model;
  row[COL.COLOR - 1] = p.color;
  row[COL.QUANTITY - 1] = p.quantity;
  row[COL.UNIT_PRICE - 1] = p.unitPrice;
  row[COL.LIST_TOTAL - 1] = formatYen_(p.listTotal);
  row[COL.ACTUAL_PRICE - 1] = formatYen_(p.actualPrice);
  row[COL.TOTAL - 1] = formatYen_(p.totalAmount);

  // 列17〜26（到着・販売関連）は空欄のまま

  return row;
}

/**
 * 既存の注文番号を取得（二重転記防止用）
 */
function getExistingOrderNumbers_(sheet) {
  const orders = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 2) return orders;

  // ヘッダーは2行目、データは3行目から
  const values = sheet.getRange(3, COL.ORDER_NUMBER, lastRow - 2, 1).getValues();
  values.forEach(function (row) {
    if (row[0]) orders.add(String(row[0]));
  });

  return orders;
}

/**
 * 購入IDがメモ欄等に記録済みか（将来拡張用、現状は注文番号で判定）
 */
function isPurchaseIdSynced_(sheet, purchaseId) {
  return false;
}

/**
 * 購入日フォーマット（M/D）
 */
function formatPurchaseDate_(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'M/d');
}

/**
 * 金額フォーマット（¥123,456）
 */
function formatYen_(amount) {
  return '¥' + Number(amount).toLocaleString('ja-JP');
}

/**
 * JSON レスポンス生成
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

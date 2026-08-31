/**
 * iPhone購入管理 - Google Apps Script
 *
 * セットアップ手順:
 * 1. Googleスプレッドシートを新規作成
 * 2. 拡張機能 > Apps Script を開く
 * 3. このコードを貼り付け
 * 4. SPREADSHEET_ID を自分のスプレッドシートIDに変更
 * 5. デプロイ > 新しいデプロイ > ウェブアプリ
 *    - 実行ユーザー: 自分
 *    - アクセス: 全員
 * 6. デプロイURLを js/config.js の GAS_WEB_APP_URL に設定
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = '購入履歴';

/**
 * GET リクエスト（動作確認用）
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'iPhone購入管理 API' }))
    .setMimeType(ContentService.MimeType.JSON);
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

    const sheet = getOrCreateSheet_();
    const existingIds = getExistingPurchaseIds_(sheet);
    const syncedIds = [];
    const syncedAt = formatDateTime_(new Date());

    purchases.forEach(function (p) {
      // 二重転記防止: 購入IDが既に存在する場合はスキップ
      if (existingIds.has(p.purchaseId)) {
        syncedIds.push(p.purchaseId);
        return;
      }

      sheet.appendRow([
        p.purchaseId,
        formatDateTime_(new Date(p.registeredAt)),
        p.userId,
        p.email,
        p.model,
        p.color,
        p.quantity,
        p.unitPrice,
        p.totalAmount,
        p.creditCard,
        p.orderNumber,
        syncedAt,
      ]);

      existingIds.add(p.purchaseId);
      syncedIds.push(p.purchaseId);
    });

    return jsonResponse({ success: true, syncedIds: syncedIds });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * シートを取得または作成し、ヘッダー行を設定
 */
function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      '購入ID',
      '登録日時',
      '使用ID',
      'メールアドレス',
      '機種',
      '色',
      '個数',
      '単価',
      '合計金額',
      '使用クレジットカード',
      '注文番号',
      '転記日時',
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * 既存の購入IDを取得（二重転記防止用）
 */
function getExistingPurchaseIds_(sheet) {
  const ids = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return ids;

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  values.forEach(function (row) {
    if (row[0]) ids.add(String(row[0]));
  });

  return ids;
}

/**
 * 日時フォーマット
 */
function formatDateTime_(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
}

/**
 * JSON レスポンス生成
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

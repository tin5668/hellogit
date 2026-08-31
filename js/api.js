/**
 * Google Apps Script 連携 API
 */

const Api = {
  /**
   * 未転記データをスプレッドシートへ転記
   * @param {Array} purchases 未転記の購入データ配列
   * @returns {Promise<{ success: boolean, syncedIds?: string[], error?: string }>}
   */
  async syncToSpreadsheet(purchases) {
    if (!CONFIG.GAS_WEB_APP_URL) {
      return {
        success: false,
        error: 'GAS_WEB_APP_URL が設定されていません。js/config.js を確認してください。',
      };
    }

    if (purchases.length === 0) {
      return { success: false, error: '転記するデータがありません。' };
    }

    try {
      const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ purchases }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || '転記に失敗しました。',
        };
      }

      return {
        success: true,
        syncedIds: result.syncedIds || [],
      };
    } catch (err) {
      return {
        success: false,
        error: `通信エラー: ${err.message}`,
      };
    }
  },
};

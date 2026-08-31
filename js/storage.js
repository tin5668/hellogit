/**
 * localStorage による購入データの一時保存
 */

const Storage = {
  /**
   * 全購入データを取得
   * @returns {Array}
   */
  getAll() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * 全購入データを保存
   * @param {Array} purchases
   */
  saveAll(purchases) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(purchases));
  },

  /**
   * 購入データを追加
   * @param {Object} purchase
   */
  add(purchase) {
    const purchases = this.getAll();
    purchases.unshift(purchase);
    this.saveAll(purchases);
  },

  /**
   * 購入データを更新
   * @param {string} purchaseId
   * @param {Object} updates
   */
  update(purchaseId, updates) {
    const purchases = this.getAll();
    const index = purchases.findIndex((p) => p.purchaseId === purchaseId);
    if (index !== -1) {
      purchases[index] = { ...purchases[index], ...updates };
      this.saveAll(purchases);
    }
  },

  /**
   * 未転記データを取得
   * @returns {Array}
   */
  getUnsynced() {
    return this.getAll().filter((p) => !p.synced);
  },

  /**
   * 未転記件数と合計金額
   * @returns {{ count: number, total: number }}
   */
  getUnsyncedSummary() {
    const unsynced = this.getUnsynced();
    return {
      count: unsynced.length,
      total: unsynced.reduce((sum, p) => sum + p.totalAmount, 0),
    };
  },

  /**
   * 購入IDを生成
   * 形式: PUR-YYYYMMDD-0001
   * @returns {string}
   */
  generatePurchaseId() {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    const purchases = this.getAll();
    const todayPrefix = `PUR-${dateStr}-`;
    const todayCount = purchases.filter((p) =>
      p.purchaseId.startsWith(todayPrefix)
    ).length;

    const seq = String(todayCount + 1).padStart(4, '0');
    return `${todayPrefix}${seq}`;
  },

  /**
   * 注文番号の重複チェック
   * @param {string} orderNumber
   * @returns {boolean}
   */
  isDuplicateOrderNumber(orderNumber) {
    return this.getAll().some((p) => p.orderNumber === orderNumber);
  },

  /**
   * 未転記データを削除
   * @param {string} purchaseId
   * @returns {boolean}
   */
  deleteUnsynced(purchaseId) {
    const purchases = this.getAll();
    const target = purchases.find((p) => p.purchaseId === purchaseId);
    if (!target || target.synced) return false;

    const filtered = purchases.filter((p) => p.purchaseId !== purchaseId);
    this.saveAll(filtered);
    return true;
  },
};

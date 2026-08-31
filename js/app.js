/**
 * ホーム画面ロジック
 */

const App = {
  init() {
    this.bindEvents();
    this.renderHome();
  },

  bindEvents() {
    document.getElementById('btn-add').addEventListener('click', () => {
      AddForm.reset();
      this.showView('add');
    });

    document.getElementById('btn-back').addEventListener('click', () => {
      this.showView('home');
    });

    document.getElementById('btn-sync').addEventListener('click', () => {
      this.syncToSpreadsheet();
    });

    // 購入追加完了イベント
    document.addEventListener('purchase-added', () => {
      this.showView('home');
      this.renderHome();
      this.showToast('購入情報を追加しました', 'success');
    });
  },

  showView(name) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.getElementById(`view-${name}`).classList.add('active');
    window.scrollTo(0, 0);
  },

  formatCurrency(amount) {
    return amount.toLocaleString('ja-JP') + '円';
  },

  renderHome() {
    const summary = Storage.getUnsyncedSummary();
    const purchases = Storage.getAll();

    document.getElementById('unsynced-count').textContent = `${summary.count}件`;
    document.getElementById('unsynced-total').textContent = this.formatCurrency(summary.total);

    const syncBtn = document.getElementById('btn-sync');
    syncBtn.disabled = summary.count === 0;

    const listEl = document.getElementById('purchase-list');
    const emptyEl = document.getElementById('empty-state');

    if (purchases.length === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';
    listEl.innerHTML = purchases
      .map((p) => this.renderPurchaseItem(p))
      .join('');

    // 削除ボタンイベント
    listEl.querySelectorAll('.purchase-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.confirmDelete(id);
      });
    });
  },

  renderPurchaseItem(p) {
    const statusClass = p.synced ? 'synced' : 'unposted';
    const statusText = p.synced ? '転記済み' : '未転記';
    const deleteBtn = p.synced
      ? ''
      : `<button class="purchase-delete" data-id="${p.purchaseId}">削除</button>`;

    return `
      <li class="purchase-item">
        <div class="purchase-item-header">
          <span class="purchase-model">${this.escapeHtml(p.model)}</span>
          <span class="purchase-status ${statusClass}">${statusText}</span>
        </div>
        <div class="purchase-detail">
          ${this.escapeHtml(p.color)}<br>
          ${p.quantity}台<br>
          <span class="amount-line">${this.formatCurrency(p.totalAmount)}</span>
          ID：${this.escapeHtml(p.userId)}<br>
          カード：${this.escapeHtml(p.creditCard)}<br>
          注文番号：${this.escapeHtml(p.orderNumber)}
        </div>
        ${deleteBtn}
      </li>
    `;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  confirmDelete(purchaseId) {
    const overlay = document.getElementById('dialog-overlay');
    const title = document.getElementById('dialog-title');
    const message = document.getElementById('dialog-message');
    const confirmBtn = document.getElementById('dialog-confirm');
    const cancelBtn = document.getElementById('dialog-cancel');

    title.textContent = '削除確認';
    message.textContent = 'この購入情報を削除しますか？';
    confirmBtn.textContent = '削除';
    overlay.classList.add('visible');

    const cleanup = () => {
      overlay.classList.remove('visible');
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
    };

    const onConfirm = () => {
      cleanup();
      if (Storage.deleteUnsynced(purchaseId)) {
        this.renderHome();
        this.showToast('削除しました', 'info');
      }
    };

    const onCancel = () => cleanup();

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
  },

  async syncToSpreadsheet() {
    const unsynced = Storage.getUnsynced();
    if (unsynced.length === 0) return;

    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('visible');

    const result = await Api.syncToSpreadsheet(unsynced);

    overlay.classList.remove('visible');

    if (result.success) {
      const syncedAt = new Date().toISOString();
      (result.syncedIds || unsynced.map((p) => p.purchaseId)).forEach((id) => {
        Storage.update(id, { synced: true, syncedAt });
      });
      this.renderHome();
      this.showToast(`${result.syncedIds?.length || unsynced.length}件を転記しました`, 'success');
    } else {
      this.showToast(result.error, 'error');
    }
  },

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

/**
 * 購入情報入力フォーム
 */

const AddForm = {
  state: {
    userId: null,
    email: null,
    model: null,
    unitPrice: 0,
    color: null,
    quantity: 1,
    creditCard: null,
    orderNumber: '',
  },

  init() {
    this.renderUserIds();
    this.renderModels();
    this.renderColors();
    this.renderCards();
    this.bindEvents();
    this.updateTotal();
    this.validate();
  },

  reset() {
    this.state = {
      userId: null,
      email: null,
      model: null,
      unitPrice: 0,
      color: null,
      quantity: 1,
      creditCard: null,
      orderNumber: '',
    };

    document.getElementById('qty-input').value = '1';
    document.getElementById('order-number').value = '';
    document.getElementById('duplicate-warning').classList.remove('visible');

    // 選択状態をリセット
    document.querySelectorAll('.choice-btn.selected').forEach((btn) => {
      btn.classList.remove('selected');
    });

    this.renderEmails();
    this.updateTotal();
    this.validate();
  },

  bindEvents() {
    // 個数操作
    document.getElementById('qty-minus').addEventListener('click', () => {
      if (this.state.quantity > 1) {
        this.state.quantity--;
        document.getElementById('qty-input').value = this.state.quantity;
        this.updateTotal();
      }
    });

    document.getElementById('qty-plus').addEventListener('click', () => {
      this.state.quantity++;
      document.getElementById('qty-input').value = this.state.quantity;
      this.updateTotal();
    });

    document.getElementById('qty-input').addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      this.state.quantity = isNaN(val) || val < 1 ? 1 : val;
      e.target.value = this.state.quantity;
      this.updateTotal();
      this.validate();
    });

    // 注文番号
    document.getElementById('order-number').addEventListener('input', (e) => {
      this.state.orderNumber = e.target.value.trim();
      const warning = document.getElementById('duplicate-warning');
      if (this.state.orderNumber && Storage.isDuplicateOrderNumber(this.state.orderNumber)) {
        warning.classList.add('visible');
      } else {
        warning.classList.remove('visible');
      }
      this.validate();
    });

    // 登録ボタン
    document.getElementById('btn-submit').addEventListener('click', () => {
      this.submit();
    });
  },

  renderUserIds() {
    const container = document.getElementById('choices-user-id');
    container.innerHTML = CONFIG.userIds
      .map(
        (u) =>
          `<button type="button" class="choice-btn" data-value="${u.id}">${u.id}</button>`
      )
      .join('');

    container.querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.userId = btn.dataset.value;
        this.state.email = null;
        this.renderEmails();
        this.validate();
      });
    });
  },

  renderEmails() {
    const container = document.getElementById('choices-email');
    if (!this.state.userId) {
      container.innerHTML = '<p style="color:#86868b;font-size:0.875rem;">先にIDを選択してください</p>';
      return;
    }

    const user = CONFIG.userIds.find((u) => u.id === this.state.userId);
    container.innerHTML = user.emails
      .map(
        (email) =>
          `<button type="button" class="choice-btn" data-value="${email}">${email}</button>`
      )
      .join('');

    container.querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.email = btn.dataset.value;
        this.validate();
      });
    });
  },

  renderModels() {
    const container = document.getElementById('choices-model');
    container.innerHTML = CONFIG.models
      .map(
        (m) =>
          `<button type="button" class="choice-btn" data-value="${m.name}" data-price="${m.price}">${m.name}<br><small style="color:#86868b;">${m.price.toLocaleString('ja-JP')}円</small></button>`
      )
      .join('');

    container.querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.model = btn.dataset.value;
        this.state.unitPrice = parseInt(btn.dataset.price, 10);
        this.updateTotal();
        this.validate();
      });
    });
  },

  renderColors() {
    const container = document.getElementById('choices-color');
    container.innerHTML = CONFIG.colors
      .map(
        (c) =>
          `<button type="button" class="choice-btn" data-value="${c}">${c}</button>`
      )
      .join('');

    container.querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.color = btn.dataset.value;
        this.validate();
      });
    });
  },

  renderCards() {
    const container = document.getElementById('choices-card');
    container.innerHTML = CONFIG.creditCards
      .map(
        (c) =>
          `<button type="button" class="choice-btn" data-value="${c}">${c}</button>`
      )
      .join('');

    container.querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.creditCard = btn.dataset.value;
        this.validate();
      });
    });
  },

  updateTotal() {
    const breakdown = document.getElementById('total-breakdown');
    const amount = document.getElementById('total-amount');

    if (!this.state.model) {
      breakdown.textContent = '機種を選択してください';
      amount.textContent = '—';
      return;
    }

    const total = this.state.unitPrice * this.state.quantity;
    breakdown.textContent = `単価：${this.state.unitPrice.toLocaleString('ja-JP')}円 × ${this.state.quantity}台`;
    amount.textContent = total.toLocaleString('ja-JP') + '円';
  },

  validate() {
    const isValid =
      this.state.userId &&
      this.state.email &&
      this.state.model &&
      this.state.color &&
      this.state.quantity >= 1 &&
      this.state.creditCard &&
      this.state.orderNumber.length > 0;

    document.getElementById('btn-submit').disabled = !isValid;
  },

  submit() {
    if (!this.state.userId || !this.state.email || !this.state.model ||
        !this.state.color || !this.state.creditCard || !this.state.orderNumber) {
      return;
    }

    const purchase = {
      purchaseId: Storage.generatePurchaseId(),
      registeredAt: new Date().toISOString(),
      userId: this.state.userId,
      email: this.state.email,
      model: this.state.model,
      color: this.state.color,
      quantity: this.state.quantity,
      unitPrice: this.state.unitPrice,
      totalAmount: this.state.unitPrice * this.state.quantity,
      creditCard: this.state.creditCard,
      orderNumber: this.state.orderNumber,
      synced: false,
      syncedAt: null,
    };

    Storage.add(purchase);
    document.dispatchEvent(new CustomEvent('purchase-added'));
  },
};

document.addEventListener('DOMContentLoaded', () => AddForm.init());

/**
 * 購入情報入力フォーム
 */

const AddForm = {
  state: {
    phoneNumber: null,  // 番号
    mailCode: '',       // メアド（手入力）
    model: null,
    unitPrice: 0,
    actualPrice: 0,
    discountRate: 0,
    color: null,
    quantity: 1,
    creditCard: null,
    orderNumber: '',
  },

  init() {
    this.renderPhoneNumbers();
    this.renderModels();
    this.renderColors();
    this.renderCards();
    this.bindEvents();
    this.updateTotal();
    this.validate();
  },

  reset() {
    this.state = {
      phoneNumber: null,
      mailCode: '',
      model: null,
      unitPrice: 0,
      actualPrice: 0,
      discountRate: 0,
      color: null,
      quantity: 1,
      creditCard: null,
      orderNumber: '',
    };

    document.getElementById('qty-input').value = '1';
    document.getElementById('mail-code').value = '';
    document.getElementById('order-number').value = '';
    document.getElementById('duplicate-warning').classList.remove('visible');

    document.querySelectorAll('.choice-btn.selected').forEach((btn) => {
      btn.classList.remove('selected');
    });

    this.updateTotal();
    this.validate();
  },

  bindEvents() {
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

    document.getElementById('mail-code').addEventListener('input', (e) => {
      this.state.mailCode = e.target.value.trim();
      this.validate();
    });

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

    document.getElementById('btn-submit').addEventListener('click', () => {
      this.submit();
    });
  },

  renderPhoneNumbers() {
    const container = document.getElementById('choices-phone');
    container.innerHTML = CONFIG.phoneNumbers
      .map(
        (num) =>
          `<button type="button" class="choice-btn" data-value="${num}">${num}</button>`
      )
      .join('');

    container.querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.phoneNumber = btn.dataset.value;
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
        this.recalcActualPrice();
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
        (c) => {
          const rateLabel = c.discountRate > 0 ? ` (${c.discountRate}%)` : '';
          return `<button type="button" class="choice-btn" data-value="${c.name}" data-rate="${c.discountRate}">${c.name}${rateLabel}</button>`;
        }
      )
      .join('');

    container.querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.creditCard = btn.dataset.value;
        this.state.discountRate = parseInt(btn.dataset.rate, 10);
        this.recalcActualPrice();
        this.updateTotal();
        this.validate();
      });
    });
  },

  recalcActualPrice() {
    if (!this.state.model) return;
    this.state.actualPrice = CONFIG.getActualPrice(this.state.model, this.state.discountRate);
  },

  updateTotal() {
    const breakdown = document.getElementById('total-breakdown');
    const amount = document.getElementById('total-amount');

    if (!this.state.model) {
      breakdown.textContent = '機種を選択してください';
      amount.textContent = '—';
      return;
    }

    const listTotal = this.state.unitPrice * this.state.quantity;
    breakdown.textContent = `定価：${this.state.unitPrice.toLocaleString('ja-JP')}円 × ${this.state.quantity}台`;
    if (this.state.actualPrice && this.state.actualPrice !== this.state.unitPrice) {
      breakdown.textContent += `（実質：${this.state.actualPrice.toLocaleString('ja-JP')}円/台）`;
    }
    amount.textContent = listTotal.toLocaleString('ja-JP') + '円';
  },

  validate() {
    const isValid =
      this.state.phoneNumber &&
      this.state.mailCode.length > 0 &&
      this.state.model &&
      this.state.color &&
      this.state.quantity >= 1 &&
      this.state.creditCard &&
      this.state.orderNumber.length > 0;

    document.getElementById('btn-submit').disabled = !isValid;
  },

  submit() {
    if (!this.state.phoneNumber || !this.state.mailCode || !this.state.model ||
        !this.state.color || !this.state.creditCard || !this.state.orderNumber) {
      return;
    }

    const listTotal = this.state.unitPrice * this.state.quantity;

    const purchase = {
      purchaseId: Storage.generatePurchaseId(),
      registeredAt: new Date().toISOString(),
      mailCode: this.state.mailCode,
      phoneNumber: this.state.phoneNumber,
      accountName: CONFIG.defaults.accountName,
      purchasePlace: CONFIG.defaults.purchasePlace,
      model: this.state.model,
      color: this.state.color,
      quantity: this.state.quantity,
      unitPrice: this.state.unitPrice,
      actualPrice: this.state.actualPrice,
      listTotal: listTotal,
      totalAmount: listTotal,
      discountRate: this.state.discountRate || '',
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

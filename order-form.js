/**
 * Create / Edit Order Module
 * Implements PRD Requirements C-1, C-2, C-3, C-4, C-5, C-6.
 */

import { store } from '../store.js';
import { router } from '../router.js';
import { formatCurrency, escapeHtml } from '../utils/formatters.js';
import { toast } from '../utils/toast.js';
import { modal } from '../utils/modal.js';

export function renderOrderForm(container, params = {}) {
  const isEdit = Boolean(params.id);
  const existingOrder = isEdit ? store.getOrderById(params.id) : null;

  if (isEdit && !existingOrder) {
    toast.error("Order not found.", "Error");
    router.navigate("orders");
    return;
  }

  const settings = store.getSettings();
  const customers = store.getCustomers();
  const products = store.getProducts();

  // Initial line items
  let items = existingOrder
    ? existingOrder.items.map(i => ({ ...i }))
    : [
        {
          productId: products[0] ? products[0].id : "",
          name: products[0] ? products[0].name : "",
          qty: 1,
          unitPrice: products[0] ? products[0].price : 0,
          lineTotal: products[0] ? products[0].price : 0
        }
      ];

  let orderData = {
    customerId: existingOrder ? existingOrder.customerId : (customers[0] ? customers[0].id : ""),
    date: existingOrder ? existingOrder.date : new Date().toISOString().split('T')[0],
    shippingAddress: existingOrder ? existingOrder.shippingAddress : (customers[0] ? customers[0].address : ""),
    paymentMethod: existingOrder ? existingOrder.paymentMethod : "Credit Card",
    notes: existingOrder ? existingOrder.notes : "",
    taxRate: existingOrder ? existingOrder.taxRate : settings.defaultTaxRate,
    discount: existingOrder ? existingOrder.discount : 0,
    discountType: existingOrder ? existingOrder.discountType : "flat",
    amountPaid: existingOrder ? existingOrder.amountPaid : 0
  };

  function calculateTotals() {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unitPrice)), 0);
    const discInput = Number(orderData.discount) || 0;
    const discountVal = orderData.discountType === 'percent'
      ? (subtotal * discInput / 100)
      : discInput;
    const taxable = Math.max(0, subtotal - discountVal);
    const taxVal = taxable * (Number(orderData.taxRate) || 0) / 100;
    const grandTotal = Math.max(0, taxable + taxVal);
    const balanceDue = Math.max(0, grandTotal - (Number(orderData.amountPaid) || 0));

    return {
      subtotal,
      discountVal,
      taxVal,
      grandTotal,
      balanceDue
    };
  }

  function renderView() {
    const totals = calculateTotals();
    const nextOrderNo = isEdit ? existingOrder.orderNo : store.generateOrderNumber();

    container.innerHTML = `
      <div class="page-container" style="max-width: 1080px;">
        <div class="page-header">
          <div class="page-title-group">
            <h1>${isEdit ? `Edit Order ${existingOrder.orderNo}` : "Create Sales Order"}</h1>
            <p class="page-description">${isEdit ? "Update order details, line items or shipping details" : "Create a new sales order with line items and automatic inventory stock deduction"}</p>
          </div>
          <div class="page-actions">
            <a href="${isEdit ? `#orders/${existingOrder.id}` : '#orders'}" class="btn btn-secondary">
              Cancel
            </a>
            <button type="button" class="btn btn-primary" id="btn-save-order">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              ${isEdit ? "Save Changes" : "Create Order"}
            </button>
          </div>
        </div>

        <form id="order-form">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;" class="form-grid-layout">
            <!-- Left Column: Customer, Items, Shipping -->
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              
              <!-- Customer & Details Card (C-1, C-5, C-6) -->
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Order Information</h3>
                  <span class="badge badge-processing" style="font-family: var(--font-mono); font-size: 0.8125rem;">
                    ${escapeHtml(nextOrderNo)}
                  </span>
                </div>
                <div class="card-body">
                  <div class="form-row">
                    <!-- Customer Select (C-1) -->
                    <div class="form-group">
                      <div class="flex justify-between items-center" style="margin-bottom: 0.35rem;">
                        <label class="form-label required" for="order-customer" style="margin-bottom: 0;">Customer</label>
                        <button type="button" class="text-xs font-semibold" id="btn-add-customer-inline" style="color: var(--primary);">
                          + Add New Customer
                        </button>
                      </div>
                      <select id="order-customer" class="form-control" required>
                        ${customers.map(c => `
                          <option value="${c.id}" ${c.id === orderData.customerId ? 'selected' : ''}>
                            ${escapeHtml(c.name)} (${escapeHtml(c.company || c.region)})
                          </option>
                        `).join('')}
                      </select>
                    </div>

                    <!-- Order Date -->
                    <div class="form-group">
                      <label class="form-label required" for="order-date">Order Date</label>
                      <input type="date" id="order-date" class="form-control" required value="${orderData.date}">
                    </div>
                  </div>

                  <div class="form-row">
                    <!-- Payment Method -->
                    <div class="form-group">
                      <label class="form-label required" for="order-payment-method">Payment Method</label>
                      <select id="order-payment-method" class="form-control" required>
                        <option value="Credit Card" ${orderData.paymentMethod === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                        <option value="Bank Transfer" ${orderData.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer (ACH/Wire)</option>
                        <option value="Purchase Order" ${orderData.paymentMethod === 'Purchase Order' ? 'selected' : ''}>Purchase Order (Net 30)</option>
                        <option value="PayPal" ${orderData.paymentMethod === 'PayPal' ? 'selected' : ''}>PayPal</option>
                        <option value="Cash / Check" ${orderData.paymentMethod === 'Cash / Check' ? 'selected' : ''}>Cash / Check</option>
                      </select>
                    </div>

                    <!-- Shipping Address -->
                    <div class="form-group">
                      <label class="form-label required" for="order-shipping-address">Shipping Address</label>
                      <input type="text" id="order-shipping-address" class="form-control" placeholder="Full delivery address" required value="${escapeHtml(orderData.shippingAddress)}">
                    </div>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" for="order-notes">Order Notes / Instructions</label>
                    <textarea id="order-notes" class="form-control" rows="2" placeholder="Delivery instructions, customer PO reference, internal notes...">${escapeHtml(orderData.notes)}</textarea>
                  </div>
                </div>
              </div>

              <!-- Line Items Card (C-2, C-3) -->
              <div class="card">
                <div class="card-header">
                  <div>
                    <h3 class="card-title">Order Line Items</h3>
                    <p class="card-subtitle">Select products and quantities. Stock is validated in real time.</p>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-add-item">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Product Item
                  </button>
                </div>
                <div class="card-body" style="padding: 0;">
                  <div class="table-container" style="border: none;">
                    <table class="data-table" id="items-table">
                      <thead>
                        <tr>
                          <th style="min-width: 220px;">Product</th>
                          <th style="width: 110px;" class="text-right">Price</th>
                          <th style="width: 100px;">Quantity</th>
                          <th style="width: 120px;" class="text-right">Total</th>
                          <th style="width: 50px;"></th>
                        </tr>
                      </thead>
                      <tbody id="items-tbody">
                        ${items.map((item, index) => {
                          const currentProd = products.find(p => p.id === item.productId);
                          const availableStock = currentProd ? currentProd.stock : 0;
                          return `
                            <tr data-index="${index}">
                              <td>
                                <select class="form-control item-product-select" data-index="${index}">
                                  ${products.map(p => `
                                    <option value="${p.id}" ${p.id === item.productId ? 'selected' : ''}>
                                      ${escapeHtml(p.name)} (${p.stock} in stock - $${p.price.toFixed(2)})
                                    </option>
                                  `).join('')}
                                </select>
                                <div class="text-xs text-muted" style="margin-top: 4px;">
                                  Available in stock: <strong>${availableStock}</strong>
                                </div>
                              </td>
                              <td class="text-right">
                                <div class="num font-semibold" style="padding-top: 6px;">
                                  ${formatCurrency(item.unitPrice, settings.currency)}
                                </div>
                              </td>
                              <td>
                                <input type="number" min="1" max="${availableStock + (isEdit ? item.qty : 0)}" class="form-control item-qty-input text-center" data-index="${index}" value="${item.qty}">
                              </td>
                              <td class="text-right">
                                <div class="num font-semibold" style="padding-top: 6px;">
                                  ${formatCurrency(item.lineTotal, settings.currency)}
                                </div>
                              </td>
                              <td class="text-center">
                                ${items.length > 1 ? `
                                  <button type="button" class="icon-btn btn-remove-item" data-index="${index}" title="Remove item" style="color: var(--status-cancelled);">
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  </button>
                                ` : ''}
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column: Live Pricing & Summary (C-4) -->
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div class="card" style="position: sticky; top: calc(var(--topbar-height) + 1rem);">
                <div class="card-header">
                  <h3 class="card-title">Order Summary</h3>
                </div>
                <div class="card-body">
                  <!-- Subtotal -->
                  <div class="flex justify-between items-center" style="margin-bottom: 0.75rem;">
                    <span class="text-muted">Subtotal:</span>
                    <span class="num font-semibold" id="sum-subtotal">${formatCurrency(totals.subtotal, settings.currency)}</span>
                  </div>

                  <!-- Discount (Percent or Flat) -->
                  <div class="form-group" style="margin-bottom: 0.75rem;">
                    <label class="form-label" style="font-size: 0.75rem;">Discount</label>
                    <div class="flex gap-2">
                      <input type="number" min="0" step="any" id="order-discount" class="form-control" style="flex: 2;" value="${orderData.discount}">
                      <select id="order-discount-type" class="form-control" style="flex: 1.5;">
                        <option value="flat" ${orderData.discountType === 'flat' ? 'selected' : ''}>$ Flat</option>
                        <option value="percent" ${orderData.discountType === 'percent' ? 'selected' : ''}>% Percent</option>
                      </select>
                    </div>
                  </div>

                  <!-- Tax Rate -->
                  <div class="form-group" style="margin-bottom: 0.75rem;">
                    <label class="form-label" style="font-size: 0.75rem;">Tax Rate (%)</label>
                    <div class="input-group">
                      <input type="number" min="0" step="0.1" id="order-tax-rate" class="form-control" value="${orderData.taxRate}">
                      <span class="input-group-text">%</span>
                    </div>
                  </div>

                  <div class="flex justify-between items-center text-sm" style="margin-bottom: 0.5rem;">
                    <span class="text-muted">Calculated Tax:</span>
                    <span class="num" id="sum-tax">${formatCurrency(totals.taxVal, settings.currency)}</span>
                  </div>

                  <div style="border-top: 1px dashed var(--border-strong); margin: 1rem 0; padding-top: 1rem;">
                    <div class="flex justify-between items-center">
                      <span style="font-size: 1.1rem; font-weight: 700;">Grand Total:</span>
                      <span class="num font-bold" id="sum-grand-total" style="font-size: 1.25rem; color: var(--primary);">
                        ${formatCurrency(totals.grandTotal, settings.currency)}
                      </span>
                    </div>
                  </div>

                  <!-- Initial Deposit / Payment -->
                  <div class="form-group" style="margin-top: 1rem; margin-bottom: 0.75rem;">
                    <label class="form-label" style="font-size: 0.75rem;">Initial Payment Received</label>
                    <div class="input-group">
                      <span class="input-group-text">${settings.currency}</span>
                      <input type="number" min="0" step="any" id="order-amount-paid" class="form-control" value="${orderData.amountPaid}">
                    </div>
                  </div>

                  <div class="flex justify-between items-center text-sm">
                    <span class="text-muted">Balance Due:</span>
                    <span class="num font-semibold" id="sum-balance-due" style="color: ${totals.balanceDue > 0 ? 'var(--status-cancelled)' : 'var(--status-delivered)'};">
                      ${formatCurrency(totals.balanceDue, settings.currency)}
                    </span>
                  </div>

                  <div style="margin-top: 1.5rem;">
                    <button type="button" class="btn btn-primary w-full" id="btn-save-order-bottom">
                      ${isEdit ? "Update Order" : "Submit & Generate Order"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    `;

    bindFormEvents();
  }

  function updateItem(index, newProps) {
    items[index] = { ...items[index], ...newProps };
    items[index].lineTotal = items[index].qty * items[index].unitPrice;
    renderView();
  }

  function bindFormEvents() {
    // Customer change -> update shipping address
    const custSelect = container.querySelector("#order-customer");
    if (custSelect) {
      custSelect.addEventListener("change", (e) => {
        orderData.customerId = e.target.value;
        const cust = store.getCustomerById(e.target.value);
        if (cust && cust.address) {
          orderData.shippingAddress = cust.address;
          const addrInput = container.querySelector("#order-shipping-address");
          if (addrInput) addrInput.value = cust.address;
        }
      });
    }

    // Inline Add Customer (C-1)
    const addCustBtn = container.querySelector("#btn-add-customer-inline");
    if (addCustBtn) {
      addCustBtn.addEventListener("click", () => {
        modal.open({
          title: "Add New Customer",
          content: `
            <form id="inline-customer-form">
              <div class="form-group">
                <label class="form-label required">Customer / Contact Name</label>
                <input type="text" id="incust-name" class="form-control" required placeholder="e.g. Wayne Enterprises">
              </div>
              <div class="form-group">
                <label class="form-label required">Email</label>
                <input type="email" id="incust-email" class="form-control" required placeholder="contact@wayne.com">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input type="text" id="incust-phone" class="form-control" placeholder="+1 (555) 000-0000">
                </div>
                <div class="form-group">
                  <label class="form-label">Region</label>
                  <select id="incust-region" class="form-control">
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="Latin America">Latin America</option>
                    <option value="Middle East">Middle East</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" id="incust-company" class="form-control" placeholder="Company Legal Name">
              </div>
              <div class="form-group">
                <label class="form-label">Delivery Address</label>
                <input type="text" id="incust-address" class="form-control" placeholder="Street, City, State, ZIP">
              </div>
            </form>
          `,
          footerHtml: `
            <button class="btn btn-secondary" id="incust-cancel">Cancel</button>
            <button class="btn btn-primary" id="incust-save">Save & Select</button>
          `,
          size: "md",
          onOpen: (modalEl) => {
            modalEl.querySelector("#incust-cancel").onclick = () => modal.close();
            modalEl.querySelector("#incust-save").onclick = () => {
              const name = modalEl.querySelector("#incust-name").value.trim();
              const email = modalEl.querySelector("#incust-email").value.trim();
              if (!name || !email) {
                toast.error("Please provide both customer name and email.", "Missing Info");
                return;
              }
              const newCust = store.addCustomer({
                name,
                email,
                phone: modalEl.querySelector("#incust-phone").value,
                region: modalEl.querySelector("#incust-region").value,
                company: modalEl.querySelector("#incust-company").value,
                address: modalEl.querySelector("#incust-address").value
              });
              modal.close();
              toast.success(`Customer "${newCust.name}" added successfully.`);
              orderData.customerId = newCust.id;
              orderData.shippingAddress = newCust.address || orderData.shippingAddress;
              renderView();
            };
          }
        });
      });
    }

    // Add item button
    const addItemBtn = container.querySelector("#btn-add-item");
    if (addItemBtn) {
      addItemBtn.addEventListener("click", () => {
        const firstProd = products[0];
        items.push({
          productId: firstProd ? firstProd.id : "",
          name: firstProd ? firstProd.name : "",
          qty: 1,
          unitPrice: firstProd ? firstProd.price : 0,
          lineTotal: firstProd ? firstProd.price : 0
        });
        renderView();
      });
    }

    // Product select change
    container.querySelectorAll(".item-product-select").forEach(select => {
      select.addEventListener("change", (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        const prod = products.find(p => p.id === e.target.value);
        if (prod) {
          updateItem(index, {
            productId: prod.id,
            name: prod.name,
            unitPrice: prod.price
          });
        }
      });
    });

    // Quantity change
    container.querySelectorAll(".item-qty-input").forEach(input => {
      input.addEventListener("input", (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1) {
          updateItem(index, { qty: val });
        }
      });
    });

    // Remove item
    container.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        if (items.length > 1) {
          items.splice(index, 1);
          renderView();
        }
      });
    });

    // Live calculation listeners for inputs
    const discInput = container.querySelector("#order-discount");
    if (discInput) {
      discInput.addEventListener("input", (e) => {
        orderData.discount = Number(e.target.value) || 0;
        refreshCalculatedTotals();
      });
    }

    const discTypeSelect = container.querySelector("#order-discount-type");
    if (discTypeSelect) {
      discTypeSelect.addEventListener("change", (e) => {
        orderData.discountType = e.target.value;
        refreshCalculatedTotals();
      });
    }

    const taxInput = container.querySelector("#order-tax-rate");
    if (taxInput) {
      taxInput.addEventListener("input", (e) => {
        orderData.taxRate = Number(e.target.value) || 0;
        refreshCalculatedTotals();
      });
    }

    const paidInput = container.querySelector("#order-amount-paid");
    if (paidInput) {
      paidInput.addEventListener("input", (e) => {
        orderData.amountPaid = Number(e.target.value) || 0;
        refreshCalculatedTotals();
      });
    }

    // Form submission handlers
    const saveOrder = () => {
      // Collect values
      orderData.date = container.querySelector("#order-date").value;
      orderData.shippingAddress = container.querySelector("#order-shipping-address").value.trim();
      orderData.paymentMethod = container.querySelector("#order-payment-method").value;
      orderData.notes = container.querySelector("#order-notes").value.trim();

      if (!orderData.customerId) {
        toast.error("Please select a customer for this order.", "Validation Error");
        return;
      }
      if (!orderData.shippingAddress) {
        toast.error("Please enter a shipping address.", "Validation Error");
        return;
      }
      if (!items || items.length === 0) {
        toast.error("Please include at least one product line item.", "Validation Error");
        return;
      }

      // Validate quantities & positive integers (C-3)
      for (const item of items) {
        if (!item.qty || item.qty <= 0 || !Number.isInteger(Number(item.qty))) {
          toast.error(`Quantity for "${item.name}" must be a positive whole number.`, "Invalid Quantity");
          return;
        }
      }

      try {
        if (isEdit) {
          store.updateOrder(existingOrder.id, {
            ...orderData,
            items
          });
          toast.success(`Order ${existingOrder.orderNo} updated successfully!`, "Order Saved");
          router.navigate(`orders/${existingOrder.id}`);
        } else {
          const newOrder = store.createOrder({
            ...orderData,
            items
          });
          toast.success(`Order ${newOrder.orderNo} created successfully!`, "Order Created");
          router.navigate(`orders/${newOrder.id}`);
        }
      } catch (err) {
        toast.error(err.message, "Order Save Failed");
      }
    };

    const saveBtn = container.querySelector("#btn-save-order");
    const saveBtnBottom = container.querySelector("#btn-save-order-bottom");
    if (saveBtn) saveBtn.addEventListener("click", saveOrder);
    if (saveBtnBottom) saveBtnBottom.addEventListener("click", saveOrder);
  }

  function refreshCalculatedTotals() {
    const totals = calculateTotals();
    const subEl = container.querySelector("#sum-subtotal");
    const taxEl = container.querySelector("#sum-tax");
    const grandEl = container.querySelector("#sum-grand-total");
    const balanceEl = container.querySelector("#sum-balance-due");

    if (subEl) subEl.textContent = formatCurrency(totals.subtotal, settings.currency);
    if (taxEl) taxEl.textContent = formatCurrency(totals.taxVal, settings.currency);
    if (grandEl) grandEl.textContent = formatCurrency(totals.grandTotal, settings.currency);
    if (balanceEl) {
      balanceEl.textContent = formatCurrency(totals.balanceDue, settings.currency);
      balanceEl.style.color = totals.balanceDue > 0 ? 'var(--status-cancelled)' : 'var(--status-delivered)';
    }
  }

  renderView();
}


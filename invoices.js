/**
 * Invoice Management List Module
 * Implements PRD Requirements I-1, I-2, I-4.
 */

import { store } from '../store.js';
import { formatCurrency, formatDate, getPaymentStatusBadge, escapeHtml } from '../utils/formatters.js';
import { modal } from '../utils/modal.js';
import { toast } from '../utils/toast.js';

let state = {
  search: '',
  statusFilter: 'ALL'
};

export function renderInvoices(container) {
  const settings = store.getSettings();

  function getFilteredInvoices() {
    let list = store.getInvoices();

    if (state.search.trim()) {
      const q = state.search.toLowerCase().trim();
      list = list.filter(inv => {
        const order = store.getOrderById(inv.orderId);
        const cust = order ? store.getCustomerById(order.customerId) : null;
        const custName = cust ? cust.name.toLowerCase() : "";
        const invNo = (inv.invoiceNo || "").toLowerCase();
        const orderNo = order ? (order.orderNo || "").toLowerCase() : "";
        return invNo.includes(q) || custName.includes(q) || orderNo.includes(q);
      });
    }

    if (state.statusFilter !== 'ALL') {
      list = list.filter(inv => inv.status.toLowerCase() === state.statusFilter.toLowerCase());
    }

    return list;
  }

  function updateView() {
    const invoices = getFilteredInvoices();

    container.innerHTML = `
      <div class="page-container">
        <div class="page-header">
          <div class="page-title-group">
            <h1>Invoices</h1>
            <p class="page-description">Generate, track and record customer billing invoices</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" id="btn-quick-new-invoice">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create Invoice from Order
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar (I-2) -->
        <div class="card" style="margin-bottom: 1.25rem;">
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div class="toolbar" style="margin-bottom: 0;">
              <div class="toolbar-left">
                <div class="search-field">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" id="invoice-search" class="form-control" placeholder="Search invoice #, customer or order #..." value="${escapeHtml(state.search)}">
                </div>

                <select id="invoice-filter-status" class="form-control" style="width: auto;">
                  <option value="ALL" ${state.statusFilter === 'ALL' ? 'selected' : ''}>All Invoices</option>
                  <option value="Draft" ${state.statusFilter === 'Draft' ? 'selected' : ''}>Draft</option>
                  <option value="Sent" ${state.statusFilter === 'Sent' ? 'selected' : ''}>Sent</option>
                  <option value="Paid" ${state.statusFilter === 'Paid' ? 'selected' : ''}>Paid</option>
                  <option value="Overdue" ${state.statusFilter === 'Overdue' ? 'selected' : ''}>Overdue</option>
                </select>

                ${(state.search || state.statusFilter !== 'ALL') ? `
                  <button class="btn btn-ghost btn-sm" id="btn-clear-inv-filters" style="color: var(--status-cancelled);">
                    Clear
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Invoices List Table -->
        <div class="card">
          <div class="card-body" style="padding: 0;">
            ${invoices.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h4 class="empty-title">No invoices found</h4>
                <p class="empty-desc">Create an invoice from an existing sales order or adjust your search filter.</p>
              </div>
            ` : `
              <div class="table-container" style="border: none;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th class="text-right">Total Amount</th>
                      <th>Status</th>
                      <th class="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoices.map(inv => {
                      const order = store.getOrderById(inv.orderId);
                      const customer = order ? store.getCustomerById(order.customerId) : null;
                      return `
                        <tr>
                          <td>
                            <a href="#invoices/${inv.id}" style="font-weight: 600; font-family: var(--font-mono); color: var(--primary);">
                              ${escapeHtml(inv.invoiceNo)}
                            </a>
                          </td>
                          <td>
                            <a href="#orders/${order ? order.id : ''}" style="font-family: var(--font-mono);" class="text-muted">
                              ${escapeHtml(order ? order.orderNo : "—")}
                            </a>
                          </td>
                          <td>
                            <span style="font-weight: 500;">${escapeHtml(customer ? customer.name : "Unknown")}</span>
                          </td>
                          <td class="text-muted num">${formatDate(inv.issueDate)}</td>
                          <td class="text-muted num">${formatDate(inv.dueDate)}</td>
                          <td class="text-right num font-semibold">${formatCurrency(inv.total, settings.currency)}</td>
                          <td>${getPaymentStatusBadge(inv.status)}</td>
                          <td class="text-right">
                            <div class="table-actions justify-end">
                              <a href="#invoices/${inv.id}" class="btn btn-ghost btn-sm" title="View & Print">
                                View
                              </a>
                              ${inv.status !== 'Paid' ? `
                                <button class="btn btn-ghost btn-sm btn-mark-paid" data-id="${inv.id}" data-no="${inv.invoiceNo}" data-total="${inv.total}" style="color: var(--status-delivered);">
                                  Mark Paid
                                </button>
                              ` : ''}
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    const searchInput = container.querySelector("#invoice-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.search = e.target.value;
        updateView();
      });
    }

    const statusSelect = container.querySelector("#invoice-filter-status");
    if (statusSelect) {
      statusSelect.addEventListener("change", (e) => {
        state.statusFilter = e.target.value;
        updateView();
      });
    }

    const clearBtn = container.querySelector("#btn-clear-inv-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.search = '';
        state.statusFilter = 'ALL';
        updateView();
      });
    }

    // Quick New Invoice from Order Modal
    const newInvBtn = container.querySelector("#btn-quick-new-invoice");
    if (newInvBtn) {
      newInvBtn.addEventListener("click", () => {
        const orders = store.getOrders().filter(o => o.status !== "Cancelled");
        modal.open({
          title: "Generate Invoice from Order",
          content: `
            <div class="form-group">
              <label class="form-label required">Select Order</label>
              <select id="select-order-for-inv" class="form-control">
                ${orders.map(o => {
                  const cust = store.getCustomerById(o.customerId);
                  return `<option value="${o.id}">${o.orderNo} - ${cust ? cust.name : 'Unknown'} ($${o.grandTotal.toFixed(2)})</option>`;
                }).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Payment Due Date</label>
              <input type="date" id="inv-due-date" class="form-control" value="${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}">
            </div>
          `,
          footerHtml: `
            <button class="btn btn-secondary" id="modal-inv-cancel">Cancel</button>
            <button class="btn btn-primary" id="modal-inv-submit">Generate</button>
          `,
          size: "sm",
          onOpen: (modalEl) => {
            modalEl.querySelector("#modal-inv-cancel").onclick = () => modal.close();
            modalEl.querySelector("#modal-inv-submit").onclick = () => {
              const orderId = modalEl.querySelector("#select-order-for-inv").value;
              const dueDate = modalEl.querySelector("#inv-due-date").value;
              try {
                const inv = store.createInvoiceFromOrder(orderId, dueDate);
                modal.close();
                toast.success(`Invoice ${inv.invoiceNo} generated!`, "Success");
                updateView();
              } catch (err) {
                toast.error(err.message, "Failed");
              }
            };
          }
        });
      });
    }

    // Mark as Paid (I-4)
    container.querySelectorAll(".btn-mark-paid").forEach(btn => {
      btn.addEventListener("click", () => {
        const invId = btn.dataset.id;
        const invNo = btn.dataset.no;
        const total = btn.dataset.total;

        modal.open({
          title: `Mark Invoice ${invNo} as Paid`,
          content: `
            <div class="form-group">
              <label class="form-label required">Payment Method</label>
              <select id="mark-pay-method" class="form-control">
                <option value="Bank Transfer">Bank Transfer (ACH / Wire)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Check">Check</option>
                <option value="PayPal">PayPal</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Payment Date</label>
              <input type="date" id="mark-pay-date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <p class="text-sm text-muted">This will record a full payment for this invoice and update the associated order.</p>
          `,
          footerHtml: `
            <button class="btn btn-secondary" id="mark-cancel">Cancel</button>
            <button class="btn btn-primary" id="mark-confirm">Confirm Payment</button>
          `,
          size: "sm",
          onOpen: (modalEl) => {
            modalEl.querySelector("#mark-cancel").onclick = () => modal.close();
            modalEl.querySelector("#mark-confirm").onclick = () => {
              const method = modalEl.querySelector("#mark-pay-method").value;
              const date = modalEl.querySelector("#mark-pay-date").value;
              try {
                store.markInvoiceAsPaid(invId, method, date);
                modal.close();
                toast.success(`Invoice ${invNo} has been marked as paid!`, "Invoice Paid");
                updateView();
              } catch (err) {
                toast.error(err.message, "Failed");
              }
            };
          }
        });
      });
    });
  }

  updateView();
}


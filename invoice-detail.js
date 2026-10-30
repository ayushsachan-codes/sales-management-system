/**
 * Printable Invoice Detail View Module
 * Implements PRD Requirements I-3, I-5.
 */

import { store } from '../store.js';
import { router } from '../router.js';
import { formatCurrency, formatDate, getPaymentStatusBadge, escapeHtml } from '../utils/formatters.js';
import { printCurrentView } from '../utils/export.js';
import { toast } from '../utils/toast.js';

export function renderInvoiceDetail(container, params = {}) {
  const invoiceId = params.id;
  const invoice = store.getInvoiceById(invoiceId);

  if (!invoice) {
    toast.error("Invoice not found.", "Error");
    router.navigate("invoices");
    return;
  }

  const order = store.getOrderById(invoice.orderId);
  const customer = order ? store.getCustomerById(order.customerId) : null;
  const settings = store.getSettings();

  container.innerHTML = `
    <div class="page-container" style="max-width: 920px;">
      <!-- Interactive Top Actions Header (Hidden in Print) -->
      <div class="page-header no-print">
        <div class="page-title-group">
          <div class="flex items-center gap-2" style="margin-bottom: 0.35rem;">
            <a href="#invoices" class="text-sm font-semibold text-muted">&larr; Back to Invoices</a>
            <span class="text-muted text-xs">/</span>
            <span class="text-sm font-semibold text-muted font-mono">${escapeHtml(invoice.invoiceNo)}</span>
          </div>
          <h1>Invoice ${escapeHtml(invoice.invoiceNo)}</h1>
        </div>
        <div class="page-actions">
          <!-- I-5: Download / Print PDF -->
          <button class="btn btn-primary" id="btn-print-invoice">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print / Save as PDF
          </button>
          <a href="#orders/${order ? order.id : ''}" class="btn btn-secondary">
            View Order (${order ? order.orderNo : '—'})
          </a>
        </div>
      </div>

      <!-- Printable Invoice Sheet (I-3) -->
      <div class="card invoice-paper" style="box-shadow: var(--shadow-md);">
        <div class="card-body" style="padding: 2.5rem;">
          
          <!-- Business Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--border-light); padding-bottom: 2rem; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.5rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <div style="width: 40px; height: 40px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 1.15rem;">
                  N
                </div>
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0;">${escapeHtml(settings.companyName)}</h2>
              </div>
              <div class="text-sm text-secondary" style="max-width: 320px; line-height: 1.5;">
                ${escapeHtml(settings.companyAddress)}<br>
                ${escapeHtml(settings.companyEmail)} &bull; ${escapeHtml(settings.companyPhone)}
              </div>
            </div>

            <div style="text-align: right;">
              <h1 style="font-size: 2rem; font-weight: 800; color: var(--primary); letter-spacing: -0.03em; margin-bottom: 0.25rem;">INVOICE</h1>
              <div class="font-mono font-semibold" style="font-size: 1.1rem; color: var(--text-primary);">${escapeHtml(invoice.invoiceNo)}</div>
              <div style="margin-top: 0.5rem;">
                ${getPaymentStatusBadge(invoice.status)}
              </div>
            </div>
          </div>

          <!-- Bill-to and Metadata Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
              <div class="text-xs font-bold text-muted" style="text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Billed To:</div>
              <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${escapeHtml(customer ? customer.name : "Customer")}</div>
              <div class="text-sm" style="color: var(--text-secondary); margin-top: 0.25rem;">
                ${escapeHtml(customer ? (customer.company || "") : "")}<br>
                ${escapeHtml(order ? order.shippingAddress : (customer ? customer.address : ""))}<br>
                ${escapeHtml(customer ? customer.email : "")}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 0.35rem; font-size: 0.875rem;">
              <div><span class="text-muted">Associated Order:</span> <strong class="font-mono">${escapeHtml(order ? order.orderNo : "—")}</strong></div>
              <div><span class="text-muted">Issue Date:</span> <strong class="num">${formatDate(invoice.issueDate)}</strong></div>
              <div><span class="text-muted">Payment Due:</span> <strong class="num">${formatDate(invoice.dueDate)}</strong></div>
              <div><span class="text-muted">Payment Terms:</span> <strong>Net 30 Days</strong></div>
            </div>
          </div>

          <!-- Line Items Table -->
          <div style="margin-bottom: 2rem;">
            <table class="data-table" style="border: 1px solid var(--border-light);">
              <thead>
                <tr>
                  <th style="padding: 0.85rem 1rem;">Description</th>
                  <th style="width: 120px; text-align: right; padding: 0.85rem 1rem;">Unit Price</th>
                  <th style="width: 80px; text-align: center; padding: 0.85rem 1rem;">Qty</th>
                  <th style="width: 140px; text-align: right; padding: 0.85rem 1rem;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(order ? order.items : []).map(item => `
                  <tr>
                    <td style="padding: 0.85rem 1rem;">
                      <div style="font-weight: 600;">${escapeHtml(item.name)}</div>
                      <div class="text-xs text-muted font-mono">${escapeHtml(item.productId)}</div>
                    </td>
                    <td class="text-right num" style="padding: 0.85rem 1rem;">${formatCurrency(item.unitPrice, settings.currency)}</td>
                    <td class="text-center num" style="padding: 0.85rem 1rem;">${item.qty}</td>
                    <td class="text-right num font-semibold" style="padding: 0.85rem 1rem;">${formatCurrency(item.lineTotal, settings.currency)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Summary & Totals -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 2rem;">
            <div style="flex: 1; min-width: 260px;">
              <div class="text-xs font-bold text-muted" style="text-transform: uppercase; margin-bottom: 0.35rem;">Remittance & Payment Instructions:</div>
              <p class="text-sm text-secondary" style="line-height: 1.5;">
                Please remit wire or ACH payments to:<br>
                <strong>Bank:</strong> Silicon Valley Tech Bank<br>
                <strong>Routing:</strong> 121000358 &bull; <strong>Account:</strong> 99482019482<br>
                Reference invoice number <strong>${escapeHtml(invoice.invoiceNo)}</strong> on all payments.
              </p>
            </div>

            <div style="width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9375rem;">
              <div class="flex justify-between">
                <span class="text-muted">Subtotal:</span>
                <span class="num font-semibold">${formatCurrency(order ? order.subtotal : 0, settings.currency)}</span>
              </div>
              ${order && order.discount > 0 ? `
                <div class="flex justify-between">
                  <span class="text-muted">Discount (${order.discountType === 'percent' ? order.discount + '%' : 'Flat'}):</span>
                  <span class="num" style="color: var(--status-cancelled);">- ${formatCurrency(
                    order.discountType === 'percent' ? (order.subtotal * order.discount / 100) : order.discount,
                    settings.currency
                  )}</span>
                </div>
              ` : ''}
              <div class="flex justify-between">
                <span class="text-muted">Tax (${order ? order.taxRate : 0}%):</span>
                <span class="num">${formatCurrency(order ? order.tax : 0, settings.currency)}</span>
              </div>
              <div class="flex justify-between" style="border-top: 2px solid var(--border-strong); padding-top: 0.65rem; margin-top: 0.25rem;">
                <span style="font-size: 1.15rem; font-weight: 800;">Total Due:</span>
                <span class="num font-bold" style="font-size: 1.35rem; color: var(--primary);">
                  ${formatCurrency(invoice.total, settings.currency)}
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Note -->
          <div style="border-top: 1px solid var(--border-light); margin-top: 3rem; padding-top: 1.5rem; text-align: center;" class="text-xs text-muted">
            Thank you for your business! For billing inquiries, contact ${escapeHtml(settings.companyEmail)} or call ${escapeHtml(settings.companyPhone)}.
          </div>

        </div>
      </div>
    </div>
  `;

  // Attach Print trigger (I-5)
  const printBtn = container.querySelector("#btn-print-invoice");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      printCurrentView();
    });
  }
}


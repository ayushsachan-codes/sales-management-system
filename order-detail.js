/**
 * Order Detail View Module
 * Implements PRD Requirements T-1, T-2, T-3, T-4.
 */

import { store } from '../store.js';
import { router } from '../router.js';
import { formatCurrency, formatDate, getStatusBadge, getPaymentStatusBadge, escapeHtml } from '../utils/formatters.js';
import { toast } from '../utils/toast.js';
import { modal } from '../utils/modal.js';

export function renderOrderDetail(container, params = {}) {
  const orderId = params.id;
  const order = store.getOrderById(orderId);

  if (!order) {
    toast.error("Order not found.", "Error");
    router.navigate("orders");
    return;
  }

  const settings = store.getSettings();
  const customer = store.getCustomerById(order.customerId);
  const invoice = store.getInvoiceByOrderId(order.id);
  const payments = store.getPayments(order.id);

  // Status timeline steps
  const steps = ["Pending", "Processing", "Shipped", "Delivered"];
  const isCancelled = order.status === "Cancelled";
  const currentIndex = steps.indexOf(order.status);

  // Allowed next status
  const allowedTransitions = {
    Pending: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: []
  };
  const nextAllowed = allowedTransitions[order.status] || [];

  container.innerHTML = `
    <div class="page-container" style="max-width: 1100px;">
      <!-- Header with Breadcrumbs & Actions (T-4) -->
      <div class="page-header">
        <div class="page-title-group">
          <div class="flex items-center gap-2" style="margin-bottom: 0.35rem;">
            <a href="#orders" class="text-sm font-semibold text-muted">&larr; Back to Orders</a>
            <span class="text-muted text-xs">/</span>
            <span class="text-sm font-semibold text-muted" style="font-family: var(--font-mono);">${escapeHtml(order.orderNo)}</span>
          </div>
          <div class="flex items-center gap-3">
            <h1>Order ${escapeHtml(order.orderNo)}</h1>
            ${getStatusBadge(order.status)}
            ${getPaymentStatusBadge(order.paymentStatus)}
          </div>
        </div>

        <div class="page-actions">
          <!-- T-4 Actions: Edit, Generate Invoice, Simulated Email -->
          ${order.status !== 'Cancelled' ? `
            <a href="#orders/edit/${order.id}" class="btn btn-secondary">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Order
            </a>
          ` : ''}

          ${invoice ? `
            <a href="#invoices/${invoice.id}" class="btn btn-secondary">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              View Invoice (${invoice.invoiceNo})
            </a>
          ` : `
            <button class="btn btn-secondary" id="btn-create-invoice">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              Generate Invoice
            </button>
          `}

          <button class="btn btn-secondary" id="btn-send-email">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Send Notification
          </button>
        </div>
      </div>

      <!-- T-2: Status Stepper Timeline & Progression Controls -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <div>
            <h3 class="card-title">Order Lifecycle Timeline</h3>
            <p class="card-subtitle">Current Status: <strong style="color: var(--primary);">${order.status}</strong></p>
          </div>
          <div class="flex gap-2">
            ${nextAllowed.includes("Processing") ? `
              <button class="btn btn-primary btn-sm btn-advance-status" data-status="Processing">
                Mark as Processing &rarr;
              </button>
            ` : ''}
            ${nextAllowed.includes("Shipped") ? `
              <button class="btn btn-primary btn-sm btn-advance-status" data-status="Shipped">
                Ship Order &rarr;
              </button>
            ` : ''}
            ${nextAllowed.includes("Delivered") ? `
              <button class="btn btn-success btn-sm btn-advance-status" data-status="Delivered">
                Mark as Delivered &#10003;
              </button>
            ` : ''}
            ${nextAllowed.includes("Cancelled") ? `
              <button class="btn btn-danger btn-sm" id="btn-cancel-order">
                Cancel Order
              </button>
            ` : ''}
          </div>
        </div>
        <div class="card-body">
          <div class="timeline-container">
            ${isCancelled ? `
              <div style="background-color: var(--status-cancelled-bg); border: 1px solid var(--status-cancelled-border); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; color: var(--status-cancelled-text);">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                <div>
                  <div style="font-weight: 700;">This order has been cancelled</div>
                  <div class="text-sm">Stock reserved for items in this order has been returned to the warehouse inventory.</div>
                </div>
              </div>
            ` : `
              <div class="status-timeline">
                <div class="timeline-progress" style="width: ${currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 90 : 0}%;"></div>
                ${steps.map((st, idx) => {
                  let stepClass = "";
                  if (idx < currentIndex) stepClass = "completed";
                  else if (idx === currentIndex) stepClass = "current";

                  return `
                    <div class="timeline-step ${stepClass}">
                      <div class="step-circle">${idx < currentIndex ? '&#10003;' : (idx + 1)}</div>
                      <div class="step-label">${st}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;" class="form-grid-layout">
        <!-- Left: Line Items (T-1) -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Purchased Items (${order.items.length})</h3>
            </div>
            <div class="card-body" style="padding: 0;">
              <div class="table-container" style="border: none;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th class="text-right">Price</th>
                      <th class="text-center">Qty</th>
                      <th class="text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.map(item => `
                      <tr>
                        <td>
                          <div style="font-weight: 600;">${escapeHtml(item.name)}</div>
                          <div class="text-xs text-muted font-mono">${escapeHtml(item.productId)}</div>
                        </td>
                        <td class="text-right num">${formatCurrency(item.unitPrice, settings.currency)}</td>
                        <td class="text-center num">${item.qty}</td>
                        <td class="text-right num font-semibold">${formatCurrency(item.lineTotal, settings.currency)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Totals breakdown (T-1) -->
            <div class="card-footer" style="flex-direction: column; align-items: flex-end; gap: 0.5rem; background-color: var(--bg-surface);">
              <div style="width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 0.35rem;">
                <div class="flex justify-between text-sm">
                  <span class="text-muted">Subtotal:</span>
                  <span class="num font-semibold">${formatCurrency(order.subtotal, settings.currency)}</span>
                </div>
                ${order.discount > 0 ? `
                  <div class="flex justify-between text-sm">
                    <span class="text-muted">Discount (${order.discountType === 'percent' ? order.discount + '%' : 'Flat'}):</span>
                    <span class="num" style="color: var(--status-cancelled);">- ${formatCurrency(
                      order.discountType === 'percent' ? (order.subtotal * order.discount / 100) : order.discount,
                      settings.currency
                    )}</span>
                  </div>
                ` : ''}
                <div class="flex justify-between text-sm">
                  <span class="text-muted">Tax (${order.taxRate}%):</span>
                  <span class="num">${formatCurrency(order.tax, settings.currency)}</span>
                </div>
                <div class="flex justify-between" style="border-top: 1px solid var(--border-light); padding-top: 0.5rem; margin-top: 0.25rem;">
                  <span class="font-bold">Grand Total:</span>
                  <span class="num font-bold" style="font-size: 1.25rem; color: var(--primary);">
                    ${formatCurrency(order.grandTotal, settings.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Card -->
          ${order.notes ? `
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Order Notes & Instructions</h3>
              </div>
              <div class="card-body">
                <p style="white-space: pre-line;">${escapeHtml(order.notes)}</p>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Right: Customer Info, Shipping & Payment Summary (T-1, T-3) -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Customer Info -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Customer Information</h3>
            </div>
            <div class="card-body">
              ${customer ? `
                <div style="font-weight: 700; font-size: 1.05rem;">${escapeHtml(customer.name)}</div>
                <div class="text-sm text-muted" style="margin-bottom: 0.75rem;">${escapeHtml(customer.company || "Independent Account")}</div>
                
                <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.875rem;">
                  <div><strong>Email:</strong> <a href="mailto:${customer.email}">${escapeHtml(customer.email)}</a></div>
                  <div><strong>Phone:</strong> ${escapeHtml(customer.phone || "—")}</div>
                  <div><strong>Region:</strong> ${escapeHtml(customer.region || "—")}</div>
                </div>

                <div style="border-top: 1px solid var(--border-light); margin-top: 1rem; padding-top: 0.75rem;">
                  <div class="text-xs font-semibold text-muted" style="text-transform: uppercase; margin-bottom: 0.25rem;">Delivery Destination:</div>
                  <div class="text-sm">${escapeHtml(order.shippingAddress || customer.address)}</div>
                </div>
              ` : `
                <p class="text-muted">Customer details not found.</p>
              `}
            </div>
          </div>

          <!-- T-3: Payment Information & Record Payment Action -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Payment & Settlement</h3>
              ${getPaymentStatusBadge(order.paymentStatus)}
            </div>
            <div class="card-body">
              <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem;">
                <div class="flex justify-between">
                  <span class="text-muted">Method:</span>
                  <span class="font-semibold">${escapeHtml(order.paymentMethod || "Credit Card")}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Amount Paid:</span>
                  <span class="num font-semibold" style="color: var(--status-delivered);">${formatCurrency(order.amountPaid, settings.currency)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Balance Due:</span>
                  <span class="num font-bold" style="color: ${order.balanceDue > 0 ? 'var(--status-cancelled)' : 'var(--text-primary)'};">
                    ${formatCurrency(order.balanceDue, settings.currency)}
                  </span>
                </div>
              </div>

              <!-- Payment History Log -->
              <div style="margin-top: 1rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
                <div class="text-xs font-semibold text-muted" style="text-transform: uppercase; margin-bottom: 0.5rem;">Payment Transactions (${payments.length}):</div>
                ${payments.length === 0 ? `
                  <div class="text-xs text-muted">No payments logged yet.</div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                    ${payments.map(p => `
                      <div class="flex justify-between items-center text-xs" style="padding: 0.35rem 0.5rem; background-color: var(--bg-subtle); border-radius: var(--radius-sm);">
                        <span>${formatDate(p.date)} (${escapeHtml(p.method)})</span>
                        <strong class="num" style="color: var(--status-delivered);">${formatCurrency(p.amount, settings.currency)}</strong>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>

              <!-- Action to record payment if balance due > 0 -->
              ${order.balanceDue > 0 && order.status !== 'Cancelled' ? `
                <div style="margin-top: 1.25rem;">
                  <button type="button" class="btn btn-primary w-full btn-sm" id="btn-record-payment">
                    + Record Payment (${formatCurrency(order.balanceDue, settings.currency)})
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach interactive listeners
  attachDetailEvents(order, customer, settings);
}

function attachDetailEvents(order, customer, settings) {
  // Advance Status
  document.querySelectorAll(".btn-advance-status").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetStatus = btn.dataset.status;
      try {
        store.updateOrderStatus(order.id, targetStatus);
        toast.success(`Order marked as ${targetStatus}!`, "Status Updated");
        renderOrderDetail(document.getElementById("main-view"), { id: order.id });
      } catch (err) {
        toast.error(err.message, "Status Update Failed");
      }
    });
  });

  // Cancel Order
  const cancelBtn = document.getElementById("btn-cancel-order");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", async () => {
      const confirmed = await modal.confirm({
        title: "Cancel Order?",
        message: "Are you sure you want to cancel this order? Cancelling will restore all items back to available inventory.",
        confirmText: "Yes, Cancel Order",
        isDanger: true
      });

      if (confirmed) {
        try {
          store.updateOrderStatus(order.id, "Cancelled");
          modal.close();
          toast.warning("Order has been cancelled and stock was restored.", "Order Cancelled");
          renderOrderDetail(document.getElementById("main-view"), { id: order.id });
        } catch (err) {
          toast.error(err.message, "Cancellation Failed");
        }
      }
    });
  }

  // Generate Invoice
  const genInvBtn = document.getElementById("btn-create-invoice");
  if (genInvBtn) {
    genInvBtn.addEventListener("click", () => {
      try {
        const inv = store.createInvoiceFromOrder(order.id);
        toast.success(`Invoice ${inv.invoiceNo} generated successfully!`, "Invoice Created");
        router.navigate(`invoices/${inv.id}`);
      } catch (err) {
        toast.error(err.message, "Invoice Creation Failed");
      }
    });
  }

  // Simulated Email Notification (T-4, 4.10)
  const sendEmailBtn = document.getElementById("btn-send-email");
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener("click", () => {
      const recipient = customer ? customer.email : "customer@example.com";
      store.addNotification(
        `Email Sent: Order ${order.orderNo}`,
        `Simulated notification dispatched to ${recipient} with status "${order.status}".`,
        "order"
      );
      toast.info(`Simulated email sent to ${recipient}`, "Email Notification Dispatched");
    });
  }

  // Record Payment Modal (T-3)
  const recordPayBtn = document.getElementById("btn-record-payment");
  if (recordPayBtn) {
    recordPayBtn.addEventListener("click", () => {
      modal.open({
        title: `Record Payment for Order ${order.orderNo}`,
        content: `
          <form id="record-pay-form">
            <div class="form-group">
              <label class="form-label required">Payment Amount ($)</label>
              <input type="number" id="pay-amount" class="form-control" step="0.01" min="0.01" max="${order.balanceDue}" value="${order.balanceDue}" required>
              <div class="form-help">Current remaining balance: <strong>${formatCurrency(order.balanceDue, settings.currency)}</strong></div>
            </div>
            <div class="form-group">
              <label class="form-label required">Payment Method</label>
              <select id="pay-method" class="form-control" required>
                <option value="Bank Transfer">Bank Transfer (ACH / Wire)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Check">Company Check</option>
                <option value="PayPal">PayPal</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Payment Date</label>
              <input type="date" id="pay-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
          </form>
        `,
        footerHtml: `
          <button class="btn btn-secondary" id="pay-cancel">Cancel</button>
          <button class="btn btn-primary" id="pay-submit">Confirm Payment</button>
        `,
        size: "sm",
        onOpen: (modalEl) => {
          modalEl.querySelector("#pay-cancel").onclick = () => modal.close();
          modalEl.querySelector("#pay-submit").onclick = () => {
            const amount = parseFloat(modalEl.querySelector("#pay-amount").value);
            const method = modalEl.querySelector("#pay-method").value;
            const date = modalEl.querySelector("#pay-date").value;

            if (isNaN(amount) || amount <= 0) {
              toast.error("Please enter a valid positive payment amount.");
              return;
            }

            try {
              store.addPayment({
                orderId: order.id,
                amount,
                method,
                date
              });
              modal.close();
              toast.success(`Payment of ${formatCurrency(amount, settings.currency)} recorded!`, "Payment Logged");
              renderOrderDetail(document.getElementById("main-view"), { id: order.id });
            } catch (err) {
              toast.error(err.message, "Payment Failed");
            }
          };
        }
      });
    });
  }
}


/**
 * Sales Orders Module
 * Implements PRD Requirements O-1, O-2, O-3, O-4, O-5, O-6.
 */

import { store } from '../store.js';
import { formatCurrency, formatDate, getStatusBadge, getPaymentStatusBadge, escapeHtml } from '../utils/formatters.js';
import { exportToCsv } from '../utils/export.js';
import { modal } from '../utils/modal.js';
import { toast } from '../utils/toast.js';

let state = {
  search: '',
  statusFilter: 'ALL',
  paymentFilter: 'ALL',
  startDate: '',
  endDate: '',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10
};

export function renderOrders(container) {
  const settings = store.getSettings();

  function getFilteredOrders() {
    let list = store.getOrders();

    // Search filter (O-2)
    if (state.search.trim()) {
      const q = state.search.toLowerCase().trim();
      list = list.filter(o => {
        const cust = store.getCustomerById(o.customerId);
        const custName = cust ? cust.name.toLowerCase() : "";
        const orderNo = (o.orderNo || "").toLowerCase();
        return orderNo.includes(q) || custName.includes(q);
      });
    }

    // Status filter (O-3)
    if (state.statusFilter !== 'ALL') {
      list = list.filter(o => o.status.toLowerCase() === state.statusFilter.toLowerCase());
    }

    // Payment filter (O-3)
    if (state.paymentFilter !== 'ALL') {
      list = list.filter(o => o.paymentStatus.toLowerCase() === state.paymentFilter.toLowerCase());
    }

    // Date range filter (O-3)
    if (state.startDate) {
      list = list.filter(o => o.date >= state.startDate);
    }
    if (state.endDate) {
      list = list.filter(o => o.date <= state.endDate);
    }

    // Sorting (O-3)
    list.sort((a, b) => {
      let valA, valB;
      if (state.sortBy === 'total') {
        valA = Number(a.grandTotal) || 0;
        valB = Number(b.grandTotal) || 0;
      } else {
        // default date
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      }

      if (valA < valB) return state.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }

  function updateView() {
    const allFiltered = getFilteredOrders();
    const totalRecords = allFiltered.length;
    const totalPages = Math.ceil(totalRecords / state.pageSize) || 1;
    if (state.page > totalPages) state.page = totalPages;

    const startIdx = (state.page - 1) * state.pageSize;
    const paginatedOrders = allFiltered.slice(startIdx, startIdx + state.pageSize);

    container.innerHTML = `
      <div class="page-container">
        <div class="page-header">
          <div class="page-title-group">
            <h1>Sales Orders</h1>
            <p class="page-description">Search, track and manage client sales orders</p>
          </div>
          <div class="page-actions">
            <!-- O-6: Export CSV button -->
            <button class="btn btn-secondary" id="btn-export-csv">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export to CSV
            </button>
            <a href="#orders/create" class="btn btn-primary">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create New Order
            </a>
          </div>
        </div>

        <!-- Filter & Search Toolbar (O-2, O-3) -->
        <div class="card" style="margin-bottom: 1.25rem;">
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div class="toolbar" style="margin-bottom: 0;">
              <div class="toolbar-left">
                <!-- Search O-2 -->
                <div class="search-field">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" id="order-search" class="form-control" placeholder="Search order # or customer..." value="${escapeHtml(state.search)}">
                </div>

                <!-- Order Status Filter O-3 -->
                <select id="filter-status" class="form-control" style="width: auto;">
                  <option value="ALL" ${state.statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
                  <option value="Pending" ${state.statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Processing" ${state.statusFilter === 'Processing' ? 'selected' : ''}>Processing</option>
                  <option value="Shipped" ${state.statusFilter === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="Delivered" ${state.statusFilter === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="Cancelled" ${state.statusFilter === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>

                <!-- Payment Status Filter O-3 -->
                <select id="filter-payment" class="form-control" style="width: auto;">
                  <option value="ALL" ${state.paymentFilter === 'ALL' ? 'selected' : ''}>All Payments</option>
                  <option value="Paid" ${state.paymentFilter === 'Paid' ? 'selected' : ''}>Paid</option>
                  <option value="Partial" ${state.paymentFilter === 'Partial' ? 'selected' : ''}>Partial</option>
                  <option value="Unpaid" ${state.paymentFilter === 'Unpaid' ? 'selected' : ''}>Unpaid</option>
                </select>

                <!-- Date Range Filters O-3 -->
                <input type="date" id="filter-start-date" class="form-control" title="Start Date" value="${state.startDate}" style="width: auto;">
                <span class="text-muted text-xs">to</span>
                <input type="date" id="filter-end-date" class="form-control" title="End Date" value="${state.endDate}" style="width: auto;">

                ${(state.search || state.statusFilter !== 'ALL' || state.paymentFilter !== 'ALL' || state.startDate || state.endDate) ? `
                  <button class="btn btn-ghost btn-sm" id="btn-clear-filters" style="color: var(--status-cancelled);">
                    Clear Filters
                  </button>
                ` : ''}
              </div>

              <div class="toolbar-right">
                <span class="text-sm text-muted">Sort by:</span>
                <select id="sort-select" class="form-control" style="width: auto;">
                  <option value="date-desc" ${state.sortBy === 'date' && state.sortOrder === 'desc' ? 'selected' : ''}>Date (Newest first)</option>
                  <option value="date-asc" ${state.sortBy === 'date' && state.sortOrder === 'asc' ? 'selected' : ''}>Date (Oldest first)</option>
                  <option value="total-desc" ${state.sortBy === 'total' && state.sortOrder === 'desc' ? 'selected' : ''}>Total (High to Low)</option>
                  <option value="total-asc" ${state.sortBy === 'total' && state.sortOrder === 'asc' ? 'selected' : ''}>Total (Low to High)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders Table (O-1) -->
        <div class="card">
          <div class="card-body" style="padding: 0;">
            ${paginatedOrders.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </div>
                <h4 class="empty-title">No orders found</h4>
                <p class="empty-desc">Try clearing or adjusting your search filters, or create a new order.</p>
                <a href="#orders/create" class="btn btn-primary btn-sm">Create New Order</a>
              </div>
            ` : `
              <div class="table-container" style="border: none;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th class="sortable" id="th-sort-date">Date ${state.sortBy === 'date' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th class="text-right sortable" id="th-sort-total">Total ${state.sortBy === 'total' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th class="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${paginatedOrders.map(order => {
                      const cust = store.getCustomerById(order.customerId);
                      return `
                        <tr>
                          <td>
                            <a href="#orders/${order.id}" style="font-weight: 600; font-family: var(--font-mono); color: var(--primary);">
                              ${escapeHtml(order.orderNo)}
                            </a>
                          </td>
                          <td>
                            <div style="font-weight: 500;">${escapeHtml(cust ? cust.name : "Unknown")}</div>
                            <div class="text-xs text-muted">${escapeHtml(cust ? cust.company : "")}</div>
                          </td>
                          <td class="text-muted num">${formatDate(order.date)}</td>
                          <td class="text-right num font-semibold">${formatCurrency(order.grandTotal, settings.currency)}</td>
                          <td>${getPaymentStatusBadge(order.paymentStatus)}</td>
                          <td>${getStatusBadge(order.status)}</td>
                          <td class="text-right">
                            <div class="table-actions justify-end">
                              <a href="#orders/${order.id}" class="btn btn-ghost btn-sm" title="View Order">
                                View
                              </a>
                              <a href="#orders/edit/${order.id}" class="btn btn-ghost btn-sm" title="Edit Order">
                                Edit
                              </a>
                              <button class="btn btn-ghost btn-sm btn-delete-order" data-id="${order.id}" data-no="${order.orderNo}" style="color: var(--status-cancelled);" title="Delete Order">
                                Delete
                              </button>
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

          <!-- Pagination (O-5) -->
          ${totalRecords > 0 ? `
            <div class="card-footer">
              <div class="pagination-info">
                Showing <strong>${startIdx + 1}</strong> to <strong>${Math.min(startIdx + state.pageSize, totalRecords)}</strong> of <strong>${totalRecords}</strong> orders
              </div>
              <div class="pagination-controls">
                <button class="page-btn" id="btn-prev-page" ${state.page <= 1 ? 'disabled' : ''}>
                  &laquo; Prev
                </button>
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                  <button class="page-btn ${p === state.page ? 'active' : ''} btn-page-number" data-page="${p}">
                    ${p}
                  </button>
                `).join('')}
                <button class="page-btn" id="btn-next-page" ${state.page >= totalPages ? 'disabled' : ''}>
                  Next &raquo;
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    // Search input debounced
    const searchInput = container.querySelector("#order-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.search = e.target.value;
        state.page = 1;
        updateView();
      });
    }

    // Status filter
    const statusSelect = container.querySelector("#filter-status");
    if (statusSelect) {
      statusSelect.addEventListener("change", (e) => {
        state.statusFilter = e.target.value;
        state.page = 1;
        updateView();
      });
    }

    // Payment filter
    const paySelect = container.querySelector("#filter-payment");
    if (paySelect) {
      paySelect.addEventListener("change", (e) => {
        state.paymentFilter = e.target.value;
        state.page = 1;
        updateView();
      });
    }

    // Dates
    const startDate = container.querySelector("#filter-start-date");
    if (startDate) {
      startDate.addEventListener("change", (e) => {
        state.startDate = e.target.value;
        state.page = 1;
        updateView();
      });
    }

    const endDate = container.querySelector("#filter-end-date");
    if (endDate) {
      endDate.addEventListener("change", (e) => {
        state.endDate = e.target.value;
        state.page = 1;
        updateView();
      });
    }

    // Clear filters
    const clearBtn = container.querySelector("#btn-clear-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.search = '';
        state.statusFilter = 'ALL';
        state.paymentFilter = 'ALL';
        state.startDate = '';
        state.endDate = '';
        state.page = 1;
        updateView();
      });
    }

    // Sort select
    const sortSelect = container.querySelector("#sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        const [field, order] = e.target.value.split("-");
        state.sortBy = field;
        state.sortOrder = order;
        updateView();
      });
    }

    // Sort headers
    const thDate = container.querySelector("#th-sort-date");
    if (thDate) {
      thDate.addEventListener("click", () => {
        if (state.sortBy === 'date') {
          state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortBy = 'date';
          state.sortOrder = 'desc';
        }
        updateView();
      });
    }

    const thTotal = container.querySelector("#th-sort-total");
    if (thTotal) {
      thTotal.addEventListener("click", () => {
        if (state.sortBy === 'total') {
          state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortBy = 'total';
          state.sortOrder = 'desc';
        }
        updateView();
      });
    }

    // Pagination buttons
    const prevBtn = container.querySelector("#btn-prev-page");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (state.page > 1) {
          state.page--;
          updateView();
        }
      });
    }

    const nextBtn = container.querySelector("#btn-next-page");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        state.page++;
        updateView();
      });
    }

    container.querySelectorAll(".btn-page-number").forEach(btn => {
      btn.addEventListener("click", () => {
        state.page = parseInt(btn.dataset.page, 10);
        updateView();
      });
    });

    // Delete confirmation (O-4)
    container.querySelectorAll(".btn-delete-order").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const no = btn.dataset.no;

        const confirmed = await modal.confirm({
          title: `Delete Order ${no}?`,
          message: `Are you sure you want to permanently delete order ${no}? If the order was active, its inventory stock will be restored to products automatically.`,
          confirmText: "Delete Order",
          isDanger: true
        });

        if (confirmed) {
          try {
            store.deleteOrder(id);
            modal.close();
            toast.success(`Order ${no} deleted and inventory restored.`, "Order Removed");
            updateView();
          } catch (err) {
            toast.error(err.message, "Delete Failed");
          }
        }
      });
    });

    // CSV Export (O-6)
    const exportBtn = container.querySelector("#btn-export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        try {
          const filtered = getFilteredOrders();
          const rows = filtered.map(o => {
            const cust = store.getCustomerById(o.customerId);
            return {
              orderNo: o.orderNo,
              customer: cust ? cust.name : "Unknown",
              date: o.date,
              total: o.grandTotal,
              paymentStatus: o.paymentStatus,
              orderStatus: o.status,
              paymentMethod: o.paymentMethod,
              shippingAddress: o.shippingAddress
            };
          });

          const headers = [
            { key: "orderNo", label: "Order Number" },
            { key: "customer", label: "Customer" },
            { key: "date", label: "Order Date" },
            { key: "total", label: "Grand Total" },
            { key: "paymentStatus", label: "Payment Status" },
            { key: "orderStatus", label: "Order Status" },
            { key: "paymentMethod", label: "Payment Method" },
            { key: "shippingAddress", label: "Shipping Address" }
          ];

          exportToCsv("sales_orders", headers, rows);
          toast.success("Orders list exported to CSV successfully.", "Export Complete");
        } catch (err) {
          toast.error(err.message, "Export Failed");
        }
      });
    }
  }

  updateView();
}


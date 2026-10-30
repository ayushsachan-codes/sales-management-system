/**
 * Customer Management Module
 * Implements PRD Requirements U-1, U-2, U-3.
 */

import { store } from '../store.js';
import { formatCurrency, formatDate, getStatusBadge, escapeHtml } from '../utils/formatters.js';
import { modal } from '../utils/modal.js';
import { toast } from '../utils/toast.js';

let state = {
  search: '',
  regionFilter: 'ALL'
};

export function renderCustomers(container) {
  const settings = store.getSettings();

  function getFilteredCustomers() {
    let list = store.getCustomers();

    if (state.search.trim()) {
      const q = state.search.toLowerCase().trim();
      list = list.filter(c => {
        return (
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q) ||
          (c.region && c.region.toLowerCase().includes(q))
        );
      });
    }

    if (state.regionFilter !== 'ALL') {
      list = list.filter(c => c.region === state.regionFilter);
    }

    return list;
  }

  function updateView() {
    const customers = getFilteredCustomers();
    const allRegions = Array.from(new Set(store.getCustomers().map(c => c.region).filter(Boolean)));

    container.innerHTML = `
      <div class="page-container">
        <div class="page-header">
          <div class="page-title-group">
            <h1>Customer Accounts</h1>
            <p class="page-description">Maintain client directories, contact records and lifetime purchasing analytics</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" id="btn-add-customer">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Customer
            </button>
          </div>
        </div>

        <!-- Toolbar (U-1) -->
        <div class="card" style="margin-bottom: 1.25rem;">
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div class="toolbar" style="margin-bottom: 0;">
              <div class="toolbar-left">
                <div class="search-field">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" id="cust-search" class="form-control" placeholder="Search by name, company, email..." value="${escapeHtml(state.search)}">
                </div>

                <select id="cust-filter-region" class="form-control" style="width: auto;">
                  <option value="ALL" ${state.regionFilter === 'ALL' ? 'selected' : ''}>All Regions</option>
                  ${allRegions.map(r => `
                    <option value="${escapeHtml(r)}" ${state.regionFilter === r ? 'selected' : ''}>${escapeHtml(r)}</option>
                  `).join('')}
                </select>

                ${(state.search || state.regionFilter !== 'ALL') ? `
                  <button class="btn btn-ghost btn-sm" id="btn-clear-cust-filters" style="color: var(--status-cancelled);">
                    Clear
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Table (U-1) -->
        <div class="card">
          <div class="card-body" style="padding: 0;">
            ${customers.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h4 class="empty-title">No customers found</h4>
                <p class="empty-desc">Add a customer or try adjusting your search terms.</p>
              </div>
            ` : `
              <div class="table-container" style="border: none;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Company</th>
                      <th>Contact Info</th>
                      <th>Region</th>
                      <th class="text-right">Orders</th>
                      <th class="text-right">Lifetime Value</th>
                      <th class="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${customers.map(c => {
                      const stats = store.getCustomerStats(c.id);
                      return `
                        <tr>
                          <td>
                            <button class="btn-customer-profile text-left font-semibold" data-id="${c.id}" style="color: var(--primary); font-size: 0.9375rem;">
                              ${escapeHtml(c.name)}
                            </button>
                          </td>
                          <td>${escapeHtml(c.company || "—")}</td>
                          <td>
                            <div class="text-sm">${escapeHtml(c.email)}</div>
                            <div class="text-xs text-muted">${escapeHtml(c.phone || "")}</div>
                          </td>
                          <td>
                            <span class="badge" style="background-color: var(--bg-muted); color: var(--text-secondary); border-color: var(--border-light);">
                              ${escapeHtml(c.region || "General")}
                            </span>
                          </td>
                          <td class="text-right num font-semibold">${stats.orderCount}</td>
                          <td class="text-right num font-semibold" style="color: var(--status-delivered);">
                            ${formatCurrency(stats.totalSpent, settings.currency)}
                          </td>
                          <td class="text-right">
                            <div class="table-actions justify-end">
                              <button class="btn btn-ghost btn-sm btn-customer-profile" data-id="${c.id}" title="View Profile">
                                Profile
                              </button>
                              <button class="btn btn-ghost btn-sm btn-edit-customer" data-id="${c.id}" title="Edit Customer">
                                Edit
                              </button>
                              <button class="btn btn-ghost btn-sm btn-delete-customer" data-id="${c.id}" data-name="${escapeHtml(c.name)}" style="color: var(--status-cancelled);" title="Delete Customer">
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
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    const searchInput = container.querySelector("#cust-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.search = e.target.value;
        updateView();
      });
    }

    const regionSelect = container.querySelector("#cust-filter-region");
    if (regionSelect) {
      regionSelect.addEventListener("change", (e) => {
        state.regionFilter = e.target.value;
        updateView();
      });
    }

    const clearBtn = container.querySelector("#btn-clear-cust-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.search = '';
        state.regionFilter = 'ALL';
        updateView();
      });
    }

    // Add Customer Modal (U-1)
    const addBtn = container.querySelector("#btn-add-customer");
    if (addBtn) {
      addBtn.addEventListener("click", () => openCustomerModal());
    }

    // Edit Customer Modal (U-1)
    container.querySelectorAll(".btn-edit-customer").forEach(btn => {
      btn.addEventListener("click", () => {
        const c = store.getCustomerById(btn.dataset.id);
        if (c) openCustomerModal(c);
      });
    });

    // Customer Profile Modal (U-2)
    container.querySelectorAll(".btn-customer-profile").forEach(btn => {
      btn.addEventListener("click", () => {
        const c = store.getCustomerById(btn.dataset.id);
        if (c) openProfileModal(c);
      });
    });

    // Delete Customer Action with Warning / Protection (U-3)
    container.querySelectorAll(".btn-delete-customer").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const stats = store.getCustomerStats(id);

        if (stats.orderCount > 0) {
          modal.open({
            title: "Cannot Delete Customer",
            content: `
              <div style="color: var(--status-cancelled); display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <div style="font-weight: 700; font-size: 1.05rem;">Deletion Blocked</div>
              </div>
              <p style="color: var(--text-secondary); line-height: 1.5;">
                Customer <strong>${escapeHtml(name)}</strong> is associated with <strong>${stats.orderCount} existing sales order(s)</strong> with a lifetime value of <strong>${formatCurrency(stats.totalSpent, settings.currency)}</strong>.
              </p>
              <p class="text-sm text-muted" style="margin-top: 0.5rem;">
                To preserve accounting and invoice audit integrity, customers with active orders cannot be removed.
              </p>
            `,
            footerHtml: `<button class="btn btn-secondary" onclick="modal.close()">Understood</button>`,
            size: "sm"
          });
          return;
        }

        const confirmed = await modal.confirm({
          title: `Delete Customer "${name}"?`,
          message: `Are you sure you want to permanently remove customer ${name}?`,
          confirmText: "Delete Customer",
          isDanger: true
        });

        if (confirmed) {
          try {
            store.deleteCustomer(id);
            modal.close();
            toast.success(`Customer "${name}" removed successfully.`, "Customer Deleted");
            updateView();
          } catch (err) {
            toast.error(err.message, "Delete Failed");
          }
        }
      });
    });
  }

  function openCustomerModal(existing = null) {
    const isEdit = Boolean(existing);
    modal.open({
      title: isEdit ? `Edit Customer: ${existing.name}` : "Add New Customer",
      content: `
        <form id="customer-modal-form">
          <div class="form-group">
            <label class="form-label required">Customer / Contact Name</label>
            <input type="text" id="cust-input-name" class="form-control" required value="${escapeHtml(existing ? existing.name : '')}">
          </div>
          <div class="form-group">
            <label class="form-label required">Email Address</label>
            <input type="email" id="cust-input-email" class="form-control" required value="${escapeHtml(existing ? existing.email : '')}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="text" id="cust-input-phone" class="form-control" value="${escapeHtml(existing ? existing.phone : '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Region</label>
              <select id="cust-input-region" class="form-control">
                <option value="North America" ${existing && existing.region === 'North America' ? 'selected' : ''}>North America</option>
                <option value="Europe" ${existing && existing.region === 'Europe' ? 'selected' : ''}>Europe</option>
                <option value="Asia Pacific" ${existing && existing.region === 'Asia Pacific' ? 'selected' : ''}>Asia Pacific</option>
                <option value="Latin America" ${existing && existing.region === 'Latin America' ? 'selected' : ''}>Latin America</option>
                <option value="Middle East" ${existing && existing.region === 'Middle East' ? 'selected' : ''}>Middle East</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Company Name</label>
            <input type="text" id="cust-input-company" class="form-control" value="${escapeHtml(existing ? existing.company : '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Default Shipping Address</label>
            <input type="text" id="cust-input-address" class="form-control" value="${escapeHtml(existing ? existing.address : '')}">
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="cust-modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="cust-modal-save">${isEdit ? 'Save Changes' : 'Create Customer'}</button>
      `,
      size: "md",
      onOpen: (modalEl) => {
        modalEl.querySelector("#cust-modal-cancel").onclick = () => modal.close();
        modalEl.querySelector("#cust-modal-save").onclick = () => {
          const name = modalEl.querySelector("#cust-input-name").value.trim();
          const email = modalEl.querySelector("#cust-input-email").value.trim();

          if (!name || !email) {
            toast.error("Please provide both name and email.", "Missing Fields");
            return;
          }

          const payload = {
            name,
            email,
            phone: modalEl.querySelector("#cust-input-phone").value.trim(),
            region: modalEl.querySelector("#cust-input-region").value,
            company: modalEl.querySelector("#cust-input-company").value.trim(),
            address: modalEl.querySelector("#cust-input-address").value.trim()
          };

          try {
            if (isEdit) {
              store.updateCustomer(existing.id, payload);
              toast.success(`Customer "${name}" updated successfully.`);
            } else {
              store.addCustomer(payload);
              toast.success(`Customer "${name}" created successfully.`);
            }
            modal.close();
            updateView();
          } catch (err) {
            toast.error(err.message, "Save Failed");
          }
        };
      }
    });
  }

  function openProfileModal(customer) {
    const stats = store.getCustomerStats(customer.id);

    modal.open({
      title: `Customer Profile: ${customer.name}`,
      content: `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Header KPI Summary (U-2) -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div style="padding: 1rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-light); text-align: center;">
              <div class="text-xs text-muted font-semibold uppercase">Lifetime Value (LTV)</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: var(--status-delivered); margin-top: 0.25rem;">
                ${formatCurrency(stats.totalSpent, settings.currency)}
              </div>
            </div>
            <div style="padding: 1rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-light); text-align: center;">
              <div class="text-xs text-muted font-semibold uppercase">Orders Placed</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: var(--primary); margin-top: 0.25rem;">
                ${stats.orderCount}
              </div>
            </div>
            <div style="padding: 1rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-light); text-align: center;">
              <div class="text-xs text-muted font-semibold uppercase">Average Order Value</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">
                ${formatCurrency(stats.avgOrderValue, settings.currency)}
              </div>
            </div>
          </div>

          <!-- Customer Contact Meta -->
          <div style="padding: 1rem; border-radius: var(--radius-md); background-color: var(--bg-surface); border: 1px solid var(--border-light);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.875rem;">
              <div><strong>Company:</strong> ${escapeHtml(customer.company || "—")}</div>
              <div><strong>Region:</strong> ${escapeHtml(customer.region || "—")}</div>
              <div><strong>Email:</strong> ${escapeHtml(customer.email)}</div>
              <div><strong>Phone:</strong> ${escapeHtml(customer.phone || "—")}</div>
              <div style="grid-column: span 2;"><strong>Address:</strong> ${escapeHtml(customer.address || "—")}</div>
            </div>
          </div>

          <!-- Order History Table (U-2) -->
          <div>
            <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem;">Order History (${stats.orders.length})</h4>
            ${stats.orders.length === 0 ? `
              <div class="text-xs text-muted">No orders found for this customer.</div>
            ` : `
              <div class="table-container" style="max-height: 240px; overflow-y: auto;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th class="text-right">Total</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${stats.orders.map(o => `
                      <tr>
                        <td class="font-mono font-semibold">${escapeHtml(o.orderNo)}</td>
                        <td class="text-muted num">${formatDate(o.date)}</td>
                        <td>${getStatusBadge(o.status)}</td>
                        <td class="text-right num font-semibold">${formatCurrency(o.grandTotal, settings.currency)}</td>
                        <td class="text-right">
                          <a href="#orders/${o.id}" class="btn btn-ghost btn-sm" onclick="modal.close()">
                            View
                          </a>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="modal.close()">Close</button>
      `,
      size: "lg"
    });
  }

  updateView();
}


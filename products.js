/**
 * Product & Inventory Management Module
 * Implements PRD Requirements P-1, P-2, P-3, P-4.
 */

import { store } from '../store.js';
import { formatCurrency, getStockBadge, escapeHtml } from '../utils/formatters.js';
import { modal } from '../utils/modal.js';
import { toast } from '../utils/toast.js';

let state = {
  search: '',
  categoryFilter: 'ALL',
  stockStatusFilter: 'ALL'
};

export function renderProducts(container) {
  const settings = store.getSettings();

  function getFilteredProducts() {
    let list = store.getProducts();

    if (state.search.trim()) {
      const q = state.search.toLowerCase().trim();
      list = list.filter(p => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      });
    }

    if (state.categoryFilter !== 'ALL') {
      list = list.filter(p => p.category === state.categoryFilter);
    }

    if (state.stockStatusFilter !== 'ALL') {
      if (state.stockStatusFilter === 'OUT') {
        list = list.filter(p => p.stock <= 0);
      } else if (state.stockStatusFilter === 'LOW') {
        list = list.filter(p => p.stock > 0 && p.stock <= p.reorderLevel);
      } else if (state.stockStatusFilter === 'IN') {
        list = list.filter(p => p.stock > p.reorderLevel);
      }
    }

    return list;
  }

  function updateView() {
    const products = getFilteredProducts();
    const allProducts = store.getProducts();
    const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));

    // Inventory metrics
    const totalSKUs = allProducts.length;
    const lowStockCount = allProducts.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStockCount = allProducts.filter(p => p.stock <= 0).length;

    container.innerHTML = `
      <div class="page-container">
        <div class="page-header">
          <div class="page-title-group">
            <h1>Product Inventory</h1>
            <p class="page-description">Manage product catalog, pricing structures and live warehouse stock levels</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" id="btn-add-product">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Product
            </button>
          </div>
        </div>

        <!-- Inventory KPI Stat Strip (P-3) -->
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.25rem;">
          <div class="stat-card" style="padding: 1rem 1.25rem;">
            <div class="stat-info">
              <span class="stat-label">Active SKUs</span>
              <span class="stat-value" style="font-size: 1.5rem;">${totalSKUs}</span>
            </div>
            <div class="stat-icon blue" style="width: 36px; height: 36px;">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
          </div>

          <div class="stat-card" style="padding: 1rem 1.25rem;">
            <div class="stat-info">
              <span class="stat-label">Low Stock Alerts</span>
              <span class="stat-value" style="font-size: 1.5rem; color: var(--status-pending);">${lowStockCount}</span>
            </div>
            <div class="stat-icon amber" style="width: 36px; height: 36px;">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
          </div>

          <div class="stat-card" style="padding: 1rem 1.25rem;">
            <div class="stat-info">
              <span class="stat-label">Out of Stock</span>
              <span class="stat-value" style="font-size: 1.5rem; color: var(--status-cancelled);">${outOfStockCount}</span>
            </div>
            <div class="stat-icon red" style="width: 36px; height: 36px;">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
          </div>
        </div>

        <!-- Filter Toolbar (P-4) -->
        <div class="card" style="margin-bottom: 1.25rem;">
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div class="toolbar" style="margin-bottom: 0;">
              <div class="toolbar-left">
                <div class="search-field">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" id="prod-search" class="form-control" placeholder="Search by SKU, product name..." value="${escapeHtml(state.search)}">
                </div>

                <!-- Category Filter -->
                <select id="prod-filter-category" class="form-control" style="width: auto;">
                  <option value="ALL" ${state.categoryFilter === 'ALL' ? 'selected' : ''}>All Categories</option>
                  ${categories.map(c => `
                    <option value="${escapeHtml(c)}" ${state.categoryFilter === c ? 'selected' : ''}>${escapeHtml(c)}</option>
                  `).join('')}
                </select>

                <!-- Stock Status Filter (P-4) -->
                <select id="prod-filter-stock" class="form-control" style="width: auto;">
                  <option value="ALL" ${state.stockStatusFilter === 'ALL' ? 'selected' : ''}>All Stock Levels</option>
                  <option value="IN" ${state.stockStatusFilter === 'IN' ? 'selected' : ''}>In Stock</option>
                  <option value="LOW" ${state.stockStatusFilter === 'LOW' ? 'selected' : ''}>Low Stock Alert</option>
                  <option value="OUT" ${state.stockStatusFilter === 'OUT' ? 'selected' : ''}>Out of Stock</option>
                </select>

                ${(state.search || state.categoryFilter !== 'ALL' || state.stockStatusFilter !== 'ALL') ? `
                  <button class="btn btn-ghost btn-sm" id="btn-clear-prod-filters" style="color: var(--status-cancelled);">
                    Clear Filters
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Products Table (P-1, P-3) -->
        <div class="card">
          <div class="card-body" style="padding: 0;">
            ${products.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h4 class="empty-title">No products found</h4>
                <p class="empty-desc">Try clearing your filters or create a new product item.</p>
              </div>
            ` : `
              <div class="table-container" style="border: none;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th class="text-right">Unit Price</th>
                      <th class="text-center">Current Stock</th>
                      <th class="text-center">Reorder Point</th>
                      <th>Stock Status</th>
                      <th class="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${products.map(p => `
                      <tr>
                        <td class="font-mono font-semibold" style="color: var(--text-secondary);">${escapeHtml(p.sku)}</td>
                        <td style="font-weight: 600;">${escapeHtml(p.name)}</td>
                        <td>
                          <span class="badge" style="background-color: var(--bg-muted); color: var(--text-secondary); border-color: var(--border-light);">
                            ${escapeHtml(p.category)}
                          </span>
                        </td>
                        <td class="text-right num font-semibold">${formatCurrency(p.price, settings.currency)}</td>
                        <td class="text-center num font-bold">${p.stock}</td>
                        <td class="text-center num text-muted">${p.reorderLevel}</td>
                        <td>${getStockBadge(p.stock, p.reorderLevel)}</td>
                        <td class="text-right">
                          <div class="table-actions justify-end">
                            <button class="btn btn-ghost btn-sm btn-edit-product" data-id="${p.id}" title="Edit Product">
                              Edit
                            </button>
                            <button class="btn btn-ghost btn-sm btn-delete-product" data-id="${p.id}" data-name="${escapeHtml(p.name)}" style="color: var(--status-cancelled);" title="Delete Product">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
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
    const searchInput = container.querySelector("#prod-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.search = e.target.value;
        updateView();
      });
    }

    const catSelect = container.querySelector("#prod-filter-category");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        state.categoryFilter = e.target.value;
        updateView();
      });
    }

    const stockSelect = container.querySelector("#prod-filter-stock");
    if (stockSelect) {
      stockSelect.addEventListener("change", (e) => {
        state.stockStatusFilter = e.target.value;
        updateView();
      });
    }

    const clearBtn = container.querySelector("#btn-clear-prod-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.search = '';
        state.categoryFilter = 'ALL';
        state.stockStatusFilter = 'ALL';
        updateView();
      });
    }

    // Add Product Modal (P-1)
    const addBtn = container.querySelector("#btn-add-product");
    if (addBtn) {
      addBtn.addEventListener("click", () => openProductModal());
    }

    // Edit Product Modal (P-1)
    container.querySelectorAll(".btn-edit-product").forEach(btn => {
      btn.addEventListener("click", () => {
        const prod = store.getProductById(btn.dataset.id);
        if (prod) openProductModal(prod);
      });
    });

    // Delete Product
    container.querySelectorAll(".btn-delete-product").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        const confirmed = await modal.confirm({
          title: `Delete Product "${name}"?`,
          message: `Are you sure you want to permanently remove "${name}" from inventory?`,
          confirmText: "Delete Product",
          isDanger: true
        });

        if (confirmed) {
          try {
            store.deleteProduct(id);
            modal.close();
            toast.success(`Product "${name}" deleted successfully.`);
            updateView();
          } catch (err) {
            toast.error(err.message, "Delete Failed");
          }
        }
      });
    });
  }

  function openProductModal(existing = null) {
    const isEdit = Boolean(existing);
    modal.open({
      title: isEdit ? `Edit Product: ${existing.name}` : "Add New Product",
      content: `
        <form id="product-modal-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">SKU (Stock Keeping Unit)</label>
              <input type="text" id="prod-input-sku" class="form-control font-mono" required placeholder="e.g. ELEC-2005" value="${escapeHtml(existing ? existing.sku : '')}">
            </div>
            <div class="form-group">
              <label class="form-label required">Category</label>
              <select id="prod-input-category" class="form-control">
                <option value="Electronics" ${existing && existing.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                <option value="Furniture" ${existing && existing.category === 'Furniture' ? 'selected' : ''}>Furniture</option>
                <option value="Software" ${existing && existing.category === 'Software' ? 'selected' : ''}>Software</option>
                <option value="Accessories" ${existing && existing.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                <option value="Office Supplies" ${existing && existing.category === 'Office Supplies' ? 'selected' : ''}>Office Supplies</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">Product Name</label>
            <input type="text" id="prod-input-name" class="form-control" required placeholder="Full product description" value="${escapeHtml(existing ? existing.name : '')}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">Unit Price ($)</label>
              <input type="number" step="0.01" min="0" id="prod-input-price" class="form-control" required value="${existing ? existing.price : ''}">
            </div>
            <div class="form-group">
              <label class="form-label required">Current In-Stock Quantity</label>
              <input type="number" min="0" id="prod-input-stock" class="form-control" required value="${existing ? existing.stock : '10'}">
            </div>
            <div class="form-group">
              <label class="form-label required">Reorder Warning Level</label>
              <input type="number" min="0" id="prod-input-reorder" class="form-control" required value="${existing ? existing.reorderLevel : '5'}">
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="prod-modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="prod-modal-save">${isEdit ? 'Save Changes' : 'Add to Inventory'}</button>
      `,
      size: "md",
      onOpen: (modalEl) => {
        modalEl.querySelector("#prod-modal-cancel").onclick = () => modal.close();
        modalEl.querySelector("#prod-modal-save").onclick = () => {
          const sku = modalEl.querySelector("#prod-input-sku").value.trim();
          const name = modalEl.querySelector("#prod-input-name").value.trim();
          const category = modalEl.querySelector("#prod-input-category").value;
          const price = parseFloat(modalEl.querySelector("#prod-input-price").value);
          const stock = parseInt(modalEl.querySelector("#prod-input-stock").value, 10);
          const reorderLevel = parseInt(modalEl.querySelector("#prod-input-reorder").value, 10);

          if (!sku || !name || isNaN(price) || isNaN(stock)) {
            toast.error("Please fill in all required product fields.", "Validation Error");
            return;
          }

          const payload = {
            sku,
            name,
            category,
            price,
            stock,
            reorderLevel: isNaN(reorderLevel) ? 5 : reorderLevel
          };

          try {
            if (isEdit) {
              store.updateProduct(existing.id, payload);
              toast.success(`Product "${name}" updated successfully.`);
            } else {
              store.addProduct(payload);
              toast.success(`Product "${name}" added to inventory.`);
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

  updateView();
}


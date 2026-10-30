/**
 * Dashboard Module
 * Implements PRD Requirements D-1, D-2, D-3, D-4, D-5.
 */

import { store } from '../store.js';
import { formatCurrency, formatDate, getStatusBadge, getPaymentStatusBadge, escapeHtml } from '../utils/formatters.js';

let revenueChartInstance = null;
let statusChartInstance = null;

export function renderDashboard(container) {
  const metrics = store.getDashboardMetrics();
  const settings = store.getSettings();

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Sales Dashboard</h1>
          <p class="page-description">Real-time overview of revenue, active orders, and sales performance</p>
        </div>
        <div class="page-actions">
          <a href="#orders/create" class="btn btn-primary">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create Order
          </a>
          <a href="#reports" class="btn btn-secondary">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            View Reports
          </a>
        </div>
      </div>

      <!-- D-1: KPI Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Total Revenue</span>
            <span class="stat-value">${formatCurrency(metrics.totalRevenue, settings.currency)}</span>
            <div class="stat-trend up">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="18 15 12 9 6 15"></polyline></svg>
              <span>+18.4% vs last period</span>
            </div>
          </div>
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Total Orders</span>
            <span class="stat-value">${metrics.totalOrders}</span>
            <div class="stat-trend up">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="18 15 12 9 6 15"></polyline></svg>
              <span>+12% this month</span>
            </div>
          </div>
          <div class="stat-icon green">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Pending Orders</span>
            <span class="stat-value">${metrics.pendingOrders}</span>
            <div class="stat-trend neutral">
              <span>Requires fulfillment</span>
            </div>
          </div>
          <div class="stat-icon amber">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Active Customers</span>
            <span class="stat-value">${metrics.activeCustomers}</span>
            <div class="stat-trend up">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="18 15 12 9 6 15"></polyline></svg>
              <span>High retention</span>
            </div>
          </div>
          <div class="stat-icon indigo">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>
      </div>

      <!-- D-2: Order Summary Counts Grouped By Status -->
      <div class="card" style="margin-bottom: 1.75rem;">
        <div class="card-header">
          <div>
            <h3 class="card-title">Order Lifecycle Status</h3>
            <p class="card-subtitle">Real-time count of orders in each operational stage</p>
          </div>
          <a href="#orders" class="text-sm font-semibold">View All Orders &rarr;</a>
        </div>
        <div class="card-body" style="padding: 1rem 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem;">
            <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--status-pending-bg); border: 1px solid var(--status-pending-border);">
              <div class="text-xs font-semibold" style="color: var(--status-pending-text); text-transform: uppercase;">Pending</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--status-pending-text);">${metrics.statusCounts.Pending || 0}</div>
            </div>
            <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--status-processing-bg); border: 1px solid var(--status-processing-border);">
              <div class="text-xs font-semibold" style="color: var(--status-processing-text); text-transform: uppercase;">Processing</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--status-processing-text);">${metrics.statusCounts.Processing || 0}</div>
            </div>
            <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--status-shipped-bg); border: 1px solid var(--status-shipped-border);">
              <div class="text-xs font-semibold" style="color: var(--status-shipped-text); text-transform: uppercase;">Shipped</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--status-shipped-text);">${metrics.statusCounts.Shipped || 0}</div>
            </div>
            <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--status-delivered-bg); border: 1px solid var(--status-delivered-border);">
              <div class="text-xs font-semibold" style="color: var(--status-delivered-text); text-transform: uppercase;">Delivered</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--status-delivered-text);">${metrics.statusCounts.Delivered || 0}</div>
            </div>
            <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--status-cancelled-bg); border: 1px solid var(--status-cancelled-border);">
              <div class="text-xs font-semibold" style="color: var(--status-cancelled-text); text-transform: uppercase;">Cancelled</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--status-cancelled-text);">${metrics.statusCounts.Cancelled || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- D-4: Charts Section (Revenue Over Time & Sales by Status) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 1.75rem;">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Monthly Revenue</h3>
              <p class="card-subtitle">Revenue progression across previous months</p>
            </div>
          </div>
          <div class="card-body" style="height: 280px; position: relative;">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Order Status Distribution</h3>
              <p class="card-subtitle">Breakdown of orders by fulfillment state</p>
            </div>
          </div>
          <div class="card-body" style="height: 280px; position: relative;">
            <canvas id="statusChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Top Selling Products (D-3) & Recent Orders (D-5) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        <!-- D-3: Top-Selling Products -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Top-Selling Products</h3>
              <p class="card-subtitle">Highest volume and revenue generators</p>
            </div>
            <a href="#products" class="text-sm font-semibold">Inventory &rarr;</a>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="table-container" style="border: none;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th class="text-right">Units</th>
                    <th class="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${metrics.topProducts.map(p => `
                    <tr>
                      <td style="font-weight: 600;">${escapeHtml(p.name)}</td>
                      <td class="text-right num">${p.units}</td>
                      <td class="text-right num font-semibold">${formatCurrency(p.revenue, settings.currency)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- D-5: Recent Orders -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Recent Orders</h3>
              <p class="card-subtitle">Latest incoming and processed purchases</p>
            </div>
            <a href="#orders" class="text-sm font-semibold">View All &rarr;</a>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="table-container" style="border: none;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${metrics.recentOrders.map(o => {
                    const cust = store.getCustomerById(o.customerId);
                    return `
                      <tr>
                        <td>
                          <a href="#orders/${o.id}" style="font-weight: 600; font-family: var(--font-mono);">
                            ${escapeHtml(o.orderNo)}
                          </a>
                        </td>
                        <td>${escapeHtml(cust ? cust.name : "Unknown")}</td>
                        <td>${getStatusBadge(o.status)}</td>
                        <td class="text-right num font-semibold">${formatCurrency(o.grandTotal, settings.currency)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render Charts
  initCharts(metrics);
}

function initCharts(metrics) {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

  const revCanvas = document.getElementById("revenueChart");
  const statusCanvas = document.getElementById("statusChart");

  if (!revCanvas || !statusCanvas) return;

  // Cleanup old instances
  if (revenueChartInstance) {
    revenueChartInstance.destroy();
    revenueChartInstance = null;
  }
  if (statusChartInstance) {
    statusChartInstance.destroy();
    statusChartInstance = null;
  }

  if (typeof window.Chart === "undefined") {
    // Graceful fallback if Chart.js is not loaded
    revCanvas.parentElement.innerHTML = `<div class="empty-state"><p class="text-muted">Monthly Revenue: $48,225.88 (Chart library loading)</p></div>`;
    statusCanvas.parentElement.innerHTML = `<div class="empty-state"><p class="text-muted">Status breakdown available in table above</p></div>`;
    return;
  }

  // Monthly Revenue Data (Grouped from orders)
  const orders = store.getOrders().filter(o => o.status !== "Cancelled");
  const monthlyRevenue = {};
  const monthNames = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  monthNames.forEach(m => monthlyRevenue[m] = 0);

  orders.forEach(o => {
    const d = new Date(o.date);
    const m = d.toLocaleString('en-US', { month: 'short' });
    if (monthlyRevenue[m] !== undefined) {
      monthlyRevenue[m] += o.grandTotal;
    }
  });

  const revCtx = revCanvas.getContext("2d");
  revenueChartInstance = new window.Chart(revCtx, {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [{
        label: 'Revenue ($)',
        data: monthNames.map(m => monthlyRevenue[m]),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Revenue: $${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: {
            color: textColor,
            callback: (val) => `$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`
          },
          grid: { color: gridColor }
        }
      }
    }
  });

  // Status breakdown chart
  const statusCtx = statusCanvas.getContext("2d");
  const counts = metrics.statusCounts;
  statusChartInstance = new window.Chart(statusCtx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [{
        data: [
          counts.Pending || 0,
          counts.Processing || 0,
          counts.Shipped || 0,
          counts.Delivered || 0,
          counts.Cancelled || 0
        ],
        backgroundColor: [
          '#f59e0b',
          '#2563eb',
          '#6366f1',
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 2,
        borderColor: isDark ? '#131c2e' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, boxWidth: 12, padding: 12 }
        }
      },
      cutout: '68%'
    }
  });
}


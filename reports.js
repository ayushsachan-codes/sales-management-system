/**
 * Sales Analytics & Reports Module
 * Implements PRD Requirements R-1, R-2, R-3.
 */

import { store } from '../store.js';
import { formatCurrency, escapeHtml } from '../utils/formatters.js';
import { exportToCsv, printCurrentView } from '../utils/export.js';
import { toast } from '../utils/toast.js';

let chartInstances = [];

let state = {
  period: 'monthly', // 'daily', 'weekly', 'monthly'
  startDate: '',
  endDate: ''
};

export function renderReports(container) {
  const settings = store.getSettings();

  function getFilteredOrders() {
    let orders = store.getOrders().filter(o => o.status !== "Cancelled");
    if (state.startDate) {
      orders = orders.filter(o => o.date >= state.startDate);
    }
    if (state.endDate) {
      orders = orders.filter(o => o.date <= state.endDate);
    }
    return orders;
  }

  function computeAggregations(orders) {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // By Period (Daily / Weekly / Monthly)
    const periodMap = {};
    orders.forEach(o => {
      let key = o.date;
      if (state.period === 'monthly') {
        key = o.date.substring(0, 7); // YYYY-MM
      } else if (state.period === 'weekly') {
        const d = new Date(o.date);
        const firstDay = new Date(d.setDate(d.getDate() - d.getDay()));
        key = `Week of ${firstDay.toISOString().split('T')[0]}`;
      }

      if (!periodMap[key]) {
        periodMap[key] = { key, revenue: 0, orders: 0 };
      }
      periodMap[key].revenue += o.grandTotal;
      periodMap[key].orders += 1;
    });

    const periodRows = Object.values(periodMap).sort((a, b) => a.key.localeCompare(b.key));

    // By Region (R-2)
    const regionMap = {};
    orders.forEach(o => {
      const cust = store.getCustomerById(o.customerId);
      const region = (cust && cust.region) ? cust.region : "Unassigned";
      if (!regionMap[region]) {
        regionMap[region] = { region, orders: 0, revenue: 0 };
      }
      regionMap[region].orders += 1;
      regionMap[region].revenue += o.grandTotal;
    });

    const regionRows = Object.values(regionMap).sort((a, b) => b.revenue - a.revenue);

    // By Product (R-2)
    const productMap = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!productMap[item.productId]) {
          const prod = store.getProductById(item.productId);
          productMap[item.productId] = {
            productId: item.productId,
            name: item.name,
            category: prod ? prod.category : "General",
            units: 0,
            revenue: 0
          };
        }
        productMap[item.productId].units += item.qty;
        productMap[item.productId].revenue += item.lineTotal;
      });
    });

    const productRows = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      periodRows,
      regionRows,
      productRows
    };
  }

  function updateView() {
    const orders = getFilteredOrders();
    const data = computeAggregations(orders);

    container.innerHTML = `
      <div class="page-container">
        <!-- Header & Action Controls (R-3) -->
        <div class="page-header">
          <div class="page-title-group">
            <h1>Sales Reports & Analytics</h1>
            <p class="page-description">Examine revenue cycles, category volumes and geographical market penetration</p>
          </div>
          <div class="page-actions no-print">
            <button class="btn btn-secondary" id="btn-export-reports-csv">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export to CSV
            </button>
            <button class="btn btn-secondary" id="btn-print-reports">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print / Save as PDF
            </button>
          </div>
        </div>

        <!-- Filter Controls (R-1) -->
        <div class="card no-print" style="margin-bottom: 1.5rem;">
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div class="toolbar" style="margin-bottom: 0;">
              <div class="toolbar-left">
                <span class="text-sm font-semibold">Period Grouping:</span>
                <select id="report-period-select" class="form-control" style="width: auto;">
                  <option value="daily" ${state.period === 'daily' ? 'selected' : ''}>Daily Breakdown</option>
                  <option value="weekly" ${state.period === 'weekly' ? 'selected' : ''}>Weekly Breakdown</option>
                  <option value="monthly" ${state.period === 'monthly' ? 'selected' : ''}>Monthly Breakdown</option>
                </select>

                <span class="text-sm font-semibold" style="margin-left: 0.5rem;">Date Range:</span>
                <input type="date" id="rep-start-date" class="form-control" value="${state.startDate}" style="width: auto;">
                <span class="text-muted text-xs">to</span>
                <input type="date" id="rep-end-date" class="form-control" value="${state.endDate}" style="width: auto;">

                ${(state.startDate || state.endDate) ? `
                  <button class="btn btn-ghost btn-sm" id="btn-clear-rep-dates" style="color: var(--status-cancelled);">
                    Reset Dates
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Summary KPI Cards -->
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.5rem;">
          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-label">Analyzed Period Revenue</span>
              <span class="stat-value" style="color: var(--primary);">${formatCurrency(data.totalRevenue, settings.currency)}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-label">Delivered & Active Orders</span>
              <span class="stat-value">${data.totalOrders}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-label">Average Order Value</span>
              <span class="stat-value" style="color: var(--status-delivered);">${formatCurrency(data.avgOrderValue, settings.currency)}</span>
            </div>
          </div>
        </div>

        <!-- Charts (R-2) -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;" class="form-grid-layout">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Revenue Trajectory (${state.period.toUpperCase()})</h3>
            </div>
            <div class="card-body" style="height: 300px; position: relative;">
              <canvas id="periodChart"></canvas>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Regional Sales Share</h3>
            </div>
            <div class="card-body" style="height: 300px; position: relative;">
              <canvas id="regionChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Tables (R-2) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;" class="form-grid-layout">
          <!-- Sales by Region Table -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Sales by Region</h3>
            </div>
            <div class="card-body" style="padding: 0;">
              <div class="table-container" style="border: none;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th class="text-center">Orders</th>
                      <th class="text-right">Revenue</th>
                      <th class="text-right">% Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.regionRows.map(r => {
                      const share = data.totalRevenue > 0 ? ((r.revenue / data.totalRevenue) * 100).toFixed(1) : 0;
                      return `
                        <tr>
                          <td style="font-weight: 600;">${escapeHtml(r.region)}</td>
                          <td class="text-center num">${r.orders}</td>
                          <td class="text-right num font-semibold">${formatCurrency(r.revenue, settings.currency)}</td>
                          <td class="text-right num text-muted">${share}%</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Sales by Period Table -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Period Revenue Breakdown</h3>
            </div>
            <div class="card-body" style="padding: 0;">
              <div class="table-container" style="border: none;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th class="text-center">Orders</th>
                      <th class="text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.periodRows.map(p => `
                      <tr>
                        <td style="font-weight: 600; font-family: var(--font-mono);">${escapeHtml(p.key)}</td>
                        <td class="text-center num">${p.orders}</td>
                        <td class="text-right num font-semibold">${formatCurrency(p.revenue, settings.currency)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales by Product Table (R-2) -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Product Performance Breakdown</h3>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="table-container" style="border: none;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th class="text-right">Units Sold</th>
                    <th class="text-right">Total Revenue</th>
                    <th class="text-right">Avg / Unit</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.productRows.map(pr => {
                    const avg = pr.units > 0 ? pr.revenue / pr.units : 0;
                    return `
                      <tr>
                        <td style="font-weight: 600;">${escapeHtml(pr.name)}</td>
                        <td>
                          <span class="badge" style="background-color: var(--bg-muted); color: var(--text-secondary); border-color: var(--border-light);">
                            ${escapeHtml(pr.category)}
                          </span>
                        </td>
                        <td class="text-right num">${pr.units}</td>
                        <td class="text-right num font-semibold">${formatCurrency(pr.revenue, settings.currency)}</td>
                        <td class="text-right num text-muted">${formatCurrency(avg, settings.currency)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    attachEvents(data);
    initReportCharts(data);
  }

  function attachEvents(data) {
    const periodSelect = container.querySelector("#report-period-select");
    if (periodSelect) {
      periodSelect.addEventListener("change", (e) => {
        state.period = e.target.value;
        updateView();
      });
    }

    const startDate = container.querySelector("#rep-start-date");
    if (startDate) {
      startDate.addEventListener("change", (e) => {
        state.startDate = e.target.value;
        updateView();
      });
    }

    const endDate = container.querySelector("#rep-end-date");
    if (endDate) {
      endDate.addEventListener("change", (e) => {
        state.endDate = e.target.value;
        updateView();
      });
    }

    const clearBtn = container.querySelector("#btn-clear-rep-dates");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.startDate = '';
        state.endDate = '';
        updateView();
      });
    }

    // CSV Export (R-3)
    const exportBtn = container.querySelector("#btn-export-reports-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        try {
          const rows = data.productRows.map(pr => ({
            product: pr.name,
            category: pr.category,
            units: pr.units,
            revenue: pr.revenue.toFixed(2),
            avgPrice: (pr.units > 0 ? (pr.revenue / pr.units).toFixed(2) : '0.00')
          }));

          const headers = [
            { key: "product", label: "Product Name" },
            { key: "category", label: "Category" },
            { key: "units", label: "Units Sold" },
            { key: "revenue", label: "Total Revenue ($)" },
            { key: "avgPrice", label: "Average Unit Price ($)" }
          ];

          exportToCsv(`sales_report_${state.period}`, headers, rows);
          toast.success("Sales report exported to CSV.", "Export Done");
        } catch (err) {
          toast.error(err.message, "Export Failed");
        }
      });
    }

    // Print / PDF (R-3)
    const printBtn = container.querySelector("#btn-print-reports");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        printCurrentView();
      });
    }
  }

  function initReportCharts(data) {
    chartInstances.forEach(c => c.destroy());
    chartInstances = [];

    const periodCanvas = document.getElementById("periodChart");
    const regionCanvas = document.getElementById("regionChart");

    if (!periodCanvas || !regionCanvas || typeof window.Chart === "undefined") return;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

    // Period chart
    const periodChart = new window.Chart(periodCanvas.getContext("2d"), {
      type: 'bar',
      data: {
        labels: data.periodRows.map(p => p.key),
        datasets: [{
          label: 'Revenue ($)',
          data: data.periodRows.map(p => p.revenue),
          backgroundColor: '#2563eb',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: {
            ticks: {
              color: textColor,
              callback: (v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`
            },
            grid: { color: gridColor }
          }
        }
      }
    });
    chartInstances.push(periodChart);

    // Region chart
    const regionChart = new window.Chart(regionCanvas.getContext("2d"), {
      type: 'doughnut',
      data: {
        labels: data.regionRows.map(r => r.region),
        datasets: [{
          data: data.regionRows.map(r => r.revenue),
          backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'],
          borderWidth: 2,
          borderColor: isDark ? '#131c2e' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, boxWidth: 12, padding: 10 }
          }
        },
        cutout: '60%'
      }
    });
    chartInstances.push(regionChart);
  }

  updateView();
}


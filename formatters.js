/**
 * Formatting and Display Utilities
 */

export function formatCurrency(amount, symbol = "$") {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getStatusBadge(status) {
  const safeStatus = (status || "").toLowerCase();
  let badgeClass = "badge-pending";

  switch (safeStatus) {
    case "pending":
      badgeClass = "badge-pending";
      break;
    case "processing":
      badgeClass = "badge-processing";
      break;
    case "shipped":
      badgeClass = "badge-shipped";
      break;
    case "delivered":
      badgeClass = "badge-delivered";
      break;
    case "cancelled":
      badgeClass = "badge-cancelled";
      break;
  }

  return `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${escapeHtml(status || "Unknown")}</span>`;
}

export function getPaymentStatusBadge(status) {
  const safe = (status || "").toLowerCase();
  let badgeClass = "badge-unpaid";

  switch (safe) {
    case "paid":
      badgeClass = "badge-paid";
      break;
    case "partial":
      badgeClass = "badge-partial";
      break;
    case "unpaid":
      badgeClass = "badge-unpaid";
      break;
    case "overdue":
      badgeClass = "badge-overdue";
      break;
    case "draft":
      badgeClass = "badge-pending";
      break;
    case "sent":
      badgeClass = "badge-processing";
      break;
  }

  return `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${escapeHtml(status || "Unpaid")}</span>`;
}

export function getStockBadge(stock, reorderLevel = 10) {
  const s = parseInt(stock, 10);
  const r = parseInt(reorderLevel, 10);

  if (s <= 0) {
    return `<span class="badge badge-out-of-stock">Out of Stock (0)</span>`;
  }
  if (s <= r) {
    return `<span class="badge badge-low-stock">Low Stock (${s})</span>`;
  }
  return `<span class="badge badge-in-stock">In Stock (${s})</span>`;
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


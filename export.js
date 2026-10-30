/**
 * Data Export and Print Utilities
 * Generates Excel-compatible CSVs and triggers print-to-PDF views.
 */

export function exportToCsv(filename, headers, rows) {
  if (!rows || !rows.length) {
    throw new Error("No data available to export.");
  }

  const escapeCsvVal = (val) => {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val);
    if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return `"${stringVal}"`;
  };

  const headerLine = headers.map(h => escapeCsvVal(h.label || h)).join(',');
  const rowLines = rows.map(row => {
    return headers.map(h => {
      const key = h.key || h;
      return escapeCsvVal(row[key]);
    }).join(',');
  });

  const csvContent = [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel UTF-8 compatibility
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printCurrentView() {
  window.print();
}


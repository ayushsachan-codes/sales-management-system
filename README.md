# Sales Management System (SMS)

A modern, frontend-only enterprise web application for managing the complete B2B sales lifecycle: order processing, inventory tracking, customer relationships, invoice billing, payment tracking, and analytics dashboards.

Built with **HTML5 semantic markup, CSS3 (Custom Properties, Flexbox, Grid), and modular Vanilla JavaScript (ES6+)** with **localStorage persistence**.

---

## 🚀 Live Demo & Quick Start

### Running Locally
No build tools, bundlers, or server-side runtimes are required! You can run the application directly:

#### Option A: Using any local static server (Recommended for ES6 Modules)
```bash
# Using Python (standard)
python -m http.server 8000

# Using Node.js npx serve
npx serve .

# Or using VS Code Live Server extension
# Right-click 'index.html' -> Open with Live Server
```
Then visit `http://localhost:8000` in Chrome, Edge, Firefox, or Safari.

### 🔑 Demo Sign-In Credentials
The application includes a simulated authentication system with pre-seeded accounts:

| User | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Alex Morgan** *(Default)* | `alex.morgan@company.com` | `password123` | Sales Manager |
| **Sarah Jenkins** | `sarah.j@company.com` | `password123` | Sales Representative |

*Tip: Quick 1-click sign-in buttons for both accounts are available on the login page.*

---

## 📋 PRD Implementation & Requirement Traceability

This project implements **100% of the P0 core requirements and P1 bonus features** specified in the Product Requirements Document (PRD):

### 1. Dashboard (PRD Section 4.1)
- [x] **D-1 (P0)**: KPI cards showing Total Revenue, Total Orders, Pending Orders, and Active Customers with trend indicators.
- [x] **D-2 (P0)**: Order summary cards grouped by status (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- [x] **D-3 (P0)**: Top-selling products ranked by volume (units) and revenue.
- [x] **D-4 (P1)**: Interactive monthly revenue progression line chart and order status distribution doughnut chart (powered by Chart.js with dynamic light/dark theme adaptation).
- [x] **D-5 (P0)**: Recent orders table with direct navigation to order detail views.

### 2. Sales Orders (PRD Section 4.2)
- [x] **O-1 (P0)**: Master table of orders displaying Order #, Customer, Date, Grand Total, Payment Status, and Order Status.
- [x] **O-2 (P0)**: Real-time search by order number or customer name.
- [x] **O-3 (P0)**: Multi-parameter filtering by order status, payment status, and custom date range (start/end); sortable by order date or total.
- [x] **O-4 (P0)**: Inline actions per row (View, Edit, Delete) with modal confirmation. Deleting active orders automatically restores product inventory.
- [x] **O-5 (P0)**: Pagination controls (10 rows per page default with previous/next and direct page jumping).
- [x] **O-6 (P1)**: Export filtered order lists to Excel-compatible CSV.

### 3. Create & Edit Order (PRD Section 4.3)
- [x] **C-1 (P0)**: Select existing customer or create a new customer inline via modal without losing draft order state.
- [x] **C-2 (P0)**: Dynamic line items: product selector, auto-filled unit price, quantity input, and calculated line total.
- [x] **C-3 (P0)**: Live stock validation: quantities must be positive integers and cannot exceed current warehouse inventory.
- [x] **C-4 (P1)**: Live real-time pricing recalculations: Subtotal, Discount (flat `$` or percentage `%`), Tax (customizable rate), and Grand Total.
- [x] **C-5 (P0)**: Captures shipping destination, order date, order notes, payment method, and optional initial deposit.
- [x] **C-6 (P0)**: Auto-generates sequential order numbers (e.g., `SO-1001`, `SO-1012`).

### 4. Order Detail & Workflow (PRD Section 4.4)
- [x] **T-1 (P0)**: Complete order overview: customer contact card, shipping destination, line items breakdown, notes, and financial totals.
- [x] **T-2 (P0)**: Visual step indicator status timeline (`Pending` → `Processing` → `Shipped` → `Delivered`) with strict state machine validation and order cancellation.
- [x] **T-3 (P1)**: Payment tracking: payment method, total paid, running balance due, payment status badge, and "+ Record Payment" modal.
- [x] **T-4 (P0)**: One-click actions: "Edit Order", "Generate Invoice", and "Send Notification" (simulated email toast and activity log entry).

### 5. Invoice Management (PRD Section 4.5)
- [x] **I-1 (P0)**: Generate invoices from orders with unique numbering (e.g., `INV-2026-009`), issue date, and 30-day due date.
- [x] **I-2 (P0)**: Invoice table with search and status filtering (`Draft`, `Sent`, `Paid`, `Overdue`).
- [x] **I-3 (P0)**: Printable invoice sheet complete with corporate header, bill-to customer details, line items table, taxes, discounts, totals, and bank wire remittance instructions.
- [x] **I-4 (P1)**: Mark invoice as paid with date and payment method selection (synchronizes order balance and payment status).
- [x] **I-5 (P1)**: Download/Save invoice as PDF via browser print dialog (`@media print` formatted).

### 6. Customer Management (PRD Section 4.6)
- [x] **U-1 (P0)**: Customer directory with search, filtering by region, and Add/Edit modals (name, email, phone, company, address, region).
- [x] **U-2 (P0)**: Customer Profile view displaying Lifetime Value (LTV), total order count, average order value (AOV), and complete order history.
- [x] **U-3 (P0)**: Deletion safety check: prevents deleting customers with existing orders to protect accounting and invoicing integrity.

### 7. Product & Inventory (PRD Section 4.7)
- [x] **P-1 (P0)**: Product catalog with SKU, name, category, price, stock quantity, and reorder threshold.
- [x] **P-2 (P0)**: Automatic stock adjustment: stock decrements when orders are placed and is automatically returned to inventory when orders are cancelled or deleted.
- [x] **P-3 (P0)**: Visual low-stock alert badges (`stock <= reorderLevel`) and out-of-stock indicators (`stock == 0`).
- [x] **P-4 (P1)**: Filtering by category (Electronics, Furniture, Software, Accessories, Office Supplies) and stock level status.

### 8. Sales Analytics & Reports (PRD Section 4.8)
- [x] **R-1 (P0)**: Revenue reporting grouped by period (Daily, Weekly, Monthly) with custom date-range picker.
- [x] **R-2 (P0)**: Sales by Product and Sales by Region represented as data tables and interactive charts.
- [x] **R-3 (P1)**: One-click export of analysis datasets to Excel-compatible CSV and print/PDF report layouts.

### 9. User Authentication & Profile (PRD Section 4.9)
- [x] **A-1 (P0)**: Simulated registration and login with form validation and session storage.
- [x] **A-2 (P0)**: Protected route guard: unauthenticated users are automatically redirected to `#login`.
- [x] **A-3 (P0)**: Profile view to update name, email, avatar initials, and password.
- [x] **A-4 (P0)**: Sign out action clears session and resets navigation state.

### 10. Cross-cutting Bonus Features (PRD Section 4.10)
- [x] **Dark Mode Toggle**: Persistent preference (`sms_theme`) that respects system `prefers-color-scheme` on first launch; seamless theme switching across all cards, modals, and Chart.js canvases.
- [x] **Simulated Notifications**: Activity drawer and toast alerts triggered when orders are created, status changes, shipments dispatch, or invoices are paid.
- [x] **Configurable Tax Settings**: Global default tax rate configuration under Settings.
- [x] **Payment Tracking**: Multi-payment tracking per order with running balance calculations.
- [x] **One-Click Demo Reset**: "Reset to Initial Sample Data" button to restore clean test datasets anytime.

---

## 🏗️ Architecture & Project Structure

```
sales-management-system/
├── index.html                # SPA Shell (sidebar, topbar, modals, drawer, toasts)
├── css/
│   ├── variables.css         # Design tokens, color palette, dark mode variables
│   ├── base.css              # Reset, typography, tabular numbers, accessibility
│   ├── layout.css            # Sidebar, topbar, responsive containers
│   ├── components.css        # Buttons, cards, tables, badges, modals, timeline, toasts
│   ├── responsive.css        # Breakpoints (640px, 768px, 1024px, 1280px)
│   └── print.css             # Clean invoice & report PDF printing styles
├── js/
│   ├── app.js                # App coordinator, theme manager, global events
│   ├── router.js             # Hash-based SPA router with parameters & auth guard
│   ├── store.js              # State manager & localStorage persistence layer
│   ├── seed-data.js          # Pre-seeded mock dataset (customers, products, orders, invoices)
│   ├── utils/
│   │   ├── formatters.js     # Currency, date, status badges, HTML sanitization
│   │   ├── modal.js          # Modal dialogs & confirmation prompts
│   │   ├── toast.js          # Toast notification alerts
│   │   └── export.js         # CSV generator (UTF-8 BOM) & window.print helper
│   └── pages/
│       ├── auth.js           # Login & Registration views
│       ├── dashboard.js      # KPI metrics, status cards, Chart.js graphs, recent orders
│       ├── orders.js         # Orders table, search, multi-filter, pagination, CSV export
│       ├── order-form.js     # Create / Edit order, inline customer, live calculation
│       ├── order-detail.js   # Order view, status stepper, payment log, email dispatch
│       ├── invoices.js       # Invoices list, filter by status, mark as paid
│       ├── invoice-detail.js # Printable invoice view with corporate headers
│       ├── customers.js      # Customer directory, LTV profile, delete protection
│       ├── products.js       # Inventory catalog, stock levels, low-stock alerts
│       ├── reports.js        # Period/regional/product analytics & charts
│       └── profile.js        # Account settings, tax configuration, sample data reset
└── README.md
```

---

## 🎨 Design System Highlights
- **Palette**: Primary blue (`#2563EB`), crisp white (`#FFFFFF`), slate dark tones (`#0F172A`), light surface backgrounds (`#F4F7FB`).
- **Semantic Status Badges**:
  - `Pending`: Amber (`#F59E0B`)
  - `Processing`: Blue (`#2563EB`)
  - `Shipped`: Indigo (`#6366F1`)
  - `Delivered`: Green (`#10B981`)
  - `Cancelled`: Red (`#EF4444`)
- **Typography & Numerals**: System font stack with `tabular-nums` alignment for financial figures, order counts, and dates.
- **Accessibility**: High contrast ratios (WCAG 2.1 AA), keyboard navigable modals with `Escape` dismiss, focus rings, and screen-reader considerations.
- **Responsive**: Mobile drawer navigation, responsive table containers, and flexible card layouts from 360px mobile screens to 1920px+ desktop displays.

---

## 📄 License
Internal project delivered for frontend web development specifications.


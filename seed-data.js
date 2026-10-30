/**
 * Seed Data for Sales Management System (SMS)
 * Provides realistic initial mock data for users, customers, products, orders, invoices, and payments.
 */

export const INITIAL_SETTINGS = {
  companyName: "Nexus Enterprise Solutions",
  companyAddress: "742 Evergreen Terrace, Suite 500, San Francisco, CA 94107",
  companyEmail: "billing@nexussolutions.io",
  companyPhone: "+1 (555) 382-9100",
  currency: "$",
  defaultTaxRate: 8.5, // 8.5%
};

export const INITIAL_USERS = [
  {
    id: "USR-001",
    name: "Alex Morgan",
    email: "alex.morgan@company.com",
    password: "password123",
    role: "Sales Manager",
    createdAt: "2026-01-15T08:30:00Z",
    avatar: "AM"
  },
  {
    id: "USR-002",
    name: "Sarah Jenkins",
    email: "sarah.j@company.com",
    password: "password123",
    role: "Sales Representative",
    createdAt: "2026-02-01T10:00:00Z",
    avatar: "SJ"
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: "CUST-001",
    name: "Acme Global Dynamics",
    email: "procurement@acmeglobal.com",
    phone: "+1 (555) 234-5678",
    company: "Acme Global Dynamics",
    address: "100 Industrial Parkway, Austin, TX 78701",
    region: "North America",
    createdAt: "2026-01-10T09:00:00Z"
  },
  {
    id: "CUST-002",
    name: "Starlight Media Group",
    email: "accounts@starlightmedia.co.uk",
    phone: "+44 20 7946 0912",
    company: "Starlight Media Group",
    address: "45 Oxford Circus, London, UK W1D 1BS",
    region: "Europe",
    createdAt: "2026-01-18T11:20:00Z"
  },
  {
    id: "CUST-003",
    name: "Zenith Retail Solutions",
    email: "ops@zenithretail.com",
    phone: "+1 (555) 876-5432",
    company: "Zenith Retail Solutions",
    address: "740 Market St, Seattle, WA 98101",
    region: "North America",
    createdAt: "2026-02-05T14:15:00Z"
  },
  {
    id: "CUST-004",
    name: "Pacifica Logistics Ltd",
    email: "supply@pacificalogistics.sg",
    phone: "+65 6789 0123",
    company: "Pacifica Logistics Ltd",
    address: "12 Marina Boulevard, Tower 3, Singapore 018982",
    region: "Asia Pacific",
    createdAt: "2026-02-12T16:45:00Z"
  },
  {
    id: "CUST-005",
    name: "Solaris Clean Energy",
    email: "finance@solarisenergy.de",
    phone: "+49 30 123456",
    company: "Solaris Clean Energy",
    address: "Friedrichstraße 150, 10117 Berlin, Germany",
    region: "Europe",
    createdAt: "2026-02-28T09:30:00Z"
  },
  {
    id: "CUST-006",
    name: "Horizon BioSciences",
    email: "contact@horizonbio.org",
    phone: "+1 (555) 432-1098",
    company: "Horizon BioSciences",
    address: "350 Kendall Square, Cambridge, MA 02142",
    region: "North America",
    createdAt: "2026-03-05T13:10:00Z"
  },
  {
    id: "CUST-007",
    name: "Apex Financial Partners",
    email: "admin@apexfinancial.com",
    phone: "+1 (555) 654-3210",
    company: "Apex Financial Partners",
    address: "200 Wall Street, 24th Floor, New York, NY 10005",
    region: "North America",
    createdAt: "2026-03-14T10:00:00Z"
  },
  {
    id: "CUST-008",
    name: "Kyoto Robotics Inc",
    email: "purchase@kyotorobotics.jp",
    phone: "+81 3 5555 0143",
    company: "Kyoto Robotics Inc",
    address: "Minato-ku, Roppongi 6-10-1, Tokyo, Japan",
    region: "Asia Pacific",
    createdAt: "2026-03-22T08:00:00Z"
  },
  {
    id: "CUST-009",
    name: "Vanguard Tech Labs",
    email: "info@vanguardlabs.com.au",
    phone: "+61 2 9876 5432",
    company: "Vanguard Tech Labs",
    address: "100 George St, Sydney, NSW 2000, Australia",
    region: "Asia Pacific",
    createdAt: "2026-04-02T11:40:00Z"
  },
  {
    id: "CUST-010",
    name: "Rio Inovação Digital",
    email: "compras@rioinovacao.br",
    phone: "+55 21 9876-5432",
    company: "Rio Inovação Digital",
    address: "Av. Rio Branco 156, Rio de Janeiro, Brazil",
    region: "Latin America",
    createdAt: "2026-04-10T15:20:00Z"
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "PROD-001",
    sku: "ELEC-1001",
    name: "ProBook Ultra 15 Laptop (Intel i9, 32GB)",
    category: "Electronics",
    price: 1899.00,
    stock: 42,
    reorderLevel: 15,
    active: true
  },
  {
    id: "PROD-002",
    sku: "ELEC-1002",
    name: "UltraView 34-inch Curved 4K Monitor",
    category: "Electronics",
    price: 749.50,
    stock: 28,
    reorderLevel: 10,
    active: true
  },
  {
    id: "PROD-003",
    sku: "ELEC-1003",
    name: "Thunderbolt 4 Multi-Port Docking Station",
    category: "Electronics",
    price: 229.00,
    stock: 65,
    reorderLevel: 20,
    active: true
  },
  {
    id: "PROD-004",
    sku: "FURN-2001",
    name: "ErgoFlow High-Back Executive Mesh Chair",
    category: "Furniture",
    price: 520.00,
    stock: 18,
    reorderLevel: 8,
    active: true
  },
  {
    id: "PROD-005",
    sku: "FURN-2002",
    name: "AeroDesk Dual-Motor Standing Desk (60x30)",
    category: "Furniture",
    price: 680.00,
    stock: 9, // low stock!
    reorderLevel: 10,
    active: true
  },
  {
    id: "PROD-006",
    sku: "FURN-2003",
    name: "Acoustic Privacy Panel Partition (Set of 2)",
    category: "Furniture",
    price: 290.00,
    stock: 0, // out of stock!
    reorderLevel: 5,
    active: true
  },
  {
    id: "PROD-007",
    sku: "SOFT-3001",
    name: "CloudShield Enterprise Security Suite (Annual)",
    category: "Software",
    price: 1200.00,
    stock: 999, // digital
    reorderLevel: 10,
    active: true
  },
  {
    id: "PROD-008",
    sku: "SOFT-3002",
    name: "DataPulse Analytics & BI Platform (User Seat)",
    category: "Software",
    price: 450.00,
    stock: 999,
    reorderLevel: 10,
    active: true
  },
  {
    id: "PROD-009",
    sku: "ACCS-4001",
    name: "Noise-Cancelling Wireless Conference Headset",
    category: "Accessories",
    price: 179.99,
    stock: 85,
    reorderLevel: 25,
    active: true
  },
  {
    id: "PROD-010",
    sku: "ACCS-4002",
    name: "4K AI Autofocus Conference Webcam",
    category: "Accessories",
    price: 149.00,
    stock: 40,
    reorderLevel: 15,
    active: true
  },
  {
    id: "PROD-011",
    sku: "OFFC-5001",
    name: "Heavy-Duty Cross-Cut Office Shredder",
    category: "Office Supplies",
    price: 260.00,
    stock: 12,
    reorderLevel: 5,
    active: true
  },
  {
    id: "PROD-012",
    sku: "OFFC-5002",
    name: "Smart Whiteboard & Digital Marker Kit",
    category: "Office Supplies",
    price: 890.00,
    stock: 4, // low stock!
    reorderLevel: 6,
    active: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-1001",
    orderNo: "SO-1001",
    customerId: "CUST-001",
    date: "2026-08-14",
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    notes: "Deliver to dock 3, attention Mark.",
    shippingAddress: "100 Industrial Parkway, Austin, TX 78701",
    taxRate: 8.5,
    discount: 100,
    discountType: "flat",
    items: [
      { productId: "PROD-001", name: "ProBook Ultra 15 Laptop (Intel i9, 32GB)", qty: 3, unitPrice: 1899.00, lineTotal: 5697.00 },
      { productId: "PROD-003", name: "Thunderbolt 4 Multi-Port Docking Station", qty: 3, unitPrice: 229.00, lineTotal: 687.00 }
    ],
    subtotal: 6384.00,
    tax: 534.14,
    grandTotal: 6818.14,
    amountPaid: 6818.14,
    balanceDue: 0.00
  },
  {
    id: "ORD-1002",
    orderNo: "SO-1002",
    customerId: "CUST-002",
    date: "2026-08-22",
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    notes: "Priority air dispatch requested.",
    shippingAddress: "45 Oxford Circus, London, UK W1D 1BS",
    taxRate: 8.5,
    discount: 5,
    discountType: "percent", // 5%
    items: [
      { productId: "PROD-002", name: "UltraView 34-inch Curved 4K Monitor", qty: 4, unitPrice: 749.50, lineTotal: 2998.00 },
      { productId: "PROD-009", name: "Noise-Cancelling Wireless Conference Headset", qty: 6, unitPrice: 179.99, lineTotal: 1079.94 }
    ],
    subtotal: 4077.94,
    tax: 329.29,
    grandTotal: 4203.33,
    amountPaid: 4203.33,
    balanceDue: 0.00
  },
  {
    id: "ORD-1003",
    orderNo: "SO-1003",
    customerId: "CUST-003",
    date: "2026-09-02",
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    notes: "Assembly requested on arrival.",
    shippingAddress: "740 Market St, Seattle, WA 98101",
    taxRate: 8.5,
    discount: 0,
    discountType: "flat",
    items: [
      { productId: "PROD-004", name: "ErgoFlow High-Back Executive Mesh Chair", qty: 5, unitPrice: 520.00, lineTotal: 2600.00 },
      { productId: "PROD-005", name: "AeroDesk Dual-Motor Standing Desk (60x30)", qty: 5, unitPrice: 680.00, lineTotal: 3400.00 }
    ],
    subtotal: 6000.00,
    tax: 510.00,
    grandTotal: 6510.00,
    amountPaid: 6510.00,
    balanceDue: 0.00
  },
  {
    id: "ORD-1004",
    orderNo: "SO-1004",
    customerId: "CUST-004",
    date: "2026-09-11",
    status: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    notes: "Ocean cargo consignment #SG-882",
    shippingAddress: "12 Marina Boulevard, Tower 3, Singapore 018982",
    taxRate: 8.5,
    discount: 250,
    discountType: "flat",
    items: [
      { productId: "PROD-001", name: "ProBook Ultra 15 Laptop (Intel i9, 32GB)", qty: 5, unitPrice: 1899.00, lineTotal: 9495.00 },
      { productId: "PROD-007", name: "CloudShield Enterprise Security Suite (Annual)", qty: 2, unitPrice: 1200.00, lineTotal: 2400.00 }
    ],
    subtotal: 11895.00,
    tax: 989.83,
    grandTotal: 12634.83,
    amountPaid: 12634.83,
    balanceDue: 0.00
  },
  {
    id: "ORD-1005",
    orderNo: "SO-1005",
    customerId: "CUST-005",
    date: "2026-09-18",
    status: "Shipped",
    paymentStatus: "Partial",
    paymentMethod: "Bank Transfer",
    notes: "50% advance received, balance net 30.",
    shippingAddress: "Friedrichstraße 150, 10117 Berlin, Germany",
    taxRate: 8.5,
    discount: 0,
    discountType: "flat",
    items: [
      { productId: "PROD-008", name: "DataPulse Analytics & BI Platform (User Seat)", qty: 10, unitPrice: 450.00, lineTotal: 4500.00 },
      { productId: "PROD-010", name: "4K AI Autofocus Conference Webcam", qty: 4, unitPrice: 149.00, lineTotal: 596.00 }
    ],
    subtotal: 5096.00,
    tax: 433.16,
    grandTotal: 5529.16,
    amountPaid: 2764.58,
    balanceDue: 2764.58
  },
  {
    id: "ORD-1006",
    orderNo: "SO-1006",
    customerId: "CUST-006",
    date: "2026-09-29",
    status: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    notes: "Rush order for laboratory setup.",
    shippingAddress: "350 Kendall Square, Cambridge, MA 02142",
    taxRate: 8.5,
    discount: 50,
    discountType: "flat",
    items: [
      { productId: "PROD-002", name: "UltraView 34-inch Curved 4K Monitor", qty: 2, unitPrice: 749.50, lineTotal: 1499.00 },
      { productId: "PROD-003", name: "Thunderbolt 4 Multi-Port Docking Station", qty: 2, unitPrice: 229.00, lineTotal: 458.00 },
      { productId: "PROD-010", name: "4K AI Autofocus Conference Webcam", qty: 2, unitPrice: 149.00, lineTotal: 298.00 }
    ],
    subtotal: 2255.00,
    tax: 187.43,
    grandTotal: 2392.43,
    amountPaid: 2392.43,
    balanceDue: 0.00
  },
  {
    id: "ORD-1007",
    orderNo: "SO-1007",
    customerId: "CUST-007",
    date: "2026-10-05",
    status: "Processing",
    paymentStatus: "Unpaid",
    paymentMethod: "Purchase Order",
    notes: "PO #APEX-2026-991 attached.",
    shippingAddress: "200 Wall Street, 24th Floor, New York, NY 10005",
    taxRate: 8.5,
    discount: 10,
    discountType: "percent",
    items: [
      { productId: "PROD-001", name: "ProBook Ultra 15 Laptop (Intel i9, 32GB)", qty: 6, unitPrice: 1899.00, lineTotal: 11394.00 },
      { productId: "PROD-012", name: "Smart Whiteboard & Digital Marker Kit", qty: 2, unitPrice: 890.00, lineTotal: 1780.00 }
    ],
    subtotal: 13174.00,
    tax: 1007.81,
    grandTotal: 12864.41,
    amountPaid: 0.00,
    balanceDue: 12864.41
  },
  {
    id: "ORD-1008",
    orderNo: "SO-1008",
    customerId: "CUST-008",
    date: "2026-10-14",
    status: "Pending",
    paymentStatus: "Unpaid",
    paymentMethod: "Bank Transfer",
    notes: "Awaiting customs documentation review.",
    shippingAddress: "Minato-ku, Roppongi 6-10-1, Tokyo, Japan",
    taxRate: 8.5,
    discount: 0,
    discountType: "flat",
    items: [
      { productId: "PROD-007", name: "CloudShield Enterprise Security Suite (Annual)", qty: 5, unitPrice: 1200.00, lineTotal: 6000.00 },
      { productId: "PROD-008", name: "DataPulse Analytics & BI Platform (User Seat)", qty: 15, unitPrice: 450.00, lineTotal: 6750.00 }
    ],
    subtotal: 12750.00,
    tax: 1083.75,
    grandTotal: 13833.75,
    amountPaid: 0.00,
    balanceDue: 13833.75
  },
  {
    id: "ORD-1009",
    orderNo: "SO-1009",
    customerId: "CUST-009",
    date: "2026-10-20",
    status: "Pending",
    paymentStatus: "Partial",
    paymentMethod: "Credit Card",
    notes: "Split payment requested by client.",
    shippingAddress: "100 George St, Sydney, NSW 2000, Australia",
    taxRate: 8.5,
    discount: 100,
    discountType: "flat",
    items: [
      { productId: "PROD-004", name: "ErgoFlow High-Back Executive Mesh Chair", qty: 4, unitPrice: 520.00, lineTotal: 2080.00 },
      { productId: "PROD-009", name: "Noise-Cancelling Wireless Conference Headset", qty: 4, unitPrice: 179.99, lineTotal: 719.96 }
    ],
    subtotal: 2799.96,
    tax: 229.50,
    grandTotal: 2929.46,
    amountPaid: 1500.00,
    balanceDue: 1429.46
  },
  {
    id: "ORD-1010",
    orderNo: "SO-1010",
    customerId: "CUST-010",
    date: "2026-10-24",
    status: "Cancelled",
    paymentStatus: "Unpaid",
    paymentMethod: "Purchase Order",
    notes: "Order cancelled by client prior to dispatch. Stock restored.",
    shippingAddress: "Av. Rio Branco 156, Rio de Janeiro, Brazil",
    taxRate: 8.5,
    discount: 0,
    discountType: "flat",
    items: [
      { productId: "PROD-011", name: "Heavy-Duty Cross-Cut Office Shredder", qty: 2, unitPrice: 260.00, lineTotal: 520.00 }
    ],
    subtotal: 520.00,
    tax: 44.20,
    grandTotal: 564.20,
    amountPaid: 0.00,
    balanceDue: 564.20
  },
  {
    id: "ORD-1011",
    orderNo: "SO-1011",
    customerId: "CUST-001",
    date: "2026-10-28",
    status: "Pending",
    paymentStatus: "Unpaid",
    paymentMethod: "Bank Transfer",
    notes: "Q4 expansion hardware bundle.",
    shippingAddress: "100 Industrial Parkway, Austin, TX 78701",
    taxRate: 8.5,
    discount: 5,
    discountType: "percent",
    items: [
      { productId: "PROD-001", name: "ProBook Ultra 15 Laptop (Intel i9, 32GB)", qty: 2, unitPrice: 1899.00, lineTotal: 3798.00 },
      { productId: "PROD-002", name: "UltraView 34-inch Curved 4K Monitor", qty: 2, unitPrice: 749.50, lineTotal: 1499.00 }
    ],
    subtotal: 5297.00,
    tax: 427.73,
    grandTotal: 5459.88,
    amountPaid: 0.00,
    balanceDue: 5459.88
  }
];

export const INITIAL_INVOICES = [
  {
    id: "INV-1001",
    invoiceNo: "INV-2026-001",
    orderId: "ORD-1001",
    issueDate: "2026-08-14",
    dueDate: "2026-09-14",
    status: "Paid",
    total: 6818.14
  },
  {
    id: "INV-1002",
    invoiceNo: "INV-2026-002",
    orderId: "ORD-1002",
    issueDate: "2026-08-22",
    dueDate: "2026-09-22",
    status: "Paid",
    total: 4203.33
  },
  {
    id: "INV-1003",
    invoiceNo: "INV-2026-003",
    orderId: "ORD-1003",
    issueDate: "2026-09-02",
    dueDate: "2026-10-02",
    status: "Paid",
    total: 6510.00
  },
  {
    id: "INV-1004",
    invoiceNo: "INV-2026-004",
    orderId: "ORD-1004",
    issueDate: "2026-09-11",
    dueDate: "2026-10-11",
    status: "Paid",
    total: 12634.83
  },
  {
    id: "INV-1005",
    invoiceNo: "INV-2026-005",
    orderId: "ORD-1005",
    issueDate: "2026-09-18",
    dueDate: "2026-10-18",
    status: "Overdue",
    total: 5529.16
  },
  {
    id: "INV-1006",
    invoiceNo: "INV-2026-006",
    orderId: "ORD-1006",
    issueDate: "2026-09-29",
    dueDate: "2026-10-29",
    status: "Paid",
    total: 2392.43
  },
  {
    id: "INV-1007",
    invoiceNo: "INV-2026-007",
    orderId: "ORD-1007",
    issueDate: "2026-10-05",
    dueDate: "2026-11-05",
    status: "Sent",
    total: 12864.41
  },
  {
    id: "INV-1008",
    invoiceNo: "INV-2026-008",
    orderId: "ORD-1008",
    issueDate: "2026-10-14",
    dueDate: "2026-11-14",
    status: "Draft",
    total: 13833.75
  }
];

export const INITIAL_PAYMENTS = [
  { id: "PAY-001", orderId: "ORD-1001", amount: 6818.14, method: "Bank Transfer", date: "2026-08-16" },
  { id: "PAY-002", orderId: "ORD-1002", amount: 4203.33, method: "Credit Card", date: "2026-08-22" },
  { id: "PAY-003", orderId: "ORD-1003", amount: 6510.00, method: "Bank Transfer", date: "2026-09-04" },
  { id: "PAY-004", orderId: "ORD-1004", amount: 12634.83, method: "Bank Transfer", date: "2026-09-12" },
  { id: "PAY-005", orderId: "ORD-1005", amount: 2764.58, method: "Bank Transfer", date: "2026-09-20" },
  { id: "PAY-006", orderId: "ORD-1006", amount: 2392.43, method: "Credit Card", date: "2026-09-29" },
  { id: "PAY-007", orderId: "ORD-1009", amount: 1500.00, method: "Credit Card", date: "2026-10-21" }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-001",
    title: "Order SO-1011 Created",
    message: "New order created for Acme Global Dynamics ($5,459.88)",
    type: "order",
    date: "2026-10-28T14:32:00Z",
    read: false
  },
  {
    id: "NOTIF-002",
    title: "Low Stock Alert",
    message: "AeroDesk Dual-Motor Standing Desk is below reorder level (9 remaining)",
    type: "system",
    date: "2026-10-27T10:15:00Z",
    read: false
  },
  {
    id: "NOTIF-003",
    title: "Payment Received",
    message: "Payment of $1,500.00 recorded for order SO-1009",
    type: "payment",
    date: "2026-10-21T09:20:00Z",
    read: true
  },
  {
    id: "NOTIF-004",
    title: "Order SO-1004 Shipped",
    message: "Order dispatched to Pacifica Logistics Ltd via air freight",
    type: "shipping",
    date: "2026-09-12T16:00:00Z",
    read: true
  }
];


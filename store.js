/**
 * Central State Store & Persistence Layer (SMS)
 * Manages all reactive data for the Sales Management System with LocalStorage persistence.
 */

import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS
} from './seed-data.js';

const STORAGE_KEYS = {
  SETTINGS: 'sms_settings',
  USERS: 'sms_users',
  SESSION: 'sms_session',
  CUSTOMERS: 'sms_customers',
  PRODUCTS: 'sms_products',
  ORDERS: 'sms_orders',
  INVOICES: 'sms_invoices',
  PAYMENTS: 'sms_payments',
  NOTIFICATIONS: 'sms_notifications',
  THEME: 'sms_theme'
};

class Store {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    try {
      this.settings = this.load(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      this.users = this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
      this.currentUser = this.load(STORAGE_KEYS.SESSION, this.users[0]); // default logged in with Alex Morgan for demo convenience
      this.customers = this.load(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      this.products = this.load(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      this.orders = this.load(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      this.invoices = this.load(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
      this.payments = this.load(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
      this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    } catch (e) {
      console.warn("Storage initialization fallback to seed data:", e);
      this.resetToSampleData();
    }
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to persist ${key} in localStorage:`, e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  resetToSampleData() {
    this.settings = JSON.parse(JSON.stringify(INITIAL_SETTINGS));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.currentUser = this.users[0];
    this.customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.invoices = JSON.parse(JSON.stringify(INITIAL_INVOICES));
    this.payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));

    this.save(STORAGE_KEYS.SETTINGS, this.settings);
    this.save(STORAGE_KEYS.USERS, this.users);
    this.save(STORAGE_KEYS.SESSION, this.currentUser);
    this.save(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.save(STORAGE_KEYS.INVOICES, this.invoices);
    this.save(STORAGE_KEYS.PAYMENTS, this.payments);
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
  }

  // --- Auth & Users ---
  getCurrentUser() {
    return this.currentUser;
  }

  login(email, password) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      throw new Error("Invalid email or password.");
    }
    this.currentUser = { ...user };
    this.save(STORAGE_KEYS.SESSION, this.currentUser);
    this.notify();
    return this.currentUser;
  }

  register(userData) {
    const exists = this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      throw new Error("A user with this email already exists.");
    }
    const initials = userData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "Sales Representative",
      createdAt: new Date().toISOString(),
      avatar: initials || "U"
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.save(STORAGE_KEYS.USERS, this.users);
    this.save(STORAGE_KEYS.SESSION, this.currentUser);
    this.notify();
    return newUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.notify();
  }

  updateProfile(profileData) {
    if (!this.currentUser) return;
    const index = this.users.findIndex(u => u.id === this.currentUser.id);
    if (index !== -1) {
      const initials = profileData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      this.users[index] = {
        ...this.users[index],
        name: profileData.name || this.users[index].name,
        email: profileData.email || this.users[index].email,
        avatar: initials || this.users[index].avatar
      };
      if (profileData.password) {
        this.users[index].password = profileData.password;
      }
      this.currentUser = { ...this.users[index] };
      this.save(STORAGE_KEYS.USERS, this.users);
      this.save(STORAGE_KEYS.SESSION, this.currentUser);
      this.notify();
    }
  }

  // --- Settings ---
  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.save(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
  }

  // --- Customers ---
  getCustomers() {
    return [...this.customers];
  }

  getCustomerById(id) {
    return this.customers.find(c => c.id === id);
  }

  addCustomer(customerData) {
    const id = `CUST-${(this.customers.length + 1).toString().padStart(3, '0')}`;
    const newCustomer = {
      id,
      name: customerData.name.trim(),
      company: customerData.company ? customerData.company.trim() : customerData.name.trim(),
      email: customerData.email.trim(),
      phone: customerData.phone ? customerData.phone.trim() : "",
      address: customerData.address ? customerData.address.trim() : "",
      region: customerData.region || "North America",
      createdAt: new Date().toISOString()
    };
    this.customers.unshift(newCustomer);
    this.save(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
    return newCustomer;
  }

  updateCustomer(id, customerData) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Customer not found.");
    this.customers[index] = {
      ...this.customers[index],
      ...customerData
    };
    this.save(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
    return this.customers[index];
  }

  deleteCustomer(id) {
    const hasOrders = this.orders.some(o => o.customerId === id);
    if (hasOrders) {
      throw new Error("Cannot delete customer with existing orders. Archive or remove their orders first.");
    }
    this.customers = this.customers.filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
  }

  getCustomerStats(id) {
    const customerOrders = this.orders.filter(o => o.customerId === id && o.status !== "Cancelled");
    const totalSpent = customerOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const orderCount = customerOrders.length;
    const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
    return {
      orderCount,
      totalSpent,
      avgOrderValue,
      orders: this.orders.filter(o => o.customerId === id)
    };
  }

  // --- Products & Inventory ---
  getProducts() {
    return [...this.products];
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  addProduct(productData) {
    const id = `PROD-${(this.products.length + 1).toString().padStart(3, '0')}`;
    const newProduct = {
      id,
      sku: productData.sku.toUpperCase().trim(),
      name: productData.name.trim(),
      category: productData.category || "General",
      price: Number(productData.price) || 0,
      stock: parseInt(productData.stock, 10) || 0,
      reorderLevel: parseInt(productData.reorderLevel, 10) || 10,
      active: productData.active !== undefined ? productData.active : true
    };
    this.products.push(newProduct);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    return newProduct;
  }

  updateProduct(id, productData) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found.");
    this.products[index] = {
      ...this.products[index],
      ...productData,
      price: Number(productData.price !== undefined ? productData.price : this.products[index].price),
      stock: parseInt(productData.stock !== undefined ? productData.stock : this.products[index].stock, 10),
      reorderLevel: parseInt(productData.reorderLevel !== undefined ? productData.reorderLevel : this.products[index].reorderLevel, 10)
    };
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    return this.products[index];
  }

  deleteProduct(id) {
    const isUsedInOrders = this.orders.some(o => o.items && o.items.some(i => i.productId === id));
    if (isUsedInOrders) {
      throw new Error("Cannot delete product used in existing orders. Consider deactivating it instead.");
    }
    this.products = this.products.filter(p => p.id !== id);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
  }

  adjustStock(productId, delta) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock + delta);
      this.save(STORAGE_KEYS.PRODUCTS, this.products);
    }
  }

  // --- Orders ---
  getOrders() {
    return [...this.orders];
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id);
  }

  generateOrderNumber() {
    const maxNum = this.orders.reduce((max, o) => {
      const match = o.orderNo && o.orderNo.match(/SO-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);
    return `SO-${maxNum + 1}`;
  }

  createOrder(orderData) {
    // Validate stock for all items
    for (const item of orderData.items) {
      const prod = this.getProductById(item.productId);
      if (!prod) {
        throw new Error(`Product not found: ${item.name || item.productId}`);
      }
      if (prod.stock < item.qty) {
        throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.qty}`);
      }
    }

    // Decrement stock for all items
    for (const item of orderData.items) {
      this.adjustStock(item.productId, -item.qty);
    }

    const nextId = `ORD-${Date.now().toString().slice(-6)}`;
    const orderNo = orderData.orderNo || this.generateOrderNumber();

    const subtotal = orderData.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const discountVal = orderData.discountType === 'percent'
      ? (subtotal * (Number(orderData.discount) || 0) / 100)
      : (Number(orderData.discount) || 0);
    const taxableAmount = Math.max(0, subtotal - discountVal);
    const taxVal = taxableAmount * ((Number(orderData.taxRate) || 0) / 100);
    const grandTotal = Number((taxableAmount + taxVal).toFixed(2));

    const initialPaid = Number(orderData.amountPaid) || 0;
    const balanceDue = Number((grandTotal - initialPaid).toFixed(2));
    let paymentStatus = "Unpaid";
    if (initialPaid >= grandTotal && grandTotal > 0) {
      paymentStatus = "Paid";
    } else if (initialPaid > 0) {
      paymentStatus = "Partial";
    }

    const newOrder = {
      id: nextId,
      orderNo,
      customerId: orderData.customerId,
      date: orderData.date || new Date().toISOString().split('T')[0],
      status: "Pending",
      paymentStatus,
      paymentMethod: orderData.paymentMethod || "Credit Card",
      discount: Number(orderData.discount) || 0,
      discountType: orderData.discountType || "flat",
      taxRate: Number(orderData.taxRate !== undefined ? orderData.taxRate : this.settings.defaultTaxRate),
      notes: orderData.notes || "",
      shippingAddress: orderData.shippingAddress || "",
      items: orderData.items.map(item => ({
        productId: item.productId,
        name: item.name,
        qty: parseInt(item.qty, 10),
        unitPrice: Number(item.unitPrice),
        lineTotal: Number((item.qty * item.unitPrice).toFixed(2))
      })),
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(taxVal.toFixed(2)),
      grandTotal,
      amountPaid: initialPaid,
      balanceDue: balanceDue > 0 ? balanceDue : 0
    };

    this.orders.unshift(newOrder);
    this.save(STORAGE_KEYS.ORDERS, this.orders);

    // If initial payment was made, log payment record
    if (initialPaid > 0) {
      this.payments.push({
        id: `PAY-${Date.now().toString().slice(-5)}`,
        orderId: newOrder.id,
        amount: initialPaid,
        method: newOrder.paymentMethod,
        date: newOrder.date
      });
      this.save(STORAGE_KEYS.PAYMENTS, this.payments);
    }

    const customer = this.getCustomerById(newOrder.customerId);
    const customerName = customer ? customer.name : "Customer";
    this.addNotification(
      `Order ${newOrder.orderNo} Created`,
      `New order created for ${customerName} ($${newOrder.grandTotal.toFixed(2)})`,
      "order"
    );

    this.notify();
    return newOrder;
  }

  updateOrder(id, orderData) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Order not found.");
    const oldOrder = this.orders[index];

    // Restore previous items stock if old order was not cancelled
    if (oldOrder.status !== "Cancelled") {
      for (const oldItem of oldOrder.items) {
        this.adjustStock(oldItem.productId, oldItem.qty);
      }
    }

    // Check stock for new items
    if (orderData.status !== "Cancelled") {
      for (const item of orderData.items) {
        const prod = this.getProductById(item.productId);
        if (!prod || prod.stock < item.qty) {
          // Re-deduct old stock to rollback state
          if (oldOrder.status !== "Cancelled") {
            for (const oldItem of oldOrder.items) {
              this.adjustStock(oldItem.productId, -oldItem.qty);
            }
          }
          throw new Error(`Insufficient stock for "${item.name}". Available: ${prod ? prod.stock : 0}`);
        }
      }

      // Deduct new items stock
      for (const item of orderData.items) {
        this.adjustStock(item.productId, -item.qty);
      }
    }

    const subtotal = orderData.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const discountVal = orderData.discountType === 'percent'
      ? (subtotal * (Number(orderData.discount) || 0) / 100)
      : (Number(orderData.discount) || 0);
    const taxableAmount = Math.max(0, subtotal - discountVal);
    const taxVal = taxableAmount * ((Number(orderData.taxRate) || 0) / 100);
    const grandTotal = Number((taxableAmount + taxVal).toFixed(2));

    const currentPayments = this.payments.filter(p => p.orderId === id).reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = Number((grandTotal - currentPayments).toFixed(2));

    let paymentStatus = "Unpaid";
    if (currentPayments >= grandTotal && grandTotal > 0) {
      paymentStatus = "Paid";
    } else if (currentPayments > 0) {
      paymentStatus = "Partial";
    }

    this.orders[index] = {
      ...oldOrder,
      customerId: orderData.customerId,
      date: orderData.date,
      paymentMethod: orderData.paymentMethod,
      discount: Number(orderData.discount) || 0,
      discountType: orderData.discountType || "flat",
      taxRate: Number(orderData.taxRate),
      notes: orderData.notes,
      shippingAddress: orderData.shippingAddress,
      items: orderData.items.map(item => ({
        productId: item.productId,
        name: item.name,
        qty: parseInt(item.qty, 10),
        unitPrice: Number(item.unitPrice),
        lineTotal: Number((item.qty * item.unitPrice).toFixed(2))
      })),
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(taxVal.toFixed(2)),
      grandTotal,
      amountPaid: currentPayments,
      balanceDue: balanceDue > 0 ? balanceDue : 0,
      paymentStatus
    };

    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
    return this.orders[index];
  }

  updateOrderStatus(id, newStatus) {
    const order = this.getOrderById(id);
    if (!order) throw new Error("Order not found.");

    const allowedTransitions = {
      Pending: ["Processing", "Cancelled"],
      Processing: ["Shipped", "Cancelled"],
      Shipped: ["Delivered"],
      Delivered: [],
      Cancelled: []
    };

    if (!allowedTransitions[order.status].includes(newStatus)) {
      throw new Error(`Cannot transition order from ${order.status} to ${newStatus}.`);
    }

    // If cancelled, restore stock!
    if (newStatus === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.items) {
        this.adjustStock(item.productId, item.qty);
      }
      this.addNotification(
        `Order ${order.orderNo} Cancelled`,
        `Order cancelled and inventory stock was restored.`,
        "system"
      );
    } else if (newStatus === "Shipped") {
      this.addNotification(
        `Order ${order.orderNo} Shipped`,
        `Order has been marked as shipped. Tracking dispatched.`,
        "shipping"
      );
    } else if (newStatus === "Delivered") {
      this.addNotification(
        `Order ${order.orderNo} Delivered`,
        `Order successfully delivered to customer.`,
        "order"
      );
    }

    order.status = newStatus;
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
    return order;
  }

  deleteOrder(id) {
    const order = this.getOrderById(id);
    if (!order) throw new Error("Order not found.");

    // If order was active (not cancelled), restore stock
    if (order.status !== "Cancelled") {
      for (const item of order.items) {
        this.adjustStock(item.productId, item.qty);
      }
    }

    this.orders = this.orders.filter(o => o.id !== id);
    this.invoices = this.invoices.filter(i => i.orderId !== id);
    this.payments = this.payments.filter(p => p.orderId !== id);

    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.save(STORAGE_KEYS.INVOICES, this.invoices);
    this.save(STORAGE_KEYS.PAYMENTS, this.payments);
    this.notify();
  }

  // --- Invoices ---
  getInvoices() {
    return [...this.invoices];
  }

  getInvoiceById(id) {
    return this.invoices.find(i => i.id === id);
  }

  getInvoiceByOrderId(orderId) {
    return this.invoices.find(i => i.orderId === orderId);
  }

  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const count = this.invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(3, '0')}`;
  }

  createInvoiceFromOrder(orderId, dueDate = null) {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error("Order not found.");

    const existing = this.getInvoiceByOrderId(orderId);
    if (existing) return existing;

    const issueDate = new Date().toISOString().split('T')[0];
    const due = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const status = order.paymentStatus === 'Paid' ? 'Paid' : 'Sent';

    const newInvoice = {
      id: `INV-${Date.now().toString().slice(-5)}`,
      invoiceNo: this.generateInvoiceNumber(),
      orderId: order.id,
      issueDate,
      dueDate: due,
      status,
      total: order.grandTotal
    };

    this.invoices.unshift(newInvoice);
    this.save(STORAGE_KEYS.INVOICES, this.invoices);

    this.addNotification(
      `Invoice ${newInvoice.invoiceNo} Generated`,
      `Invoice created for Order ${order.orderNo} ($${newInvoice.total.toFixed(2)})`,
      "order"
    );

    this.notify();
    return newInvoice;
  }

  markInvoiceAsPaid(invoiceId, paymentMethod = "Bank Transfer", paymentDate = null) {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) throw new Error("Invoice not found.");

    invoice.status = "Paid";
    this.save(STORAGE_KEYS.INVOICES, this.invoices);

    const order = this.getOrderById(invoice.orderId);
    if (order) {
      const remaining = order.balanceDue;
      if (remaining > 0) {
        this.addPayment({
          orderId: order.id,
          amount: remaining,
          method: paymentMethod,
          date: paymentDate || new Date().toISOString().split('T')[0]
        });
      }
    }

    this.addNotification(
      `Invoice ${invoice.invoiceNo} Paid`,
      `Payment of $${invoice.total.toFixed(2)} recorded.`,
      "payment"
    );

    this.notify();
    return invoice;
  }

  // --- Payments ---
  getPayments(orderId = null) {
    if (orderId) {
      return this.payments.filter(p => p.orderId === orderId);
    }
    return [...this.payments];
  }

  addPayment({ orderId, amount, method, date }) {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error("Order not found.");

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new Error("Payment amount must be greater than 0.");
    }

    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-5)}`,
      orderId,
      amount: payAmount,
      method: method || "Bank Transfer",
      date: date || new Date().toISOString().split('T')[0]
    };

    this.payments.push(newPayment);
    this.save(STORAGE_KEYS.PAYMENTS, this.payments);

    // Recalculate order payment totals
    const totalPaid = this.payments
      .filter(p => p.orderId === orderId)
      .reduce((sum, p) => sum + p.amount, 0);

    order.amountPaid = Number(totalPaid.toFixed(2));
    const balance = Number((order.grandTotal - totalPaid).toFixed(2));
    order.balanceDue = balance > 0 ? balance : 0;

    if (order.amountPaid >= order.grandTotal) {
      order.paymentStatus = "Paid";
    } else if (order.amountPaid > 0) {
      order.paymentStatus = "Partial";
    } else {
      order.paymentStatus = "Unpaid";
    }

    // If an invoice exists for this order and is now fully paid, update it
    const invoice = this.getInvoiceByOrderId(orderId);
    if (invoice && order.paymentStatus === "Paid") {
      invoice.status = "Paid";
      this.save(STORAGE_KEYS.INVOICES, this.invoices);
    }

    this.save(STORAGE_KEYS.ORDERS, this.orders);

    this.addNotification(
      `Payment Recorded`,
      `Payment of $${payAmount.toFixed(2)} recorded for Order ${order.orderNo}.`,
      "payment"
    );

    this.notify();
    return newPayment;
  }

  // --- Notifications ---
  getNotifications() {
    return [...this.notifications];
  }

  addNotification(title, message, type = "system") {
    const notif = {
      id: `NOTIF-${Date.now().toString().slice(-5)}`,
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 50) {
      this.notifications.pop();
    }
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
    return notif;
  }

  markNotificationsRead() {
    this.notifications.forEach(n => n.read = true);
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // --- Dashboard & Analytics Aggregations ---
  getDashboardMetrics() {
    const activeOrders = this.orders.filter(o => o.status !== "Cancelled");
    const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.status === "Pending").length;
    
    // Active customers: customers with at least 1 order
    const customerIdsWithOrders = new Set(this.orders.map(o => o.customerId));
    const activeCustomers = customerIdsWithOrders.size;

    // Order status counts
    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };
    this.orders.forEach(o => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    // Top selling products by units & revenue
    const productSalesMap = {};
    activeOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            productId: item.productId,
            name: item.name,
            units: 0,
            revenue: 0
          };
        }
        productSalesMap[item.productId].units += item.qty;
        productSalesMap[item.productId].revenue += item.lineTotal;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders (last 6)
    const recentOrders = [...this.orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      activeCustomers,
      statusCounts,
      topProducts,
      recentOrders
    };
  }
}

export const store = new Store();


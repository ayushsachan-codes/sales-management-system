/**
 * Application Entry Point (SMS)
 * Coordinates Shell, Global Navigation, Routing, Notifications & Theme Management.
 */

import { store } from './store.js';
import { router } from './router.js';
import { renderLogin, renderRegister } from './pages/auth.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderOrders } from './pages/orders.js';
import { renderOrderForm } from './pages/order-form.js';
import { renderOrderDetail } from './pages/order-detail.js';
import { renderInvoices } from './pages/invoices.js';
import { renderInvoiceDetail } from './pages/invoice-detail.js';
import { renderCustomers } from './pages/customers.js';
import { renderProducts } from './pages/products.js';
import { renderReports } from './pages/reports.js';
import { renderProfile } from './pages/profile.js';
import { formatDateTime, escapeHtml } from './utils/formatters.js';
import { toast } from './utils/toast.js';

class App {
  constructor() {
    this.initTheme();
    this.registerRoutes();
    this.bindGlobalEvents();
    this.updateUserUI();
    this.updateNotificationsUI();

    // Re-render user UI whenever store updates
    store.subscribe(() => {
      this.updateUserUI();
      this.updateNotificationsUI();
    });
  }

  initTheme() {
    const savedTheme = localStorage.getItem('sms_theme');
    let theme = 'light';

    if (savedTheme) {
      theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }

    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sms_theme', next);

    // Update active view if dashboard or reports to redraw charts
    const hash = window.location.hash.slice(1).split('/')[0];
    if (hash === 'dashboard' || hash === 'reports') {
      router.handleRouting();
    }
  }

  registerRoutes() {
    router.register('login', renderLogin, false);
    router.register('register', renderRegister, false);
    router.register('dashboard', renderDashboard, true);
    router.register('orders', renderOrders, true);
    router.register('orders/create', renderOrderForm, true);
    router.register('orders/edit/:id', renderOrderForm, true);
    router.register('orders/:id', renderOrderDetail, true);
    router.register('invoices', renderInvoices, true);
    router.register('invoices/:id', renderInvoiceDetail, true);
    router.register('customers', renderCustomers, true);
    router.register('products', renderProducts, true);
    router.register('reports', renderReports, true);
    router.register('profile', renderProfile, true);
  }

  updateUserUI() {
    const user = store.getCurrentUser();
    if (!user) return;

    // Sidebar user profile
    const sidebarAvatar = document.getElementById("sidebar-user-avatar");
    const sidebarName = document.getElementById("sidebar-user-name");
    const sidebarRole = document.getElementById("sidebar-user-role");

    if (sidebarAvatar) sidebarAvatar.textContent = user.avatar || "U";
    if (sidebarName) sidebarName.textContent = user.name;
    if (sidebarRole) sidebarRole.textContent = user.role;

    // Topbar user trigger
    const topbarAvatar = document.getElementById("topbar-user-avatar");
    const topbarName = document.getElementById("topbar-user-name");
    if (topbarAvatar) topbarAvatar.textContent = user.avatar || "U";
    if (topbarName) topbarName.textContent = user.name.split(' ')[0];
  }

  updateNotificationsUI() {
    const notifs = store.getNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;

    const badge = document.getElementById("notif-badge");
    if (badge) {
      if (unreadCount > 0) {
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }

    const list = document.getElementById("notification-list");
    if (list) {
      if (notifs.length === 0) {
        list.innerHTML = `<div class="empty-state" style="padding: 2rem 1rem;"><p class="text-sm text-muted">No notifications right now.</p></div>`;
      } else {
        list.innerHTML = notifs.map(n => `
          <div class="notification-item ${n.read ? '' : 'unread'}">
            <div class="font-semibold text-sm" style="color: var(--text-primary);">${escapeHtml(n.title)}</div>
            <div class="text-xs text-secondary">${escapeHtml(n.message)}</div>
            <div class="notification-meta" style="margin-top: 4px;">
              <span>${formatDateTime(n.date)}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  bindGlobalEvents() {
    // Theme toggle button
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Mobile sidebar toggle
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("app-backdrop");

    const toggleSidebar = (open) => {
      if (open) {
        sidebar.classList.add("mobile-open");
        backdrop.classList.add("open");
      } else {
        sidebar.classList.remove("mobile-open");
        backdrop.classList.remove("open");
      }
    };

    if (mobileBtn) {
      mobileBtn.addEventListener("click", () => toggleSidebar(true));
    }
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        toggleSidebar(false);
        this.toggleNotifications(false);
      });
    }

    // Close mobile menu when nav link is clicked
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => toggleSidebar(false));
    });

    // Notifications Drawer toggle
    const notifBtn = document.getElementById("notifications-btn");
    const notifPanel = document.getElementById("notifications-panel");
    const notifCloseBtn = document.getElementById("close-notif-btn");
    const notifMarkAllBtn = document.getElementById("mark-all-read-btn");

    if (notifBtn) {
      notifBtn.addEventListener("click", () => this.toggleNotifications(true));
    }
    if (notifCloseBtn) {
      notifCloseBtn.addEventListener("click", () => this.toggleNotifications(false));
    }
    if (notifMarkAllBtn) {
      notifMarkAllBtn.addEventListener("click", () => {
        store.markNotificationsRead();
        toast.info("All notifications marked as read.");
      });
    }

    // Topbar user dropdown
    const userTrigger = document.getElementById("user-menu-trigger");
    const userDropdown = document.getElementById("user-dropdown");
    if (userTrigger && userDropdown) {
      userTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
      });

      document.addEventListener("click", (e) => {
        if (!userTrigger.contains(e.target)) {
          userDropdown.classList.remove("show");
        }
      });
    }

    // Logout button (A-4)
    const logoutBtns = document.querySelectorAll(".btn-logout-action");
    logoutBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        store.logout();
        toast.info("You have signed out.", "Session Ended");
        router.navigate("login");
      });
    });

    // Topbar Search Quick Shortcut ('/')
    const topbarSearch = document.getElementById("topbar-global-search");
    if (topbarSearch) {
      topbarSearch.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && topbarSearch.value.trim()) {
          const q = topbarSearch.value.trim();
          topbarSearch.value = "";
          router.navigate(`orders`);
          setTimeout(() => {
            const orderSearch = document.getElementById("order-search");
            if (orderSearch) {
              orderSearch.value = q;
              orderSearch.dispatchEvent(new Event("input"));
            }
          }, 100);
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
          e.preventDefault();
          topbarSearch.focus();
        }
      });
    }
  }

  toggleNotifications(open) {
    const notifPanel = document.getElementById("notifications-panel");
    const backdrop = document.getElementById("app-backdrop");
    if (!notifPanel) return;

    if (open) {
      notifPanel.classList.add("open");
      if (backdrop) backdrop.classList.add("open");
      store.markNotificationsRead();
    } else {
      notifPanel.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.smsApp = new App();
  router.handleRouting();
});


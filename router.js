/**
 * Hash-based Single Page Application (SPA) Router
 * Handles client-side navigation, URL params, and auth guards.
 */

import { store } from './store.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.getElementById("main-view");
    window.addEventListener("hashchange", () => this.handleRouting());
  }

  register(pathPattern, handler, isProtected = true) {
    this.routes[pathPattern] = {
      handler,
      isProtected,
      regex: this.compileRoutePattern(pathPattern)
    };
  }

  compileRoutePattern(pattern) {
    // Converts e.g. "orders/:id" into regex /orders\/([^\/]+)/
    const paramNames = [];
    const regexStr = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    return {
      regex: new RegExp(`^${regexStr}$`),
      paramNames
    };
  }

  navigate(hash) {
    window.location.hash = hash.startsWith("#") ? hash : `#${hash}`;
  }

  handleRouting() {
    let rawHash = window.location.hash.slice(1) || "dashboard";
    // Strip query parameters if present
    const [path] = rawHash.split("?");

    const currentUser = store.getCurrentUser();

    // Check matching route
    let matchedRoute = null;
    let params = {};

    for (const [pattern, config] of Object.entries(this.routes)) {
      const match = path.match(config.regex.regex);
      if (match) {
        matchedRoute = config;
        config.regex.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        break;
      }
    }

    if (!matchedRoute) {
      // Default fallback
      if (!currentUser) {
        this.navigate("login");
      } else {
        this.navigate("dashboard");
      }
      return;
    }

    // Auth guard (PRD requirement A-2)
    if (matchedRoute.isProtected && !currentUser) {
      this.navigate("login");
      return;
    }

    // If logged in and attempting to visit login/register, send to dashboard
    if (!matchedRoute.isProtected && currentUser && (path === "login" || path === "register")) {
      this.navigate("dashboard");
      return;
    }

    // Toggle app shell layout vs full-page auth layout
    const appShell = document.getElementById("app-shell");
    const authShell = document.getElementById("auth-shell");
    if (!matchedRoute.isProtected) {
      if (appShell) appShell.classList.add("hidden");
      if (authShell) authShell.classList.remove("hidden");
    } else {
      if (appShell) appShell.classList.remove("hidden");
      if (authShell) authShell.classList.add("hidden");
    }

    // Update active nav links in sidebar
    this.updateActiveNav(path);

    // Render page
    const targetElement = matchedRoute.isProtected ? this.container : document.getElementById("auth-view");
    if (targetElement) {
      window.scrollTo(0, 0);
      matchedRoute.handler(targetElement, params);
    }
  }

  updateActiveNav(currentPath) {
    const navItems = document.querySelectorAll(".nav-item");
    const rootPath = currentPath.split("/")[0]; // e.g. orders from orders/create
    navItems.forEach(item => {
      const href = item.getAttribute("href") || "";
      const route = href.replace("#", "").split("/")[0];
      if (route === rootPath) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
}

export const router = new Router();


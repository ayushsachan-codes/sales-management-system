/**
 * Authentication Module (Simulated)
 * Handles Login and Registration views.
 */

import { store } from '../store.js';
import { router } from '../router.js';
import { toast } from '../utils/toast.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
      <div class="card" style="width: 100%; max-width: 440px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); border-color: #334155;">
        <div class="card-body" style="padding: 2.25rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="width: 52px; height: 52px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; margin: 0 auto 1rem auto; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">Sales Management System</h1>
            <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.35rem;">Sign in to manage orders, inventory & invoices</p>
          </div>

          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="login-email">Email Address</label>
              <input type="email" id="login-email" class="form-control" placeholder="name@company.com" required value="alex.morgan@company.com">
            </div>

            <div class="form-group">
              <div class="flex justify-between items-center" style="margin-bottom: 0.35rem;">
                <label class="form-label" for="login-password" style="margin-bottom: 0;">Password</label>
                <span class="text-xs text-muted">Demo: password123</span>
              </div>
              <input type="password" id="login-password" class="form-control" placeholder="••••••••" required value="password123">
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.65rem 1rem; margin-top: 0.5rem; font-weight: 600;">
              Sign In to SMS
            </button>
          </form>

          <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light); text-align: center;">
            <p class="text-sm text-muted">Don't have an account? <a href="#register" style="font-weight: 600;">Register here</a></p>
          </div>

          <!-- Quick 1-Click Demo Login Helpers -->
          <div style="margin-top: 1.25rem; background-color: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md); border: 1px dashed var(--border-strong);">
            <div class="text-xs font-semibold text-muted" style="margin-bottom: 0.5rem; text-transform: uppercase;">Quick Demo Sign-In:</div>
            <div class="flex gap-2">
              <button type="button" class="btn btn-secondary btn-sm flex-1" id="demo-manager">
                Sales Manager
              </button>
              <button type="button" class="btn btn-secondary btn-sm flex-1" id="demo-rep">
                Sales Rep
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector("#login-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = container.querySelector("#login-email").value.trim();
    const password = container.querySelector("#login-password").value;

    try {
      store.login(email, password);
      toast.success("Welcome back!", "Signed In");
      router.navigate("dashboard");
    } catch (err) {
      toast.error(err.message, "Authentication Failed");
    }
  });

  container.querySelector("#demo-manager").addEventListener("click", () => {
    container.querySelector("#login-email").value = "alex.morgan@company.com";
    container.querySelector("#login-password").value = "password123";
    form.dispatchEvent(new Event("submit"));
  });

  container.querySelector("#demo-rep").addEventListener("click", () => {
    container.querySelector("#login-email").value = "sarah.j@company.com";
    container.querySelector("#login-password").value = "password123";
    form.dispatchEvent(new Event("submit"));
  });
}

export function renderRegister(container) {
  container.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
      <div class="card" style="width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); border-color: #334155;">
        <div class="card-body" style="padding: 2.25rem;">
          <div style="text-align: center; margin-bottom: 1.75rem;">
            <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">Create SMS Account</h1>
            <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.35rem;">Join your organization's sales workspace</p>
          </div>

          <form id="register-form">
            <div class="form-group">
              <label class="form-label required" for="reg-name">Full Name</label>
              <input type="text" id="reg-name" class="form-control" placeholder="Jane Doe" required>
            </div>

            <div class="form-group">
              <label class="form-label required" for="reg-email">Work Email</label>
              <input type="email" id="reg-email" class="form-control" placeholder="jane@company.com" required>
            </div>

            <div class="form-group">
              <label class="form-label required" for="reg-role">Role</label>
              <select id="reg-role" class="form-control" required>
                <option value="Sales Representative">Sales Representative</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Accounts / Billing">Accounts / Billing</option>
                <option value="Inventory Manager">Inventory Manager</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required" for="reg-password">Password</label>
              <input type="password" id="reg-password" class="form-control" placeholder="Minimum 6 characters" required minlength="6">
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.65rem 1rem; margin-top: 0.5rem; font-weight: 600;">
              Register & Sign In
            </button>
          </form>

          <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light); text-align: center;">
            <p class="text-sm text-muted">Already have an account? <a href="#login" style="font-weight: 600;">Sign in here</a></p>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector("#register-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = container.querySelector("#reg-name").value.trim();
    const email = container.querySelector("#reg-email").value.trim();
    const role = container.querySelector("#reg-role").value;
    const password = container.querySelector("#reg-password").value;

    try {
      store.register({ name, email, role, password });
      toast.success("Account created successfully!", "Registered");
      router.navigate("dashboard");
    } catch (err) {
      toast.error(err.message, "Registration Failed");
    }
  });
}


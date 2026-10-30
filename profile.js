/**
 * User Profile & System Settings Module
 * Implements PRD Requirements A-3, A-4, 4.10 (Tax settings, Sample data reset).
 */

import { store } from '../store.js';
import { router } from '../router.js';
import { toast } from '../utils/toast.js';
import { modal } from '../utils/modal.js';
import { escapeHtml } from '../utils/formatters.js';

export function renderProfile(container) {
  const user = store.getCurrentUser();
  const settings = store.getSettings();

  container.innerHTML = `
    <div class="page-container" style="max-width: 900px;">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Account & System Settings</h1>
          <p class="page-description">Manage personal credentials, company profile, and application defaults</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <!-- Profile Card (A-3) -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">User Profile</h3>
            <span class="badge badge-processing">${escapeHtml(user ? user.role : "User")}</span>
          </div>
          <div class="card-body">
            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-light);">
              <div style="width: 72px; height: 72px; border-radius: var(--radius-full); background: linear-gradient(135deg, #2563eb, #1d4ed8); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 700; color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                ${escapeHtml(user ? user.avatar : "U")}
              </div>
              <div>
                <h3 style="font-size: 1.25rem;">${escapeHtml(user ? user.name : "")}</h3>
                <p class="text-sm text-muted">${escapeHtml(user ? user.email : "")}</p>
                <div class="text-xs text-muted" style="margin-top: 0.25rem;">Role: <strong>${escapeHtml(user ? user.role : "")}</strong></div>
              </div>
            </div>

            <form id="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required" for="prof-name">Full Name</label>
                  <input type="text" id="prof-name" class="form-control" required value="${escapeHtml(user ? user.name : '')}">
                </div>
                <div class="form-group">
                  <label class="form-label required" for="prof-email">Email Address</label>
                  <input type="email" id="prof-email" class="form-control" required value="${escapeHtml(user ? user.email : '')}">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-password">Change Password (leave blank to keep current)</label>
                <input type="password" id="prof-password" class="form-control" placeholder="••••••••" minlength="6">
              </div>

              <button type="submit" class="btn btn-primary">
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>

        <!-- Global Company & Tax Settings (4.10) -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Organization & Tax Settings</h3>
          </div>
          <div class="card-body">
            <form id="settings-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required" for="set-company-name">Company Legal Name</label>
                  <input type="text" id="set-company-name" class="form-control" required value="${escapeHtml(settings.companyName)}">
                </div>
                <div class="form-group">
                  <label class="form-label required" for="set-tax-rate">Default Sales Tax Rate (%)</label>
                  <div class="input-group">
                    <input type="number" step="0.1" min="0" max="100" id="set-tax-rate" class="form-control" required value="${settings.defaultTaxRate}">
                    <span class="input-group-text">%</span>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required" for="set-company-email">Billing Email</label>
                  <input type="email" id="set-company-email" class="form-control" required value="${escapeHtml(settings.companyEmail)}">
                </div>
                <div class="form-group">
                  <label class="form-label required" for="set-company-phone">Billing Phone</label>
                  <input type="text" id="set-company-phone" class="form-control" required value="${escapeHtml(settings.companyPhone)}">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required" for="set-company-address">Company Address (Printed on Invoices)</label>
                <input type="text" id="set-company-address" class="form-control" required value="${escapeHtml(settings.companyAddress)}">
              </div>

              <button type="submit" class="btn btn-primary">
                Update Organization Settings
              </button>
            </form>
          </div>
        </div>

        <!-- System Reset & Diagnostics Card (Reliability Section 8 & 11) -->
        <div class="card" style="border-color: rgba(239, 68, 68, 0.3);">
          <div class="card-header" style="background-color: var(--status-cancelled-bg);">
            <h3 class="card-title" style="color: var(--status-cancelled-text);">Maintenance & Demo Data Reset</h3>
          </div>
          <div class="card-body">
            <p class="text-sm text-secondary" style="margin-bottom: 1.25rem;">
              Need to restart fresh? Resetting will re-seed all sample customers, products with original inventory stock, orders, invoices, and analytics data back to their clean initial state.
            </p>
            <button type="button" class="btn btn-danger" id="btn-reset-sample-data">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
              Reset to Initial Sample Data
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Profile Submit
  const profileForm = container.querySelector("#profile-form");
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = container.querySelector("#prof-name").value.trim();
    const email = container.querySelector("#prof-email").value.trim();
    const password = container.querySelector("#prof-password").value;

    try {
      store.updateProfile({
        name,
        email,
        ...(password ? { password } : {})
      });
      toast.success("Profile details updated successfully!", "Saved");
      renderProfile(container);
    } catch (err) {
      toast.error(err.message, "Update Failed");
    }
  });

  // Attach Settings Submit
  const settingsForm = container.querySelector("#settings-form");
  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const companyName = container.querySelector("#set-company-name").value.trim();
    const defaultTaxRate = parseFloat(container.querySelector("#set-tax-rate").value);
    const companyEmail = container.querySelector("#set-company-email").value.trim();
    const companyPhone = container.querySelector("#set-company-phone").value.trim();
    const companyAddress = container.querySelector("#set-company-address").value.trim();

    try {
      store.updateSettings({
        companyName,
        defaultTaxRate,
        companyEmail,
        companyPhone,
        companyAddress
      });
      toast.success("Organization and tax configuration saved!", "Settings Saved");
    } catch (err) {
      toast.error(err.message, "Failed");
    }
  });

  // Reset Sample Data Button
  const resetBtn = container.querySelector("#btn-reset-sample-data");
  resetBtn.addEventListener("click", async () => {
    const confirmed = await modal.confirm({
      title: "Reset to Sample Data?",
      message: "This will restore all default customers, products, stock counts, orders and invoices. Any custom changes will be replaced with fresh mock data.",
      confirmText: "Yes, Reset Everything",
      isDanger: true
    });

    if (confirmed) {
      store.resetToSampleData();
      modal.close();
      toast.success("Sample dataset restored to initial state.", "Database Reset");
      router.navigate("dashboard");
    }
  });
}


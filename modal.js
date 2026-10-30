/**
 * Modal Manager
 * Manages accessible modal dialogs and confirmation alerts.
 */

class ModalManager {
  constructor() {
    this.overlay = null;
    this.activeCallback = null;
  }

  ensureOverlay() {
    if (!this.overlay) {
      this.overlay = document.getElementById("modal-overlay");
      if (!this.overlay) {
        this.overlay = document.createElement("div");
        this.overlay.id = "modal-overlay";
        this.overlay.className = "modal-overlay";
        this.overlay.innerHTML = `
          <div class="modal" id="modal-container" role="dialog" aria-modal="true">
            <div class="modal-header">
              <h3 class="modal-title" id="modal-title">Modal</h3>
              <button class="icon-btn" id="modal-close-btn" aria-label="Close dialog">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="modal-body" id="modal-body"></div>
            <div class="modal-footer" id="modal-footer"></div>
          </div>
        `;
        document.body.appendChild(this.overlay);

        const closeBtn = this.overlay.querySelector("#modal-close-btn");
        closeBtn.addEventListener("click", () => this.close());

        this.overlay.addEventListener("click", (e) => {
          if (e.target === this.overlay) {
            this.close();
          }
        });

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && this.overlay.classList.contains("open")) {
            this.close();
          }
        });
      }
    }
  }

  open({ title, content, footerHtml = null, size = "md", onOpen = null }) {
    this.ensureOverlay();

    const titleEl = this.overlay.querySelector("#modal-title");
    const bodyEl = this.overlay.querySelector("#modal-body");
    const footerEl = this.overlay.querySelector("#modal-footer");
    const modalEl = this.overlay.querySelector("#modal-container");

    modalEl.className = `modal modal-${size}`;
    titleEl.textContent = title || "";

    if (typeof content === "string") {
      bodyEl.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      bodyEl.innerHTML = "";
      bodyEl.appendChild(content);
    }

    if (footerHtml !== null) {
      footerEl.innerHTML = footerHtml;
      footerEl.classList.remove("hidden");
    } else {
      footerEl.classList.add("hidden");
    }

    this.overlay.classList.add("open");
    document.body.style.overflow = "hidden";

    if (typeof onOpen === "function") {
      onOpen(this.overlay);
    }
  }

  close() {
    if (this.overlay) {
      this.overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  confirm({
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false
  }) {
    return new Promise((resolve) => {
      this.ensureOverlay();

      const footerHtml = `
        <button class="btn btn-secondary" id="modal-btn-cancel">${cancelText}</button>
        <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="modal-btn-confirm">${confirmText}</button>
      `;

      this.open({
        title,
        content: `<p style="color: var(--text-secondary); line-height: 1.5;">${message}</p>`,
        footerHtml,
        size: "sm",
        onOpen: (modalEl) => {
          const cancelBtn = modalEl.querySelector("#modal-btn-cancel");
          const confirmBtn = modalEl.querySelector("#modal-btn-confirm");

          cancelBtn.onclick = () => {
            this.close();
            resolve(false);
          };

          confirmBtn.onclick = () => {
            this.close();
            resolve(true);
          };
        }
      });
    });
  }
}

export const modal = new ModalManager();


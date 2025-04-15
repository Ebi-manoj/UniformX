class Spinner {
  constructor() {
    this.spinner = document.getElementById('loadingSpinner');
    this.timeout = null;
    this.init();
  }

  show() {
    clearTimeout(this.timeout);
    if (this.spinner) {
      this.spinner.classList.remove('hidden');
    }
  }

  hide() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.spinner) {
        this.spinner.classList.add('hidden');
      }
    }, 200);
  }

  init() {
    // Hide spinner on initial load
    document.addEventListener('DOMContentLoaded', () => this.hide());
    window.addEventListener('load', () => this.hide());

    // Show spinner on admin link clicks
    document.querySelectorAll('a[href*="/admin"]').forEach(link => {
      link.addEventListener('click', e => {
        if (link.href !== window.location.href) {
          this.show();
        }
      });
    });

    // Hide spinner on navigation completion
    window.addEventListener('popstate', () => {
      this.hide();
    });

    // Fallback: hide spinner after a timeout to prevent it getting stuck
    window.addEventListener('click', () => {
      this.timeout = setTimeout(() => this.hide(), 3000);
    });

    // Handle client-side routing (if applicable)
    window.addEventListener('hashchange', () => this.hide());

    window.addEventListener('pageshow', e => {
      if (e.persisted) {
        this.hide();
      }
    });
  }
}

const spinner = new Spinner();
window.spinner = spinner;

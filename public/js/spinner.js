// spinner.js
class Spinner {
  constructor() {
    this.spinner = document.getElementById('loadingSpinner');
    this.init();
  }

  // Show the spinner
  show() {
    if (this.spinner) this.spinner.classList.remove('hidden');
  }

  // Hide the spinner
  hide() {
    if (this.spinner) this.spinner.classList.add('hidden');
  }

  // Detect navigation events
  init() {
    // Hide spinner on page load
    document.addEventListener('DOMContentLoaded', () => this.hide());

    // Show spinner on form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', event => {
        const isValid = form.checkValidity();
        if (isValid) this.show();
      });
    });

    // Show spinner on navigation link clicks
    document.querySelectorAll('a[href*="/admin"]').forEach(link => {
      link.addEventListener('click', () => {
        this.show();
      });
    });

    // Show spinner before page unload (e.g., redirect)
    window.addEventListener('beforeunload', () => {
      this.show();
    });

    // Hide spinner when new page is fully loaded
    window.addEventListener('load', () => {
      this.hide();
    });
  }
}

// Instantiate the spinner globally
const spinner = new Spinner();

// Export for manual control (optional)

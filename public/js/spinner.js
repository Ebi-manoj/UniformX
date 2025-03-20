// public/js/spinner.js
class Spinner {
  constructor() {
    this.spinner = document.getElementById('loadingSpinner');
    this.timeout = null;
    this.init();
  }

  show() {
    clearTimeout(this.timeout);
    if (this.spinner) this.spinner.classList.remove('hidden');
  }

  hide() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.spinner) this.spinner.classList.add('hidden');
    }, 200);
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => this.hide());
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', event => {
        if (form.checkValidity()) this.show();
      });
    });
    document.querySelectorAll('a[href*="/admin"]').forEach(link => {
      link.addEventListener('click', () => this.show());
    });
    window.addEventListener('beforeunload', () => this.show());
    window.addEventListener('load', () => this.hide());
  }
}
new Spinner();

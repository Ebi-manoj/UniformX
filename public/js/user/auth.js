document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const mobileInput = document.getElementById('mobile');
  const errorMessage = document.querySelector('.errorMessage');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Reset error message
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';

    // Validation rules
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const mobile = mobileInput.value.trim();

    if (name.length < 3) {
      showError('Name must be at least 3 characters long.');
      return;
    }

    if (!validateEmail(email)) {
      showError('Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      showError('Mobile number must be exactly 10 digits.');
      return;
    }

    form.submit();
  });

  // Email validation function
  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Show error message
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }
});

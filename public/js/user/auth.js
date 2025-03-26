document.addEventListener('DOMContentLoaded', function () {
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

  const form = document.getElementById('sign_loginForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const mobileInput = document.getElementById('mobile');
  const errorMessage = document.querySelector('.errorMessage');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Reset error message
      errorMessage.classList.add('hidden');
      errorMessage.textContent = '';

      // Get input values
      const name = nameInput ? nameInput.value.trim() : null;
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const mobile = mobileInput ? mobileInput.value.trim() : null;

      // Check if it's login or signup based on available fields
      const isSignup = nameInput !== null && mobileInput !== null;

      // Validation rules for signup
      if (isSignup) {
        if (name.length < 3) {
          showError('Name must be at least 3 characters long.');
          return;
        }

        if (!/^\d{10}$/.test(mobile)) {
          showError('Mobile number must be exactly 10 digits.');
          return;
        }
      }

      // Common validation for both login & signup
      if (!validateEmail(email)) {
        showError('Enter a valid email address.');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
      }

      form.submit();
    });
  }

  /////////////////////////////////////
  // resetPassword
  const resetForm = document.getElementById('reset-password');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  console.log(resetForm);

  if (resetForm) {
    resetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      console.log('hai');

      errorMessage.classList.add('hidden');
      errorMessage.textContent = '';

      const newPassword = newPasswordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();
      if (!newPassword && !confirmPassword) {
        showError('All fields required');
        return;
      }
      if (newPassword.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        showError('Passwords should be match');
        return;
      }

      resetForm.submit();
    });
  }

  ///////////////////////////////////////////////////////////
  ////////////OTP TIMER
  const timerElement = document.getElementById('timer');
  const resendBtn = document.getElementById('resend-btn');

  if (timerElement && resendBtn) {
    const expiresAt = new Date(timerElement.dataset.expiryTime).getTime(); // Convert to milliseconds

    const updateTimer = () => {
      const currentTime = Date.now(); // Get current time
      let timeLeft = Math.floor((expiresAt - currentTime) / 1000); // Remaining time in seconds

      if (timeLeft <= 0) {
        timerElement.textContent = 'Expired';
        resendBtn.disabled = false;
      } else {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${
          seconds < 10 ? '0' : ''
        }${seconds}`;
        setTimeout(updateTimer, 1000);
      }
    };

    updateTimer();
  }
});

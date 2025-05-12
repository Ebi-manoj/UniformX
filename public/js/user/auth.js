import { loginSchema, signupSchema } from '../validation.js';

document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('sign_up_form');
  const loginForm = document.getElementById('log_in_form');

  if (signupForm) {
    validateAndSubmit(signupForm, signupSchema);
  }
  if (loginForm) {
    validateAndSubmit(loginForm, loginSchema);
  }
  function validateAndSubmit(form, schema) {
    form.addEventListener('submit', function (e) {
      document
        .querySelectorAll("span[id$='Error']")
        .forEach(el => (el.textContent = ''));
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Validate using Zod schema
      const result = schema.safeParse(data);

      if (!result.success) {
        result.error.errors.forEach(error => {
          const field = error.path[0];
          const errorElement = document.getElementById(`${field}Error`);
          if (errorElement) {
            errorElement.textContent = error.message;
          }
        });
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
  const errorMessage = document.querySelector('.errorMessage');

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
  function showError(message) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = message;
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

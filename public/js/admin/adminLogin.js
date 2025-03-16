const admin_form = document.getElementById('admin_form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const error_message = document.querySelector('.error-message');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

admin_form.addEventListener('submit', async e => {
  e.preventDefault();
  let messages = [];

  if (!emailPattern.test(email.value) || password.value.length <= 1) {
    messages.push('Invalid Credentials');
  }

  if (messages.length) {
    console.log(error_message);
    console.log(messages);
    error_message.textContent = messages[0];
    error_message.classList.remove('hidden');
  } else {
    try {
      const response = await fetch('login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        error_message.textContent = data.message;
        error_message.classList.remove('hidden');
      } else {
        window.location.href = 'dashboard';
      }
    } catch (error) {
      console.error('Error:', error);
      error_message.textContent = 'Something went wrong. Try again!';
      error_message.classList.remove('hidden');
    }
  }
});

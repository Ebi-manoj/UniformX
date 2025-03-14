const admin_form = document.getElementById('admin_form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const error_message = document.querySelector('.error-message');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log('logged');

admin_form.addEventListener('submit', e => {
  console.log('started');

  e.preventDefault();
  let messages = [];
  if (!emailPattern.test(email.value) || password.value.length <= 1) {
    messages.push('Invalid Credintials');
  }
  if (messages.length) {
    console.log(error_message);
    console.log(messages);

    error_message.textContent = messages[0];
    error_message.classList.remove('hidden');
  } else {
    admin_form.submit();
  }
});

import { showToast } from '../toast.js';

const referalModal = document.getElementById('referalModal');
const referalBtn = document.getElementById('referalBtn');
const closeBtn = document.querySelectorAll('.close-btn');
const referalInput = document.getElementById('referalInput');
const applyBtn = document.getElementById('applyBtn');

if (referalBtn) {
  referalBtn.addEventListener('click', function () {
    referalModal.classList.remove('hidden');
  });
}
if (closeBtn) {
  closeBtn.forEach(btn =>
    btn.addEventListener('click', function () {
      referalModal.classList.add('hidden');
    })
  );
}

if (applyBtn) {
  applyBtn.addEventListener('click', async function () {
    const referalToken = referalInput.value;
    if (!referalToken || referalToken.length < 9)
      return showToast('Provide a valid token', 'error');

    try {
      // fetch referalToken
      const response = await fetch(`/referal/apply/${referalToken}`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (!data.success)
        return showToast(data.message || 'Something went wrong');
      referalModal.classList.add('hidden');
      showToast(data.message || 'Successfully claimed', 'success');
    } catch (error) {
      console.log(error);
      showToast(error.message || 'Something went wrong');
    }
  });
}

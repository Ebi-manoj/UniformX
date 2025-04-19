import { showToast } from '../toast.js';

const btnClose = document.querySelectorAll('.btn-close');
const walletModal = document.getElementById('walletModal');
const addBtn = document.getElementById('btn-add-amount');
const btnCancel = document.getElementById('btn-cancel-wallet');
const btnPay = document.getElementById('btn-pay-wallet');
const amountInput = document.getElementById('amountInput');

if (addBtn) {
  addBtn.addEventListener('click', function () {
    walletModal.classList.remove('hidden');
  });
}

if (btnClose) {
  btnClose.forEach(btn =>
    btn.addEventListener('click', function () {
      walletModal.classList.add('hidden');
    })
  );
}

if (btnPay) {
  btnPay.addEventListener('click', async function (e) {
    e.preventDefault();
    const amount = amountInput.value;
    if (!amount) return showToast('Please eneter a valid amount!');

    const res = await fetch('/wallet/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!data.success) return showToast('something went wrong');

    const options = {
      key: 'rzp_test_lRSohoS3jcGAN1',
      amount: data.order.amount,
      currency: 'INR',
      name: 'UniformX',
      description: 'Add money to Wallet',
      order_id: data.order.id,
      handler: async function (response) {
        const verifyRes = await fetch('/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...response, type: 'wallet' }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          walletModal.classList.add('hidden');
          showToast('payment success', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          walletModal.classList.add('hidden');
          showToast('Payment verification failed');
        }
      },
    };
    const rzp = new Razorpay(options);
    rzp.open();
  });
}

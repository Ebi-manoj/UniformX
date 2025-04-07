import { showToast } from '../toast.js';

console.log('order.js loaded');

// View Order Button
const viewOrderBtn = document.querySelectorAll('.btn-view-order');
viewOrderBtn.forEach(el =>
  el.addEventListener('click', function () {
    const orderId = this.dataset.orderId;
    window.location.href = `/order/${orderId}`;
  })
);

// Cancel Order Logic
const btnCancel = document.querySelectorAll('.btn-cancel');
const cancelModal = document.getElementById('deleteModal');
const cancelBtnModal = document.getElementById('cancelModal');
const confirmModal = document.getElementById('confirmModal');

let selectedOrderId = null;
let selectedItemId = null;

// Attach click event to each cancel button
btnCancel.forEach(btn => {
  btn.addEventListener('click', function () {
    selectedOrderId = this.dataset.orderId;
    selectedItemId = this.dataset.itemId;

    // Show modal
    cancelModal.classList.remove('hidden');
  });
});

// Handle modal button clicks
if (cancelModal) {
  cancelModal.addEventListener('click', async function (e) {
    // Close modal if cancel is clicked
    if (e.target === cancelBtnModal) {
      return cancelModal.classList.add('hidden');
    }

    // Confirm cancellation
    if (e.target === confirmModal) {
      try {
        const response = await fetch(`/cancel-order/${selectedOrderId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: selectedItemId }),
        });

        if (!response.ok) {
          return showToast('Something went wrong');
        }

        const data = await response.json();

        if (data.success) {
          showToast(data.message || 'Order Cancelled', 'success');
          window.location.reload();
        } else {
          showToast(data.message || 'Could not cancel order');
        }
      } catch (error) {
        showToast('Something went wrong');
        console.error(error);
      }
    }
  });
}

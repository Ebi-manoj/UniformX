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
const cancelForm = document.getElementById('cancelForm');
const btnCloseCancel = document.getElementById('btnCloseCancel');
const btnSubmitCancel = document.getElementById('btnSubmitCancel');

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
      cancelForm.classList.remove('hidden');
    }
  });

  if (cancelForm) {
    btnCloseCancel.addEventListener('click', function () {
      cancelForm.classList.add('hidden');
    });

    btnSubmitCancel.addEventListener('click', async function () {
      try {
        const cancelNote = document.getElementById('cancel-note').value.trim();
        const response = await fetch(`/cancel-order/${selectedOrderId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: selectedItemId, reason: cancelNote }),
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
    });
  }
}

// Return request Handling

function returnOrder() {
  const returnModal = document.getElementById('returnModal');
  const btnReturn = document.querySelectorAll('.btn-return');
  let orderId = null;
  let itemId = null;

  // Handling button clicks
  btnReturn.forEach(btn =>
    btn.addEventListener('click', function () {
      orderId = this.dataset.orderId;
      itemId = this.dataset.itemId;

      console.log(orderId, itemId);

      returnModal.classList.remove('hidden');
    })
  );

  // Handling Closing the modal
  const btnCloseReturn = document.getElementById('btnCloseReturn');
  if (btnCloseReturn) {
    btnCloseReturn.addEventListener('click', function () {
      closeReturnModal();
    });
  }

  function closeReturnModal() {
    returnModal.classList.add('hidden');
  }

  // SUbmit the Response
  const btnSubmitReturn = document.getElementById('btnSubmitReturn');
  if (btnSubmitReturn) {
    btnSubmitReturn.addEventListener('click', async function () {
      const returnNote = document.getElementById('returnNote').value;

      if (!returnNote) return showToast('Give a Valid reason');

      // fetch return order request
      try {
        const response = await fetch(`/return-order/${orderId}`, {
          method: 'PUT',
          headers: { 'content-Type': 'application/json' },
          body: JSON.stringify({ itemId, reason: returnNote }),
        });
        const data = await response.json();
        if (data.success) {
          showToast(data.message || 'Return Requested', 'success');
          setTimeout(() => {
            location.reload();
          }, 1000);
        }
      } catch (error) {
        showToast('Something went wrong');
      }
    });
  }
}

returnOrder();

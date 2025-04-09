import { showToast } from '../toast.js';

// ToogleOrder Details
const orderRow = document.querySelectorAll('.order-row');
orderRow.forEach(btn => btn.addEventListener('click', toggleOrderDetails));
function toggleOrderDetails() {
  const orderItem = this.closest('.order-item');
  orderItem.classList.toggle('order-expanded');
}

// Search Functionality will be loaded from common.js

// Filter functionality
function applyFilters() {
  console.log('fileter');

  const statusFilter = document.getElementById('statusFilter');
  const paymentFilter = document.getElementById('paymentFilter');
  const dateRangeFilter = document.getElementById('dateRangeFilter');

  function updateURL() {
    const url = new URL(window.location.href);
    const status = statusFilter.value;
    const payment = paymentFilter.value;
    const dateRange = dateRangeFilter.value;
    console.log(status);

    if (status) url.searchParams.set('status', status);
    else url.searchParams.delete('status');
    if (payment) url.searchParams.set('payment', payment);
    else url.searchParams.delete('payment');
    if (dateRange) url.searchParams.set('dateRange', dateRange);
    else url.searchParams.delete('dateRange');

    url.searchParams.set('page', 1);
    window.location.href = url.toString();
  }

  statusFilter.addEventListener('change', updateURL);
  paymentFilter.addEventListener('change', updateURL);
  dateRangeFilter.addEventListener('change', updateURL);
}

applyFilters();

//Show the clear buttton
const clearBtn = document.getElementById('clearBtn');
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const hasFilters =
    urlParams.get('search') ||
    urlParams.get('status') ||
    urlParams.get('payment') ||
    urlParams.get('dateRange');

  if (hasFilters) {
    clearBtn.classList.remove('hidden');
  }
});

// Remove filter when clicking the clear Button
clearBtn.addEventListener('click', function () {
  window.location.href = 'orders';
});

//Update Status of Particular Product
const updateStatusBtn = document.querySelectorAll('.updateStatusBtn');

updateStatusBtn.forEach(btn =>
  btn.addEventListener('click', async function () {
    const orderId = this.dataset.orderId;
    const itemId = this.dataset.itemId;
    const statusUpdateDiv = this.closest('.statusUpdate');
    const status = statusUpdateDiv.querySelector('.selectStatus').value;

    // fetch for Update Status
    try {
      const response = await fetch(`/admin/order/update/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status }),
      });
      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Status Updated', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast('Something Went Wrong');
      }
    } catch (error) {
      showToast('Internal Server issue');
    }
  })
);

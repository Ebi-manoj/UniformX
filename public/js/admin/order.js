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

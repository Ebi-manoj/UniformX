const addCoupon = document.getElementById('addCoupon');
const allCoupons = document.getElementById('allCoupons');

if (addCoupon) {
  // Change discount symbol based on discount type
  document
    .getElementById('discountType')
    .addEventListener('change', function () {
      const discountSymbol = document.querySelector('.discount-symbol');
      if (this.value === 'percentage') {
        discountSymbol.textContent = '%';
      } else {
        discountSymbol.textContent = '₹';
      }
    });

  // Set min date for datepickers to today
  const today = new Date().toISOString().slice(0, 16);
  document.getElementById('startDate').min = today;
  document.getElementById('endDate').min = today;

  // Ensure end date is after start date
  document.getElementById('startDate').addEventListener('change', function () {
    document.getElementById('endDate').min = this.value;
  });
}

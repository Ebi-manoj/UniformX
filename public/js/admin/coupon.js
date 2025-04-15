import { couponSchema } from '../validation.js';

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

  // Form submission and validation for addCoupon
  const addCouponForm = document.getElementById('addCouponForm');

  addCouponForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Clear previous errors
    document
      .querySelectorAll("span[id$='Error']")
      .forEach(el => (el.textContent = ''));

    // Prepare form data
    const formData = new FormData(addCouponForm);
    const data = Object.fromEntries(formData.entries());
    data.isActive = addCouponForm.querySelector('#isActive').checked;

    // Safe parse using Zod
    const result = couponSchema.safeParse(data);
    console.log(result.success);

    if (result.success) {
      window.spinner?.show();
      addCouponForm.submit();
    } else {
      result.error.errors.forEach(error => {
        const field = error.path[0];
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
          errorElement.textContent = error.message;
        }
      });
    }
  });
}

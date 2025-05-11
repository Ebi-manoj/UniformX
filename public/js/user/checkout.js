import { showToast } from '../toast.js';
import { AddressFunctionality } from './profile.js';

////////////////
//Place an order
const addressForm = document.getElementById('addressForm');
const btnPlaceOrder = document.getElementById('btn-placeOrder');
const retryBtn = document.getElementById('retry-btn');

if (addressForm) {
  AddressFunctionality();
}

if (btnPlaceOrder) {
  btnPlaceOrder.addEventListener('click', async function () {
    /////////Collect the Form Data///////
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    ).value;
    if (!paymentMethod) return showToast('Please select an Payment option');

    document
      .querySelectorAll('input:disabled')
      .forEach(input => input.removeAttribute('disabled'));

    const formData = new FormData(addressForm);

    document
      .querySelectorAll('.input-disabled')
      .forEach(input => input.setAttribute('disabled', true));

    const shippingAddress = {
      street_address: formData.get('address'),
      name: formData.get('fullName'),
      district: formData.get('district'),
      state: formData.get('state'),
      mobile: formData.get('mobile'),
      pincode: formData.get('pincode'),
    };
    for (const [key, value] of Object.entries(shippingAddress)) {
      if (!value || value.trim() === '') {
        return showToast(`Please fill out the ${key.replace('_', ' ')} field.`);
      }
    }
    console.log(paymentMethod);

    ///Fetch the Place Order

    try {
      if (['COD', 'WALLET'].includes(paymentMethod)) {
        const res = await fetch('/place-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingAddress,
            paymentMethod,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Order failed');
        console.log('The order succefull');
        window.location.href = `${data.redirectUrl}/${data.orderId}`;
      } else {
        const response = await fetch('order/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingAddress,
            paymentMethod,
          }),
        });
        const data = await response.json();
        if (!data.success)
          return showToast(data.message || 'Something went wrong');
        const options = {
          key: 'rzp_test_lRSohoS3jcGAN1',
          amount: data.order.amount,
          currency: 'INR',
          name: 'UniformX',
          description: 'COmplete the Order Payment',
          order_id: data.order.id,
          handler: async function (response) {
            const verifyRes = await fetch('/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                type: 'order',
                shippingAddress,
                paymentMethod,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success)
              throw new Error(data.message || 'Order failed');
            console.log('The order succefull');
            window.location.href = `${verifyData.redirectUrl}/${verifyData.orderId}`;
          },
        };
        const rzp = new Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', function (response) {
          console.error('Payment failed', response);
          const orderId = response.error?.metadata?.order_id;
          if (orderId) {
            window.location.href = `/order-failure/${orderId}`;
          }
        });
      }
    } catch (error) {
      showToast('Something Went Wrong!');
      console.log(error.message);
    }
  });
}

if (retryBtn) {
  retryBtn.addEventListener('click', async function () {
    const orderId = this.dataset.orderId;
    console.log(orderId + ' from retry btn');
    try {
      const response = await fetch(`/retry-payment/${orderId}`);
      const data = await response.json();

      if (!data.success)
        return showToast(data.message || 'Something went wrong');

      const { order, shippingAddress, paymentMethod } = data;

      const options = {
        key: 'rzp_test_lRSohoS3jcGAN1',
        amount: order.amount,
        currency: 'INR',
        name: 'UniformX',
        description: 'Complete your payment',
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch('/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              type: 'order',
              shippingAddress,
              paymentMethod,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyData.success)
            throw new Error(verifyData.message || 'Verification failed');

          window.location.href = `${verifyData.redirectUrl}/${verifyData.orderId}`;
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed', response);
        const orderId = response.error?.metadata?.order_id;
        if (orderId) window.location.href = `/order-failure/${orderId}`;
      });
    } catch (err) {
      console.error('Retry error:', err);
      showToast('Retry failed');
    }
  });
}
///////////////////////////////////////////////////////////////////////////
// Coupon
const generateCouponCard = coupon => {
  const title =
    coupon.discountType === 'percentage'
      ? `${coupon.discountAmount}% Off Discount`
      : `₹${coupon.discountAmount} Off Discount`;
  const endDate = moment(coupon.endDate).format('MMMM DD, YYYY');
  return `
    <div class="coupon-card border border-gray-200 rounded-xl p-4 bg-white">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div class="flex-shrink-0 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
          <div class="text-center">
            <span class="block text-xs text-gray-500 uppercase">Coupon Code</span>
            <span class="block text-lg font-bold text-gray-900 mt-1">${coupon.code}</span>
          </div>
        </div>
        <div class="flex-grow">
          <h3 class="text-base font-semibold text-gray-900">${title}</h3>
          <p class="text-sm text-gray-600 mt-1">${coupon.description}</p>
          <div class="flex items-center mt-2 text-xs text-gray-500">
            <i class="far fa-clock mr-1"></i>
            <span>Valid till: <span class="font-medium">${endDate}</span></span>
          </div>
          <div class="flex items-center mt-2 text-xs text-gray-500">
            <i class="fas fa-shopping-cart mr-1"></i>
            <span>Applicable on orders above ₹${coupon.minimumPurchase}</span>
          </div>
        </div>
        <div class="flex-shrink-0 flex items-center">
          <button class="copy-btn px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors duration-200 flex items-center gap-2">
            <i class="far fa-copy"></i>
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  `;
};
const populateCoupons = async coupons => {
  const couponList = document.querySelector('#couponList');
  const couponCountSpan = document.querySelector(
    '#couponModal .text-sm.text-gray-500'
  );

  try {
    // Generate HTML for all coupons
    const couponsHTML = coupons
      .map(coupon => generateCouponCard(coupon))
      .join('');
    // Insert into coupon list
    couponList.innerHTML = couponsHTML;
    // Update coupon count
    couponCountSpan.textContent = `Showing ${coupons.length} active coupons`;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    couponList.innerHTML =
      '<p class="text-sm text-gray-500">No coupons available</p>';
    couponCountSpan.textContent = 'Showing 0 active coupons';
  }
};

// modal functionalities
const modal = document.getElementById('couponModal');
const modalContent = document.getElementById('modalContent');
const modalBackdrop = document.getElementById('modalBackdrop');
const openModalBtn = document.getElementById('view-coupons');
const closeModalBtn = document.querySelectorAll('.closeCouponModalBtn');

// Open modal
openModalBtn.addEventListener('click', async function () {
  try {
    const response = await fetch(`/coupons`);
    const data = await response.json();
    if (data.success) {
      populateCoupons(data.coupons || []);
      modalContent.classList.add('animate-scale-in');
      modalBackdrop.classList.add('animate-fade-in');
      modal.classList.remove('hidden');
      copyCouponCode();
    } else {
      showToast('Something went wrong');
    }
  } catch (error) {
    console.log(error);
    showToast('Server issue ,Please try late');
  }
});

// Close modal functions
function closeModal() {
  modalContent.classList.remove('animate-scale-in');
  modalBackdrop.classList.remove('animate-fade-in');

  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

closeModalBtn.forEach(btn => btn.addEventListener('click', closeModal));
modalBackdrop.addEventListener('click', closeModal);

// Prevent closing when clicking on modal content
modalContent.addEventListener('click', function (e) {
  e.stopPropagation();
});

// Copy button functionality
function copyCouponCode() {
  const copyButtons = document.querySelectorAll('.copy-btn');

  if (copyButtons) {
    copyButtons.forEach(button => {
      button.addEventListener('click', function () {
        const couponCard = this.closest('.coupon-card');
        const couponCode = couponCard.querySelector('.font-bold').textContent;

        // Copy to clipboard
        navigator.clipboard.writeText(couponCode).then(() => {
          // Visual feedback
          this.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
          couponCard.classList.add('copy-animation');

          // Reset after 2 seconds
          setTimeout(() => {
            this.innerHTML = '<i class="far fa-copy"></i><span>Copy</span>';
            couponCard.classList.remove('copy-animation');
          }, 2000);
        });
      });
    });
  }
}

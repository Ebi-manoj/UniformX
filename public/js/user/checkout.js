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
    console.log(paymentMethod);

    ///Fetch the Place Order

    try {
      if (paymentMethod === 'COD') {
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

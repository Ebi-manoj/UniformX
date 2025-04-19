import { showToast } from '../toast.js';
import { AddressFunctionality } from './profile.js';
AddressFunctionality();

////////////////
//Place an order
const addressForm = document.getElementById('addressForm');
const btnPlaceOrder = document.getElementById('btn-placeOrder');

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
    }
  } catch (error) {
    showToast('Something Went Wrong!');
    console.log(error.message);
  }
});

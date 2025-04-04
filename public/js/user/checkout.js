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
  } catch (error) {
    showToast('Something Went Wrong!');
    console.log(error.message);
  }
});

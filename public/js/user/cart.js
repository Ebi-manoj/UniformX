import { showToast } from '../toast.js';

const btnSize = document.getElementById('btn-size');
const quantityInput = document.getElementById('quantity');
const btnAddCart = document.getElementById('addToCart');
let maxStock = 0;

// Event Handlers
btnSize.addEventListener('click', selectSize);
btnAddCart.addEventListener('click', addToCart);

/////////////////////////////////////////////////////////////
///Funtionalities

// Size Selection
function selectSize(e) {
  if (!e.target.classList.contains('size-option')) return;

  btnAddCart.classList.add('cursor-not-allowed', 'opacity-80');
  btnAddCart.setAttribute('disabled', 'true');
  maxStock = e.target.dataset.quantity;
  if (maxStock) {
    btnAddCart.classList.remove('cursor-not-allowed', 'opacity-80');
    btnAddCart.removeAttribute('disabled');
  }
  // Remove selected class from all size options
  const sizeOptions = document.getElementsByClassName('size-option');
  for (let i = 0; i < sizeOptions.length; i++) {
    sizeOptions[i].classList.remove('selected');
  }

  // Add selected class to the clicked option
  e.target.classList.add('selected');
  quantityInput.value = 1;
}

// Quantity selection
const btnDecrement = document.getElementById('btn-decrement');
const btnIncrement = document.getElementById('btn-increment');
// Quantity Selector

btnDecrement.addEventListener('click', decrementQuantity);
btnIncrement.addEventListener('click', incrementQuantity);

function incrementQuantity() {
  let currentQuantity = parseInt(quantityInput.value);

  if (currentQuantity < maxStock) {
    quantityInput.value = currentQuantity + 1;
  }
}

function decrementQuantity() {
  let currentQuantity = parseInt(quantityInput.value);

  if (currentQuantity > 1) {
    quantityInput.value = currentQuantity - 1;
  }
}

async function addToCart(e) {
  const productId = this.dataset.productId;
  console.log(productId);

  const quantity = document.getElementById('quantity').value;
  const size = document
    .querySelector('.size-option.selected')
    ?.textContent.trim();

  //Fetch Post request
  const response = await fetch('/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity, size }),
  });

  const data = await response.json();
  if (data.success) {
    showToast(data.message, 'success');
  } else {
    showToast(data.message || 'something went wrong');
  }
}

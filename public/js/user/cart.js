import { showToast } from '../toast.js';

const productDetail = document.getElementById('productDetail');
const cartSection = document.getElementById('cart-section');
let quantityInput = document.getElementById('quantity');
let maxStock = 0;
let maxQuantity;

if (productDetail) {
  console.log('Product Detail');
  const btnSize = document.getElementById('btn-size');
  const btnAddCart = document.getElementById('addToCart');

  btnSize.addEventListener('click', selectSize);
  btnAddCart.addEventListener('click', addToCart);

  const btnDecrement = document.getElementById('btn-decrement');
  const btnIncrement = document.getElementById('btn-increment');

  btnDecrement.addEventListener('click', () => decrementQuantity('value'));
  btnIncrement.addEventListener('click', () => incrementQuantity('value'));

  function selectSize(e) {
    if (!e.target.classList.contains('size-option')) return;

    btnAddCart.classList.add('cursor-not-allowed', 'opacity-80');
    btnAddCart.setAttribute('disabled', 'true');
    maxStock = parseInt(e.target.dataset.quantity);
    maxQuantity = parseInt(e.target.dataset.maxQuantity);
    if (maxStock) {
      btnAddCart.classList.remove('cursor-not-allowed', 'opacity-80');
      btnAddCart.removeAttribute('disabled');
    }

    const sizeOptions = document.getElementsByClassName('size-option');
    for (let i = 0; i < sizeOptions.length; i++) {
      sizeOptions[i].classList.remove('selected');
    }

    e.target.classList.add('selected');
    quantityInput.value = 1;
  }

  async function addToCart(e) {
    const productId = this.dataset.productId;
    const quantity = document.getElementById('quantity').value;
    const size = document
      .querySelector('.size-option.selected')
      ?.textContent.trim();

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
      document.getElementById('cartText').textContent = data?.cartLength;
      document.getElementById('cartText').classList.remove('hidden');
    } else {
      showToast(data.message || 'something went wrong');
    }
  }
}

if (cartSection) {
  const deleteModal = document.getElementById('deleteModal');
  const cancelDelete = document.getElementById('cancelDelete');
  const removeBtn = document.getElementById('item-box');

  cancelDelete.addEventListener('click', function () {
    deleteModal.classList.add('hidden');
  });

  removeBtn.addEventListener('click', function (e) {
    const removeButton = e.target.closest('.remove-item');
    if (removeButton) {
      const id = removeButton.dataset.productId;
      const size = removeButton.dataset.size;
      confirmDelete(id, size);
      return;
    }

    const incrementBtn = e.target.closest('.btn-increment');
    const decrementBtn = e.target.closest('.btn-decrement');

    if (incrementBtn) {
      const quantityBox = incrementBtn.closest('.quantity');
      const span = quantityBox.querySelector('span');
      maxStock = parseInt(incrementBtn.dataset.quantity);
      maxQuantity = parseInt(incrementBtn.dataset.maxQuantity);
      incrementQuantity('textContent', span);
    }

    if (decrementBtn) {
      const quantityBox = decrementBtn.closest('.quantity');
      const span = quantityBox.querySelector('span');
      decrementQuantity('textContent', span);
    }
  });

  function confirmDelete(id, size) {
    document.getElementById('input-productId').value = id;
    document.getElementById('input-size').value = size;
    deleteModal.classList.remove('hidden');
  }
}

////////////////////////////////////////////////////////////////
/////////////////////////  Utility Functions
function incrementQuantity(property = 'value', element = quantityInput) {
  let currentQuantity = parseInt(element[property]);
  if (currentQuantity < maxStock && currentQuantity < maxQuantity) {
    element[property] = currentQuantity + 1;
  }
}

function decrementQuantity(property = 'value', element = quantityInput) {
  let currentQuantity = parseInt(element[property]);
  if (currentQuantity > 1) {
    element[property] = currentQuantity - 1;
  }
}

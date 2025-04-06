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
  const btnWishlist = document.getElementById('addToWishlist');

  btnSize.addEventListener('click', selectSize);
  btnAddCart.addEventListener('click', addToCart);
  btnWishlist.addEventListener('click', addToWishlist);

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
}
/////////////////////////////////////////////////////////////////////////////////////////
//////////////////////
if (cartSection) {
  const deleteModal = document.getElementById('deleteModal');
  const cancelDelete = document.getElementById('cancelDelete');
  const removeBtn = document.getElementById('item-box');

  cancelDelete.addEventListener('click', function () {
    deleteModal.classList.add('hidden');
  });

  removeBtn.addEventListener('click', async function (e) {
    const removeButton = e.target.closest('.remove-item');
    if (removeButton) {
      const id = removeButton.dataset.productId;
      const size = removeButton.dataset.size;
      confirmDelete(id, size);
      return;
    }

    const updateBtn = e.target.closest('.update-quantity');
    if (updateBtn) {
      const quantityBox = updateBtn.closest('.quantity');
      const span = quantityBox.querySelector('span');
      const productId = updateBtn.dataset.productId;
      const action = updateBtn.dataset.action;
      maxStock = parseInt(updateBtn.dataset.quantity || 9999);
      maxQuantity = parseInt(updateBtn.dataset.maxQuantity || 9999);

      if (action === 'increase') {
        await updateCartQuantity(productId, span, 'increase');
      } else if (action === 'decrease') {
        await updateCartQuantity(productId, span, 'decrease');
      }
    }
  });
  function confirmDelete(id, size) {
    document.getElementById('input-productId').value = id;
    document.getElementById('input-size').value = size;
    deleteModal.classList.remove('hidden');
  }
}

/////////////////////////////////////////////////////////////////////////
/////Funtions

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

async function addToWishlist(e) {
  const icon = document.getElementById('wishlist-icon');
  const productId = this.dataset.productId;
  try {
    const response = await fetch('/add-wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    const data = await response.json();
    if (data.success) {
      showToast(data.message, 'success');
      icon.classList.toggle('far');
      icon.classList.toggle('fas');
    }
  } catch (error) {
    showToast('something went wrong');
  }
}

export async function addToCart(e) {
  const productId = this.dataset.productId;
  const quantity = document.getElementById('quantity').value || 1;
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

async function updateCartQuantity(productId, span, action) {
  console.log(productId, action);

  const currentQuantity = parseInt(span.textContent);
  const newQuantity =
    action === 'increase' ? currentQuantity + 1 : currentQuantity - 1;

  if (newQuantity < 1 || newQuantity > maxStock || newQuantity > maxQuantity) {
    return;
  }

  try {
    const response = await fetch('/cart/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        quantity: newQuantity,
        size: span.dataset.size,
      }),
    });

    const data = await response.json();
    if (data.success) {
      span.textContent = newQuantity;
      // Update order summary
      document.querySelector('.subTotal').textContent = `₹ ${data.subtotal}`;
      document.querySelector(
        '.discountPrice'
      ).textContent = `-₹${data.discount}`;
      document.querySelector('.tax').textContent = `₹ ${data.tax}`;
      document.querySelector('.total').textContent = `₹ ${data.total}`;
      showToast('Cart updated successfully', 'success');
    } else {
      showToast(data.message || 'Failed to update cart');
    }
  } catch (error) {
    showToast('Error updating cart');
    console.error(error);
  }
}

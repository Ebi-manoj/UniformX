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

  // Adding review for the product

  const btnReview = document.getElementById('btnReview');
  if (btnReview) {
    btnReview.addEventListener('click', toggleModal);
  }
  document
    .querySelector('.btnCloseReview')
    .addEventListener('click', toggleModal);
  document.querySelector('.btnSubmit').addEventListener('click', submitReview);

  const starsContainer = document.getElementById('stars');
  let currentRating = 0;

  // Create 5 stars
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.classList = 'text-2xl cursor-pointer text-gray-300';
    star.innerHTML = '★';
    star.dataset.value = i;

    // Hover & Click effects
    star.addEventListener('click', () => {
      currentRating = i;
      updateStars(i);
    });

    star.addEventListener('mouseover', () => updateStars(i));
    star.addEventListener('mouseout', () => updateStars(currentRating));

    starsContainer.appendChild(star);
  }

  function updateStars(rating) {
    const allStars = starsContainer.querySelectorAll('span');
    allStars.forEach((star, idx) => {
      star.classList =
        idx < rating
          ? 'text-yellow-400 text-2xl cursor-pointer'
          : 'text-gray-300 text-2xl cursor-pointer';
    });
  }

  function toggleModal() {
    const modal = document.getElementById('ratingModal');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
  }

  async function submitReview() {
    const productId = this.dataset.productId;
    const comment = document.getElementById('comment').value;
    if (!currentRating || !comment.trim()) {
      showToast('Please provide a rating and comment.');
      return;
    }
    try {
      const response = await fetch(`/add-review/${productId}`, {
        method: 'POST',
        headers: { 'content-Type': 'application/json' },
        body: JSON.stringify({ rating: currentRating, comment }),
      });
      const data = await response.json();
      if (data.success) {
        showToast('Review Posted Successfully', 'success');
        toggleModal();
        currentRating = 0;
        updateStars(0);
        document.getElementById('comment').value = '';
      } else {
        showToast(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.log(error);
      showToast('Something went wrong');
    }
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
      const offerApplied = document.querySelector('.offerApplied');
      span.textContent = newQuantity;
      // Update order summary
      document.querySelector('.subTotal').textContent = `₹ ${data.subtotal}`;
      document.querySelector(
        '.discountPrice'
      ).textContent = `-₹${data.discount}`;
      document.querySelector('.tax').textContent = `₹ ${data.tax}`;
      document.querySelector('.total').textContent = `₹ ${data.total}`;
      if (offerApplied) {
        offerApplied.textContent = `-₹ ${data.offerApplied}`;
      }

      showToast('Cart updated successfully', 'success');
    } else {
      showToast(data.message || 'Failed to update cart');
    }
  } catch (error) {
    showToast('Error updating cart');
    console.error(error);
  }
}

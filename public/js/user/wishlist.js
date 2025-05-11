import { showToast } from '../toast.js';

const modal = document.getElementById('sizeModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addToCartBtn = document.getElementById('addToCartBtn');
const modalProductName = document.getElementById('modalProductName');
const sizeOptions = document.getElementById('sizeOptions');

let currentProduct = null;

document;
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
  button.addEventListener('click', function () {
    const productElement = this.closest('[data-product-id]');
    const productId = productElement.dataset.productId;
    const productName = productElement.dataset.productName;

    currentProduct = { id: productId, name: productName };
    modalProductName.textContent = `Select Size - ${productName}`;

    // Clear previous size options
    sizeOptions.innerHTML = '';

    const sizeArr = JSON.parse(this.dataset.sizes);
    const sizes = sizeArr.map(el => el.size);

    sizes.forEach(size => {
      const div = document.createElement('div');
      div.innerHTML = `
                    <input type="radio" name="size" id="size-${size.toLowerCase()}" value="${size}" class="size-option hidden">
                    <label for="size-${size.toLowerCase()}" class="border rounded-md py-2 px-3 flex items-center justify-center text-sm cursor-pointer hover:bg-gray-50 transition-colors">${size}</label>
                `;
      sizeOptions.appendChild(div);
    });

    modal.style.display = 'block';
  });
});

closeModal.addEventListener('click', () => (modal.style.display = 'none'));
cancelBtn.addEventListener('click', () => (modal.style.display = 'none'));
window.addEventListener('click', event => {
  if (event.target === modal) modal.style.display = 'none';
});

addToCartBtn.addEventListener('click', async function () {
  const selectedSize = document.querySelector('input[name="size"]:checked');

  if (selectedSize) {
    try {
      const response = await fetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProduct.id,
          quantity: 1,
          size: selectedSize.value,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast(data.message, 'success');
        document.getElementById('cartText').textContent = data?.cartLength;
        document.getElementById('cartText').classList.remove('hidden');
        modal.style.display = 'none';
      } else {
        showToast(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      showToast('Error adding to cart');
      console.error(error);
    }
  } else {
    showToast('Please select a size');
  }
});

// remove wishlist item
const removeModal = document.getElementById('deleteModal');
const cancelModal = document.getElementById('cancelModal');
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.querySelector('.confirm-text');
let productId;
let productName;

document.querySelectorAll('.remove-item').forEach(button => {
  button.addEventListener('click', async function () {
    productId = this.dataset.productId;
    productName = this.dataset.productName;
    console.log(productId);

    if (confirmText) {
      confirmText.textContent = `Are you sure you want to Remove ${productName}? This action cannot be undone.`;
    }
    removeModal.classList.remove('hidden');
  });
});

if (cancelModal) {
  cancelModal.addEventListener('click', function () {
    removeModal.classList.add('hidden');
  });
}
if (confirmModal) {
  confirmModal.addEventListener('click', async function () {
    try {
      const response = await fetch('/remove-wishlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      if (data.success) {
        showToast('Item removed SuccessFully', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast(data.message || 'Failed to remove item');
      }
    } catch (error) {
      showToast('Error removing item');
      console.error(error);
    } finally {
      removeModal.classList.add('hidden');
    }
  });
}

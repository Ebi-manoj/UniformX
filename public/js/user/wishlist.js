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

document.querySelectorAll('.remove-item').forEach(button => {
  button.addEventListener('click', async function () {
    const item = this.closest('[data-product-id]');
    const productId = item.dataset.productId;
    const productName = item.dataset.productName;

    if (confirm(`Remove ${productName} from your wishlist?`)) {
      try {
        const response = await fetch('/wishlist/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        const data = await response.json();
        if (data.success) {
          item.style.opacity = '0';
          item.style.transition = 'opacity 0.3s ease';
          setTimeout(() => item.remove(), 300);
        } else {
          alert(data.message || 'Failed to remove item');
        }
      } catch (error) {
        alert('Error removing item');
        console.error(error);
      }
    }
  });
});

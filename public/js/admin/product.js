import { showToast } from '../toast.js';

// Filter functionality
const mainCategoryFilter = document.getElementById('mainCategoryFilter');
const clubFilter = document.getElementById('clubFilter');
const stockFilter = document.getElementById('stockFilter');
const searchInput = document.getElementById('searchInput');

// Apply filters when changed
[mainCategoryFilter, clubFilter, stockFilter].forEach(filter => {
  filter.addEventListener('change', applyFilters);
});

// Apply search when typing
searchInput.addEventListener('input', debounce(applyFilters, 300));

function applyFilters() {
  const categorySelect = document.getElementById('mainCategoryFilter');
  const clubId = clubFilter.value;
  const stockStatus = stockFilter.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  // Get selected categories as an array
  const selectedCategories = Array.from(categorySelect.selectedOptions).map(
    option => option.value
  );

  // Build query string
  const queryParams = new URLSearchParams(window.location.search);

  if (selectedCategories.length > 0)
    queryParams.set(
      'category',
      selectedCategories.join(',')
    ); // Multiple categories
  else queryParams.delete('category');

  if (clubId) queryParams.set('club', clubId);
  else queryParams.delete('club');

  if (stockStatus) queryParams.set('stock', stockStatus);
  else queryParams.delete('stock');

  if (searchTerm) queryParams.set('search', searchTerm);
  else queryParams.delete('search');

  // Reset to page 1 when filters change
  queryParams.set('page', '1');

  // Redirect with new filters
  window.location.href =
    window.location.pathname + '?' + queryParams.toString();
}

// Restore selected filters after page reload
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);

  // Restore selected categories
  const selectedCategories = urlParams.get('category')
    ? urlParams.get('category').split(',')
    : [];
  const categorySelect = document.getElementById('mainCategoryFilter');

  if (categorySelect) {
    Array.from(categorySelect.options).forEach(option => {
      option.selected = selectedCategories.includes(option.value);
    });
  }

  // Restore other filters
  if (urlParams.get('club')) clubFilter.value = urlParams.get('club');
  if (urlParams.get('stock')) stockFilter.value = urlParams.get('stock');
  if (urlParams.get('search')) searchInput.value = urlParams.get('search');
};

// Debounce function to limit how often a function can be called
function debounce(func, delay) {
  let timeout;
  return function () {
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Available sizes
const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
let sizeCounter = 0;

// Image Modal Functionality
let currentImages = [];
let currentIndex = 0;

// Update the main image in the modal
function updateModalImage() {
  const mainImage = document.getElementById('mainImage');
  if (currentImages.length === 0) return;

  mainImage.src = currentImages[currentIndex];
  mainImage.alt = `Product image ${currentIndex + 1}`;

  // Update active thumbnail
  document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
    if (index === currentIndex) {
      thumb.classList.add('ring-2', 'ring-purple-500');
    } else {
      thumb.classList.remove('ring-2', 'ring-purple-500');
    }
  });
}

// Render thumbnail images
function renderThumbnails() {
  const thumbnailContainer = document.getElementById('thumbnailContainer');
  thumbnailContainer.innerHTML = '';

  currentImages.forEach((image, index) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = `thumbnail cursor-pointer w-16 h-16 flex-shrink-0 border rounded ${
      index === currentIndex ? 'ring-2 ring-purple-500' : ''
    }`;

    const img = document.createElement('img');
    img.src = image;
    img.alt = `Thumbnail ${index + 1}`;
    img.className = 'w-full h-full object-contain';

    thumbnail.appendChild(img);

    thumbnail.addEventListener('click', () => {
      currentIndex = index;
      updateModalImage();
    });

    thumbnailContainer.appendChild(thumbnail);
  });
}

// Open the modal for adding a product
function openAddProductModal() {
  const modal = document.getElementById('addProductModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('addProductForm');
  const formMode = document.getElementById('formMode');
  const productIdInput = document.getElementById('productId');

  // Reset the form
  form.reset();
  document.getElementById('imagePreviewContainer').innerHTML = '';
  document.getElementById('sizesContainer').innerHTML = '';

  // Set to "add" mode
  modalTitle.textContent = 'Add Product';
  form.action = '/admin/add-products';
  formMode.value = 'add';
  productIdInput.value = '';

  // Add initial size row
  addSizeRow();

  // Show the modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Open the modal for editing a product
async function openEditProductModal(slug) {
  try {
    // Fetch the product data
    const response = await fetch(`/admin/product/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product data');
    }
    const product = await response.json();

    const modal = document.getElementById('addProductModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('addProductForm');
    const formMode = document.getElementById('formMode');
    const productIdInput = document.getElementById('productId');

    // Reset the form
    form.reset();
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('sizesContainer').innerHTML = '';

    // Set to "edit" mode
    modalTitle.textContent = 'Edit Product';
    form.action = `/admin/product/${slug}`;
    form.method = 'POST'; // We'll override this to PUT in the form submission
    formMode.value = 'edit';
    productIdInput.value = product._id;

    // Prefill the form fields
    document.getElementById('title').value = product.title || '';
    document.getElementById('type').value = product.type || '';
    document.getElementById('price').value = product.price || '';
    document.getElementById('category_id').value =
      product.category_id?._id || '';
    document.getElementById('club_id').value = product.club_id?._id || '';
    document.getElementById('description').value = product.description || '';
    document.getElementById('customColorInput').value = product.color || '';
    document.getElementById('customColorBox').style.backgroundColor =
      product.color || '';

    // Prefill sizes
    if (product.sizes && product.sizes.length > 0) {
      product.sizes.forEach(sizeObj => {
        addSizeRow(sizeObj.size, sizeObj.stock_quantity);
      });
    } else {
      addSizeRow();
    }

    // Prefill image previews
    if (product.image_url && product.image_url.length > 0) {
      const previewContainer = document.getElementById('imagePreviewContainer');
      product.image_url.forEach(image => {
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'relative';

        const preview = document.createElement('div');
        preview.className =
          'w-20 h-20 border rounded-md overflow-hidden bg-gray-100';

        const img = document.createElement('img');
        img.src = image;
        img.className = 'w-full h-full object-contain';
        img.alt = 'Product image preview';

        const removeBtn = document.createElement('button');
        removeBtn.className =
          'absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-red-500';
        removeBtn.type = 'button';
        removeBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        `;
        removeBtn.onclick = function () {
          previewWrapper.remove();
        };

        preview.appendChild(img);
        previewWrapper.appendChild(preview);
        previewWrapper.appendChild(removeBtn);
        previewContainer.appendChild(previewWrapper);
      });
    }

    // Show the modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } catch (error) {
    console.error('Error opening edit modal:', error);
    showToast('Failed to load product data', 'error');
  }
}

// Close the modal
function closeAddProductModal() {
  document.getElementById('addProductModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// Add a new size row (with optional prefilled values)
function addSizeRow(size = '', quantity = '') {
  const sizesContainer = document.getElementById('sizesContainer');
  const rowId = `size-row-${sizeCounter++}`;

  const row = document.createElement('div');
  row.className = 'size-row flex items-center gap-4 p-3 bg-gray-50 rounded-md';
  row.id = rowId;

  // Create size dropdown
  const sizeSelectWrapper = document.createElement('div');
  sizeSelectWrapper.className = 'w-1/3';

  const sizeLabel = document.createElement('label');
  sizeLabel.className = 'block text-xs font-medium text-gray-500 mb-1';
  sizeLabel.textContent = 'Size';

  const sizeSelect = document.createElement('select');
  sizeSelect.className =
    'size-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
  sizeSelect.name = 'sizesSize';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select size';
  sizeSelect.appendChild(defaultOption);

  availableSizes.forEach(s => {
    const option = document.createElement('option');
    option.value = s;
    option.textContent = s;
    if (s === size) option.selected = true;
    sizeSelect.appendChild(option);
  });

  sizeSelectWrapper.appendChild(sizeLabel);
  sizeSelectWrapper.appendChild(sizeSelect);

  // Create quantity input
  const quantityWrapper = document.createElement('div');
  quantityWrapper.className = 'w-1/3';

  const quantityLabel = document.createElement('label');
  quantityLabel.className = 'block text-xs font-medium text-gray-500 mb-1';
  quantityLabel.textContent = 'Quantity';

  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.className =
    'stock-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
  quantityInput.name = 'sizesStock';
  quantityInput.min = '0';
  quantityInput.value = quantity;

  quantityWrapper.appendChild(quantityLabel);
  quantityWrapper.appendChild(quantityInput);

  // Create remove button
  const removeButtonWrapper = document.createElement('div');
  removeButtonWrapper.className = 'flex items-end pb-1';

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'text-red-500 hover:text-red-700 focus:outline-none';
  removeButton.innerHTML = `
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  `;
  removeButton.onclick = function () {
    document.getElementById(rowId).remove();
  };

  removeButtonWrapper.appendChild(removeButton);

  row.appendChild(sizeSelectWrapper);
  row.appendChild(quantityWrapper);
  row.appendChild(removeButtonWrapper);

  sizesContainer.appendChild(row);
}

// Handle image preview
function handleImagePreview(input) {
  const previewContainer = document.getElementById('imagePreviewContainer');
  previewContainer.innerHTML = '';

  if (input.files) {
    Array.from(input.files).forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'relative';

        const preview = document.createElement('div');
        preview.className =
          'w-20 h-20 border rounded-md overflow-hidden bg-gray-100';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'w-full h-full object-contain';
        img.alt = 'Product image preview';

        const removeBtn = document.createElement('button');
        removeBtn.className =
          'absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-red-500';
        removeBtn.type = 'button';
        removeBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        `;
        removeBtn.onclick = function () {
          previewWrapper.remove();
        };

        preview.appendChild(img);
        previewWrapper.appendChild(preview);
        previewWrapper.appendChild(removeBtn);
        previewContainer.appendChild(previewWrapper);
      };

      reader.readAsDataURL(file);
    });
  }
}

// Form validation
function validateAddProductForm() {
  const title = document.getElementById('title').value.trim();
  const type = document.getElementById('type').value.trim();
  const price = document.getElementById('price').value.trim();
  const category = document.getElementById('category_id').value;
  const club = document.getElementById('club_id').value;
  const description = document.getElementById('description').value.trim();
  const images = document.getElementById('productImages').files.length;
  const sizesContainer = document.getElementById('sizesContainer');
  const sizes = sizesContainer.querySelectorAll('.size-input');
  const stockQuantities = sizesContainer.querySelectorAll('.stock-input');

  if (!title) {
    showToast('Title is required!', 'warning');
    return false;
  }

  if (!type) {
    showToast('Type is required!', 'warning');
    return false;
  }

  if (!price || parseFloat(price) <= 0) {
    showToast('Valid Price is required!', 'warning');
    return false;
  }

  if (!category) {
    showToast('Category is required!', 'warning');
    return false;
  }

  if (!club) {
    showToast('Club is required!', 'warning');
    return false;
  }

  if (!description) {
    showToast('Description is required!', 'warning');
    return false;
  }

  if (images === 0 && document.getElementById('formMode').value === 'add') {
    showToast('At least one image is required!', 'warning');
    return false;
  }

  return true;
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function () {
  // Image Modal Setup
  const imageModal = document.getElementById('imageModal');
  const modalTitle = document.getElementById('modalTitle');
  const closeModal = document.getElementById('closeModal');
  const prevImage = document.getElementById('prevImage');
  const nextImage = document.getElementById('nextImage');

  // Close modal
  closeModal.addEventListener('click', () => {
    imageModal.classList.add('hidden');
    document.body.style.overflow = '';
  });

  // Close modal when clicking outside
  imageModal.addEventListener('click', event => {
    if (event.target === imageModal) {
      imageModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

  // Navigate to previous image
  prevImage.addEventListener('click', () => {
    if (currentImages.length <= 1) return;
    currentIndex =
      (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateModalImage();
  });

  // Navigate to next image
  nextImage.addEventListener('click', () => {
    if (currentImages.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateModalImage();
  });

  // Keyboard navigation
  document.addEventListener('keydown', event => {
    if (imageModal.classList.contains('hidden')) return;
    if (event.key === 'Escape') {
      imageModal.classList.add('hidden');
      document.body.style.overflow = '';
    } else if (event.key === 'ArrowLeft') {
      prevImage.click();
    } else if (event.key === 'ArrowRight') {
      nextImage.click();
    }
  });

  // View Images button in the product list
  document.querySelectorAll('.view-images-btn').forEach(button => {
    button.addEventListener('click', function () {
      const productId = this.getAttribute('data-product-id');
      const title = this.getAttribute('data-title');
      const imagesJson = this.getAttribute('data-images');

      try {
        currentImages = JSON.parse(imagesJson);
        currentIndex = 0;

        modalTitle.textContent = title;
        updateModalImage();
        renderThumbnails();

        imageModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      } catch (error) {
        console.error('Error parsing image data:', error);
        showToast('Failed to load images', 'error');
      }
    });
  });

  // Add Product button
  document
    .getElementById('addProductBtn')
    .addEventListener('click', openAddProductModal);

  // Edit Product buttons
  document.querySelectorAll('.edit-product-btn').forEach(button => {
    button.addEventListener('click', function () {
      const slug = this.getAttribute('data-id');
      openEditProductModal(slug);
    });
  });

  // Add Size button
  document.getElementById('addSizeBtn').addEventListener('click', addSizeRow);

  // Close modal when clicking outside
  document
    .getElementById('addProductModal')
    .addEventListener('click', function (event) {
      if (event.target === this) {
        closeAddProductModal();
      }
    });

  // Close modal with Escape key
  document.addEventListener('keydown', function (event) {
    if (
      event.key === 'Escape' &&
      !document.getElementById('addProductModal').classList.contains('hidden')
    ) {
      closeAddProductModal();
    }
  });

  // Close modal button
  document
    .getElementById('closeBtn')
    .addEventListener('click', closeAddProductModal);

  // Color input
  const colorInput = document.getElementById('customColorInput');
  const colorBox = document.getElementById('customColorBox');

  colorInput.addEventListener('input', () => {
    const colorValue = colorInput.value.trim().toLowerCase();
    colorBox.style.backgroundColor = colorValue;
  });

  // Image preview
  const imageInput = document.getElementById('productImages');
  if (imageInput) {
    imageInput.addEventListener('change', function () {
      handleImagePreview(imageInput);
    });
  }

  // Form submission
  document
    .getElementById('addProductForm')
    .addEventListener('submit', async function (event) {
      event.preventDefault();

      if (!validateAddProductForm()) {
        return;
      }

      const form = this;
      const formMode = document.getElementById('formMode').value;
      const formData = new FormData(form);

      try {
        let response;
        closeAddProductModal();
        if (formMode === 'add') {
          response = await fetch('/admin/add-products', {
            method: 'POST',
            body: formData,
          });
        } else {
          // For edit, override the method to PUT
          formData.append('_method', 'PUT');
          response = await fetch(form.action, {
            method: 'POST',
            body: formData,
          });
        }

        const result = await response.json();
        if (response.ok) {
          showToast(result.message || 'Product saved successfully!', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast(result.error || 'Failed to save product', 'error');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        showToast('An error occurred while saving the product', 'error');
      }
    });
  // toggle product status
  document.querySelectorAll('.toggle-product-btn').forEach(el =>
    el.addEventListener('click', async function () {
      const id = this.getAttribute('data-id');
      try {
        const response = await fetch(`/admin/toggle-product/${id}`, {
          method: 'PATCH',
        });
        const result = await response.json();
        if (response.ok) {
          showToast(result.message || 'Product Disabled!', 'success');
        }
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        console.log('error in deleting product');
        showToast(result.message || 'Unexpected Error Occured!');
      }
    })
  );
});

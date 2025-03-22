import { showToast } from '../toast.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Product js loaded');

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
    const categoryId = mainCategoryFilter.value;
    const clubId = clubFilter.value;
    const stockStatus = stockFilter.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    // Build query string
    const queryParams = new URLSearchParams(window.location.search);

    if (categoryId) queryParams.set('category', categoryId);
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

  // Debounce function to limit how often a function can be called
  function debounce(func, delay) {
    let timeout;
    return function () {
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Image Modal Functionality
  const imageModal = document.getElementById('imageModal');
  const modalTitle = document.getElementById('modalTitle');
  const mainImage = document.getElementById('mainImage');
  const thumbnailContainer = document.getElementById('thumbnailContainer');
  const closeModal = document.getElementById('closeModal');
  const prevImage = document.getElementById('prevImage');
  const nextImage = document.getElementById('nextImage');

  let currentImages = [];
  let currentIndex = 0;

  // Open modal when view images button is clicked
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
      }
    });
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    imageModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
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

  // Update the main image in the modal
  function updateModalImage() {
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
});

/////Add Product Modal
// Available sizes
const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
let sizeCounter = 0;

// Open the modal
function openAddProductModal() {
  document.getElementById('addProductModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent scrolling

  // Add initial size row
  if (document.querySelectorAll('.size-row').length === 0) {
    addSizeRow();
  }
}

// Close the modal
function closeAddProductModal() {
  document.getElementById('addProductModal').classList.add('hidden');
  document.body.style.overflow = ''; // Restore scrolling
}

// Add a new size row
function addSizeRow() {
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
  sizeSelect.required = true;

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select size';
  sizeSelect.appendChild(defaultOption);

  // Add size options
  availableSizes.forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = size;
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
  quantityInput.required = true;

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

  // Add all elements to the row
  row.appendChild(sizeSelectWrapper);
  row.appendChild(quantityWrapper);
  row.appendChild(removeButtonWrapper);

  // Add row to container
  sizesContainer.appendChild(row);
}

// Handle image preview
function handleImagePreview(input) {
  const previewContainer = document.getElementById('imagePreviewContainer');

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

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function () {
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
  //   Show the modal
  document
    .getElementById('addProductBtn')
    .addEventListener('click', openAddProductModal);

  //   add colors

  const colorPicker = document.getElementById('customColorPicker');
  const colorBox = document.getElementById('customColorBox');

  colorPicker.addEventListener('input', function () {
    colorBox.style.backgroundColor = colorPicker.value;
  });
  //   image preview working
  const imageInput = document.getElementById('productImages');

  if (imageInput) {
    imageInput.addEventListener('change', function () {
      handleImagePreview(imageInput);
    });
  }

  //Form Validation
  const validateAddProductForm = function () {
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

    if (images === 0) {
      showToast('At least one image is required!', 'warning');
      return false;
    }

    if (sizes.length < 1 || stockQuantities.length < 1) {
      showToast('At least one size and stock quantity is required!', 'warning');
      return false;
    }

    let isValidSizes = true;
    sizes.forEach((sizeInput, index) => {
      const sizeValue = sizeInput.value.trim();
      const stockValue = stockQuantities[index].value.trim();

      if (!sizeValue || !stockValue || parseInt(stockValue) < 1) {
        isValidSizes = false;
      }
    });

    if (!isValidSizes) {
      showToast('All sizes must have valid stock quantities!', 'warning');
      return false;
    }

    return true;
  };

  // Form submission
  document
    .getElementById('addProductForm')
    .addEventListener('submit', function (event) {
      event.preventDefault();
      if (validateAddProductForm()) {
        this.submit();
        closeAddProductModal();
      }
    });
});

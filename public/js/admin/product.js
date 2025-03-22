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
function openAddProductModal() {
  document.getElementById('addProductModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close the modal
function closeAddProductModal() {
  document.getElementById('addProductModal').classList.add('hidden');
  document.body.style.overflow = ''; // Restore scrolling
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
          // This is a bit tricky since we can't directly modify the FileList
          // In a real implementation, you'd track which files to exclude when submitting
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
// Add product when Clicking
document
  .getElementById('addProductBtn')
  .addEventListener('click', openAddProductModal);

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

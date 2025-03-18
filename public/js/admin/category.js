// DOM Elements
const modal = document.getElementById('modal');
const deleteModal = document.getElementById('deleteModal');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const closeBtn = document.getElementById('closeBtn');
const cancelDelete = document.getElementById('cancelDelete');
const categoryForm = document.getElementById('categoryForm');
const editButtons = document.querySelector('.edit-category-btn');

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
// Toast notification function
const showToast = function (message, icon = 'error') {
  Swal.fire({
    position: 'bottom-end',
    icon: icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    toast: true,
  });
};

// Modal functions
const openModal = function () {
  modal.classList.remove('hidden');
  // Reset form when opening for new category
  if (categoryForm.action.includes('add-category')) {
    categoryForm.reset();
    document.getElementById('modalTitle').textContent = 'Add Category';
  }
};

const closeModal = function () {
  modal.classList.add('hidden');
};

const closeDeleteModal = function () {
  deleteModal.classList.add('hidden');
};

// Form validation
const validateForm = function () {
  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const image = document.getElementById('image').files.length;
  const isEdit = categoryForm.action.includes('edit-category');

  if (!name) {
    showToast('Name is required!', 'warning');
    return false;
  }

  if (!description) {
    showToast('Description is required!', 'warning');
    return false;
  }

  // Only require image for new categories or if no current image exists
  if (image === 0 && !isEdit) {
    showToast('Image is required!', 'warning');
    return false;
  }

  return true;
};

// Edit category function
function editCategory(id, name, description) {
  // Update form attributes
  categoryForm.action = `/admin/edit-category/${id}`;
  document.getElementById('modalTitle').textContent = 'Edit Category';

  // Set form values
  document.getElementById('categoryId').value = id;
  document.getElementById('name').value = name || '';
  document.getElementById('description').value = description || '';
  document.getElementById('image').value = '';

  // Show modal
  openModal();
}

// Delete confirmation
function confirmDelete(id) {
  console.log(id);

  document.getElementById('deleteCategoryId').value = id;
  deleteModal.classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  // Modal controls
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', function () {
      categoryForm.action = '/admin/add-category';
      categoryForm.reset();
      document.getElementById('modalTitle').textContent = 'Add Category';
      document.getElementById('categoryId').value = '';
      openModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (cancelDelete) {
    cancelDelete.addEventListener('click', closeDeleteModal);
  }

  // Close modal on outside click
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  deleteModal.addEventListener('click', event => {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Close modals on escape key
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal();
      closeDeleteModal();
    }
  });

  // Form submission
  if (categoryForm) {
    categoryForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (validateForm()) {
        // Submit the form and show success message
        this.submit();
        closeModal();
      }
    });
  }
  // edit-caegory
  document.addEventListener('click', function (event) {
    // Handle edit buttons
    if (event.target.closest('.edit-category-btn')) {
      const button = event.target.closest('.edit-category-btn');
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      const description = button.getAttribute('data-description');
      const imagePath = button.getAttribute('data-image');
      console.log('Edit');
      console.log(id, name, description, imagePath);

      editCategory(id, name, description, imagePath);
    }

    // Handle delete buttons
    if (event.target.closest('.delete-category-btn')) {
      const button = event.target.closest('.delete-category-btn');
      const id = button.getAttribute('data-id');
      confirmDelete(id);
    }
  });
});

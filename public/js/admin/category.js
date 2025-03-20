// DOM Elements
const modal = document.getElementById('modal');
const deleteModal = document.getElementById('deleteModal');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const closeBtn = document.getElementById('closeBtn');
const cancelDelete = document.getElementById('cancelDelete');
const categoryForm = document.getElementById('categoryForm');

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
  const categoryId = document.getElementById('category_main')?.value;
  const image = document.getElementById('image').files.length;
  const isEdit = categoryForm.action.includes('edit');
  const isClubForm = categoryForm.action.includes('club');

  if (!name) {
    showToast('Name is required!', 'warning');
    return false;
  }

  if (!description) {
    showToast('Description is required!', 'warning');
    return false;
  }

  // Club form requires category selection
  if (isClubForm && !categoryId) {
    showToast('Main Category is required!', 'warning');
    return false;
  }

  // Image required only for new entries, not edits
  if (image === 0 && !isEdit) {
    showToast('Image is required!', 'warning');
    return false;
  }

  return true;
};

// Edit function (for both category and club)
function editItem(
  id,
  name,
  description,
  categoryId = '',
  image = '',
  isClub = false
) {
  categoryForm.action = isClub
    ? `/admin/edit-club/${id}`
    : `/admin/edit-category/${id}`;
  document.getElementById('modalTitle').textContent = isClub
    ? 'Edit Club'
    : 'Edit Category';

  // Set form values
  document.getElementById('categoryId').value = id;
  document.getElementById('name').value = name || '';
  document.getElementById('description').value = description || '';
  if (isClub && document.getElementById('category_main')) {
    document.getElementById('category_main').value = categoryId || '';
  }
  document.getElementById('image').value = '';

  openModal();
}

// Toggle function (for both category and club)
function toggleItem(id, isClub = false) {
  const url = isClub
    ? `/admin/toggle-club/${id}`
    : `/admin/toggle-category/${id}`;
  fetch(url, { method: 'POST' })
    .then(response => {
      if (!response.ok) throw new Error('Toggle failed');
      showToast('Status updated successfully!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    })
    .catch(err => {
      console.error('Toggle error:', err);
      showToast('Failed to update status', 'error');
    });
}

// Delete confirmation
function confirmDelete(id, isClub = false) {
  document.getElementById('deleteCategoryId').value = id;
  document.getElementById('deleteForm').action = isClub
    ? `/admin/delete-club/${id}`
    : `/admin/delete-category/${id}`;
  deleteModal.classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  // Add new item (category or club)
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', function () {
      const isClubForm = this.dataset.type === 'club';
      categoryForm.action = isClubForm
        ? '/admin/add-club'
        : '/admin/add-category';
      categoryForm.reset();
      document.getElementById('modalTitle').textContent = isClubForm
        ? 'Add Club'
        : 'Add Category';
      document.getElementById('categoryId').value = '';
      if (isClubForm && document.getElementById('category_main')) {
        document.getElementById('category_main').value = '';
      }
      openModal();
    });
  }

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Cancel delete
  if (cancelDelete) {
    cancelDelete.addEventListener('click', closeDeleteModal);
  }

  // Close modal on outside click
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });

  deleteModal.addEventListener('click', event => {
    if (event.target === deleteModal) closeDeleteModal();
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
        this.submit();
        closeModal();
      }
    });
  }

  // Button handlers for edit, toggle, and delete
  document.addEventListener('click', function (event) {
    // Determine if we're in a club context
    const isClub = event.target.closest('.club-category-template') !== null;

    // Edit button
    if (event.target.closest('.edit-category-btn')) {
      const button = event.target.closest('.edit-category-btn');
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      const description = button.getAttribute('data-description');
      const categoryId = button.getAttribute('data-parent') || '';
      const image = button.getAttribute('data-image') || '';
      editItem(id, name, description, categoryId, image, isClub);
    }

    // Toggle button
    if (event.target.closest('.toggle-category-btn')) {
      const button = event.target.closest('.toggle-category-btn');
      const id = button.getAttribute('data-id');
      toggleItem(id, isClub);
    }

    // Delete button
    if (event.target.closest('.delete-category-btn')) {
      const button = event.target.closest('.delete-category-btn');
      const id = button.getAttribute('data-id');
      confirmDelete(id, isClub);
    }
  });
});

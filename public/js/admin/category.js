// DOM Elements
const modal = document.getElementById('modal');
const deleteModal = document.getElementById('deleteModal');
const addCategoryBtn = document.getElementById('addCategoryBtn'); // For Main Category
const addClubBtn = document.getElementById('addClubBtn'); // Add this for Club Category if you have a separate button
const closeBtn = document.getElementById('closeBtn');
const cancelDelete = document.getElementById('cancelDelete');
const categoryForm = document.getElementById('categoryForm');
const editButtons = document.querySelector('.edit-category-btn');
const editClubButtons = document.querySelector('.edit-club-btn'); // Add this for club edit buttons if needed

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
const openModal = function (formType = 'category') {
  modal.classList.remove('hidden');
  if (formType === 'club') {
    categoryForm.action = '/admin/club-category';
    categoryForm.reset();
    document.getElementById('modalTitle').textContent = 'Club Category';
    document.getElementById('categoryId').value = '';
    if (document.getElementById('status'))
      document.getElementById('status').value = ''; // Reset dropdown
  } else {
    // Main Category
    if (categoryForm.action.includes('add-category')) {
      categoryForm.reset();
      document.getElementById('modalTitle').textContent = 'Add Category';
      document.getElementById('categoryId').value = '';
    }
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
  const status = document.getElementById('category_main')
    ? document.getElementById('category_main').value
    : null;
  const isEdit =
    categoryForm.action.includes('edit-category') ||
    categoryForm.action.includes('edit-club');
  const isClubForm =
    categoryForm.action.includes('club-category') ||
    categoryForm.action.includes('edit-club');

  if (!name) {
    showToast('Name is required!', 'warning');
    return false;
  }

  if (!description) {
    showToast('Description is required!', 'warning');
    return false;
  }

  // Validate status for club form
  if (isClubForm && !status) {
    showToast('Main Category is required!', 'warning');
    return false;
  }

  // Only require image for new entries (not edits)
  if (image === 0 && !isEdit) {
    showToast('Image is required!', 'warning');
    return false;
  }

  return true;
};

// Edit functions
function editCategory(id, name, description) {
  categoryForm.action = `/admin/edit-category/${id}`;
  document.getElementById('modalTitle').textContent = 'Edit Category';
  document.getElementById('categoryId').value = id;
  document.getElementById('name').value = name || '';
  document.getElementById('description').value = description || '';
  document.getElementById('image').value = ''; // Reset file input
  openModal('category');
}

function editClub(id, name, description, mainCategory) {
  categoryForm.action = `/admin/edit-club/${id}`; // Assuming an edit-club route
  document.getElementById('modalTitle').textContent = 'Edit Club Category';
  document.getElementById('categoryId').value = id;
  document.getElementById('name').value = name || '';
  document.getElementById('description').value = description || '';
  if (document.getElementById('status'))
    document.getElementById('status').value = mainCategory || ''; // Set dropdown
  document.getElementById('image').value = ''; // Reset file input
  openModal('club');
}

// Delete confirmation
function confirmDelete(id) {
  document.getElementById('deleteCategoryId').value = id;
  deleteModal.classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  // Modal controls for Main Category
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => openModal('category'));
  }

  // Modal controls for Club Category
  if (addClubBtn) {
    addClubBtn.addEventListener('click', () => openModal('club'));
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
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

  // Edit and delete handlers
  document.addEventListener('click', function (event) {
    // Handle edit category buttons
    if (event.target.closest('.edit-category-btn')) {
      const button = event.target.closest('.edit-category-btn');
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      const description = button.getAttribute('data-description');
      const imagePath = button.getAttribute('data-image');
      console.log('Edit Category:', id, name, description, imagePath);
      editCategory(id, name, description);
    }

    // Handle edit club buttons
    if (event.target.closest('.edit-club-btn')) {
      const button = event.target.closest('.edit-club-btn');
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      const description = button.getAttribute('data-description');
      const mainCategory = button.getAttribute('data-main-category'); // Store category value here
      console.log('Edit Club:', id, name, description, mainCategory);
      editClub(id, name, description, mainCategory);
    }

    // Handle delete buttons
    if (event.target.closest('.delete-category-btn')) {
      const button = event.target.closest('.delete-category-btn');
      const id = button.getAttribute('data-id');
      console.log('Delete:', id);
      confirmDelete(id);
    }
  });
});

const addCategoryBtn = document.getElementById('addCategoryBtn');
const closeBtn = document.getElementById('closeBtn');
const modal = document.getElementById('modal');

const openModal = function () {
  document.getElementById('modal').classList.remove('hidden');
};

const closeModal = function () {
  document.getElementById('modal').classList.add('hidden');
};
addCategoryBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);

const showToast = function (message, icon = 'error') {
  Swal.fire({
    position: 'bottom-end',
    icon: icon,
    title: message,
    showConfirmButton: false,
    timer: 3000, // Auto-close after 3 seconds
    toast: true,
  });
};

modal.addEventListener('click', event => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

categoryForm.addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form submission

  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const image = document.getElementById('image').files.length; // Check if file is selected

  // Validation Checks
  if (!name) {
    showToast('Name is required!', 'warning');
    return;
  }
  if (!description) {
    showToast('Description is required!', 'warning');
    return;
  }
  if (image === 0) {
    showToast('Image is required!', 'warning');
    return;
  }

  // Show success toast
  showToast('Category added successfully!', 'success');

  // Close the modal after success
  closeModal();

  // Reset the form after submission
  categoryForm.reset();
});

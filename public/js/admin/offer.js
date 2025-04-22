import { showToast } from '../toast.js';
import { addOfferSchema } from '../validation.js';

const addOfferForm = document.getElementById('addOfferForm');
const toggleType = document.querySelectorAll('.toggle-type');
const editBtn = document.getElementById('edit-btn');
const editModal = document.getElementById('editModal');
const editOfferForm = document.getElementById('editOfferForm');

if (addOfferForm) {
  document.addEventListener('DOMContentLoaded', disablePastDates);
}

// toggle product and categories selection
if (toggleType) {
  toggleType.forEach(btn =>
    btn.addEventListener('click', function (e) {
      toggleSelection(this.value);
    })
  );
}

if (addOfferForm) {
  addOfferForm.addEventListener('submit', function (e) {
    e.preventDefault();
    validateAndSubmit(addOfferForm);
  });
}

if (editModal) {
  editOfferForm.addEventListener('submit', function (e) {
    e.preventDefault();
    validateAndSubmit(editOfferForm);
  });

  // close functionalites
  document
    .getElementById('closeEditModal')
    .addEventListener('click', function () {
      document.getElementById('editModal').classList.add('hidden');
    });

  document
    .getElementById('cancelEditModal')
    .addEventListener('click', function () {
      document.getElementById('editModal').classList.add('hidden');
    });
}

if (editBtn) {
  editBtn.addEventListener('click', async function (e) {
    const id = this.dataset.id;
    try {
      const response = await fetch(`/admin/offer/${id}`);
      const data = await response.json();
      if (!data.success)
        return showToast(data.message || 'Something went Wrong');
      fillEditForm(data.offer, data.products, data.categories);
      editModal.classList.remove('hidden');
    } catch (error) {
      console.log(error);
      showToast('Something went Wrong');
    }
  });
}

// fill offer edit form function
function fillEditForm(offer, products, categories) {
  console.log(offer);

  // Fill simple fields
  document.getElementById('edit-offer-id').value = offer._id;
  document.getElementById('edit-offer-name').value = offer.offerName;
  document.getElementById('edit-offer-discount').value =
    offer.discountPercentage;
  document
    .querySelectorAll('.toggle-type')
    .forEach(cb => (cb.checked = cb.value === offer.type));

  toggleSelection(offer.type); // show/hide product/category

  // Fill checkboxes
  const productContainer = document.getElementById('edit-product-checkboxes');
  const categoryContainer = document.getElementById('edit-category-checkboxes');
  productContainer.innerHTML = '';
  categoryContainer.innerHTML = '';

  products.forEach(product => {
    const isChecked = offer.product?.includes(product._id);
    productContainer.innerHTML += `
        <label>
          <input type="checkbox" name="products[]" value="${product._id}" ${
      isChecked ? 'checked' : ''
    }>
          ${product.title}
        </label>`;
  });

  categories.forEach(category => {
    const isChecked = offer.category?.includes(category._id);
    categoryContainer.innerHTML += `
        <label>
          <input type="checkbox" name="categories[]" value="${category._id}" ${
      isChecked ? 'checked' : ''
    }>
          ${category.name}
        </label>`;
  });

  //   set dates
  const validFrom = document.getElementById('validFrom');
  const validTo = document.getElementById('validTo');

  validFrom.value = offer.validFrom.slice(0, 10);
  validTo.value = offer.validTo.slice(0, 10);
  validFrom.min = offer.validFrom.slice(0, 10);
  validFrom.addEventListener('change', function () {
    if (validFrom.value) {
      validTo.min = validFrom.value;
      if (validTo.value < validFrom.value) {
        validTo.value = validFrom.value;
      }
    }
  });

  // toggler
  const isActiveBtn = document.getElementById('isActive');
  const isActiveStatus = document.getElementById('activeStatus');
  isActiveBtn.checked = offer.isActive;
  isActiveStatus.textContent = isActiveBtn.checked ? 'Active' : 'Inactive';
  isActiveBtn.addEventListener('change', function () {
    isActiveStatus.textContent = this.checked ? 'Active' : 'Inactive';
  });
}

// Function to toggle product/category selection
function toggleSelection(type) {
  document
    .getElementById('product-select')
    .classList.toggle('hidden', type !== 'product');
  document
    .getElementById('category-select')
    .classList.toggle('hidden', type !== 'category');
}

// Function to disable past dates and setup initial min values
function disablePastDates() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  const currentDate = `${yyyy}-${mm}-${dd}`;

  const validFrom = document.getElementById('validFrom');
  const validTo = document.getElementById('validTo');

  validFrom.min = currentDate;
  validTo.min = currentDate;

  validFrom.addEventListener('change', function () {
    if (validFrom.value) {
      validTo.min = validFrom.value;
      if (validTo.value < validFrom.value) {
        validTo.value = validFrom.value;
      }
    }
  });
}

function validateAndSubmit(form) {
  // Clear previous errors
  document
    .querySelectorAll("span[id$='Error']")
    .forEach(el => (el.textContent = ''));

  // Prepare form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  console.log(data);

  // Safe parse using Zod
  const result = addOfferSchema.safeParse(data);
  console.log(result.success);

  if (result.success) {
    window.spinner?.show();
    form.submit();
  } else {
    result.error.errors.forEach(error => {
      const field = error.path[0];
      const errorElement = document.getElementById(`${field}Error`);
      if (errorElement) {
        errorElement.textContent = error.message;
      }
    });
  }
}

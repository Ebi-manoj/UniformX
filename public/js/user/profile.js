import { showToast } from '/js/toast.js';

////////////////////////////////////////////////////////////////
///////Address functionality

function AddressFunctionality() {
  const allAddresses = JSON.parse(
    document.getElementById('allAddresses').value
  );
  const addressSelect = document.getElementById('addressSelect');

  const nameInput = document.getElementById('fullName');
  const streetInput = document.getElementById('street');
  const districtInput = document.getElementById('district');
  const stateInput = document.getElementById('state');
  const pincodeInput = document.getElementById('pincode');
  const countryInput = document.getElementById('country');
  const mobileInput = document.getElementById('mobile');

  function updateAddressFields(index) {
    const selectedAddress = allAddresses[index];

    nameInput.value = selectedAddress.name;
    streetInput.value = selectedAddress.street_address;
    districtInput.value = selectedAddress.district;
    stateInput.value = selectedAddress.state;
    pincodeInput.value = selectedAddress.pincode;
    countryInput.value = selectedAddress.country;
    mobileInput.value = selectedAddress.mobile;
  }

  // Set default address on page load
  if (allAddresses.length > 0) {
    updateAddressFields(0);
  }

  // Update fields when dropdown changes
  addressSelect.addEventListener('change', e => {
    updateAddressFields(e.target.value);
  });
  ////////////////////////////////////////
  //Edit Button
  const toggleEditBtn = document.getElementById('toggleEditBtn');
  const form = document.getElementById('addressForm');
  const inputs = form.querySelectorAll('input');
  let isEditMode = false;

  toggleEditBtn.addEventListener('click', function () {
    isEditMode = !isEditMode;

    // Toggle button text
    toggleEditBtn.innerHTML = isEditMode
      ? `<span>Save Changes</span>`
      : `<svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
      >
          <path
              d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
          />
      </svg><span>Edit</span> `;

    // Toggle input fields
    inputs.forEach(input => {
      input.disabled = !isEditMode;
      if (isEditMode) {
        input.classList.remove('input-disabled');
        input.classList.add('bg-white');
      } else {
        input.classList.add('input-disabled');
        input.classList.remove('bg-white');

        // Here you would typically save the form data
        // For demo purposes, we're just disabling the fields
        console.log('Form would be saved here');
      }
    });

    // Focus on the first field when entering edit mode
    if (isEditMode) {
      inputs[0].focus();
    }
  });

  ///////////////////////////////////////////
  ////Modal for Add new address
  const openModalBtn = document.getElementById('addAddressBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalBtn2 = document.getElementById('closeModalBtn2');
  const modal = document.getElementById('modalAddress');
  const backdrop = document.getElementById('modalBackdrop');

  function toggleModal(show) {
    modal.classList.toggle('hidden', !show);
    backdrop.classList.toggle('hidden', !show);
  }

  openModalBtn.addEventListener('click', () => toggleModal(true));
  closeModalBtn.addEventListener('click', () => toggleModal(false));
  closeModalBtn2.addEventListener('click', () => toggleModal(false));

  document
    .getElementById('newAddressForm')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateAddress()) {
        e.target.submit();
      }
    });

  //////////////////////////////////////////
  //validation
  function validateAddress() {
    const fullName = document.getElementById('fullName');
    const mobile = document.getElementById('mobile');
    const address = document.getElementById('street');
    const district = document.getElementById('district');
    const state = document.getElementById('state');
    const country = document.getElementById('country');
    const pincode = document.getElementById('pincode');

    // Trim values to remove unnecessary spaces
    const fullNameValue = fullName.value.trim();
    const mobileValue = mobile.value.trim();
    const addressValue = address.value.trim();
    const districtValue = district.value.trim();
    const stateValue = state.value.trim();
    const countryValue = country.value.trim();
    const pincodeValue = pincode.value.trim();
    console.log('hai');

    console.log(fullNameValue, mobileValue);

    // Check if fields are empty
    if (fullNameValue.length < 1) {
      showToast('Full Name is required!', 'error');
      return false;
    }

    if (mobileValue.length < 1) {
      showToast('Mobile number is required!', 'error');
      return false;
    }

    if (!/^\d{10}$/.test(mobileValue)) {
      showToast('Invalid mobile number! Must be 10 digits.', 'error');
      return false;
    }

    if (addressValue.length < 1) {
      showToast('Street Area is required!', 'error');
      return false;
    }

    if (districtValue.length < 1) {
      showToast('District is required!', 'error');
      return false;
    }

    if (stateValue.length < 1) {
      showToast('State is required!', 'error');
      return false;
    }

    if (countryValue.length < 1) {
      showToast('Country is required!', 'error');
      return false;
    }

    if (pincodeValue.length < 1) {
      showToast('Pincode is required!', 'error');
      return false;
    }

    if (!/^\d{6}$/.test(pincodeValue)) {
      showToast('Invalid Pincode! Must be 6 digits.', 'error');
      return false;
    }

    // If all validations pass
    showToast('Address added successfully!', 'success');
    return true;
  }
}
AddressFunctionality();

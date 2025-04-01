import { showToast } from '/js/toast.js';

///////////////////////////////////////////////////////////////////////////////////////////////
//////EDIT PROFILE
function ProfileFunctionality() {
  ////////////////////////
  //Modal
  document
    .getElementById('btn-edit-profile')
    .addEventListener('click', openModal);
  document.getElementById('btn-close').addEventListener('click', closeModal);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);

  function openModal() {
    document.getElementById('editProfileModal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('editProfileModal').classList.add('hidden');
  }

  function saveProfile() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const selectedAddress = document.getElementById('addressSelect').value;

    console.log({ fullName, email, mobile, selectedAddress });

    closeModal();
  }
  //////////////////////////////////////
  //Dynamic Address
  const addressSelect = document.getElementById('addressSelect');
  const addressSPan = document.getElementById('addressSpan');
  const addressId = document.getElementById('addressId');
  const allAddresses = JSON.parse(
    document.getElementById('allAddresses').value
  );
  addressSelect.addEventListener('change', function (e) {
    const index = e.target.value;
    addressSPan.textContent = allAddresses[index].street_address;
    addressId.value = allAddresses[index]._id;
  });
  if (allAddresses.length > 0) {
    const address = allAddresses.find(addr => addr.is_default === true);
    addressSPan.textContent = address.street_address;
    addressId.value = address._id;
    addressSelect.value = allAddresses.indexOf(address);
  }
}
const isProfile = document.getElementById('profile');
if (isProfile) {
  ProfileFunctionality();
}
/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////ADDRESS FUNCTIONALITY
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
  const IdInput = document.getElementById('addressId');
  const deleteBtn = document.getElementById('address-delete-btn');

  function updateAddressFields(index) {
    const selectedAddress = allAddresses[index];

    nameInput.value = selectedAddress.name;
    streetInput.value = selectedAddress.street_address;
    districtInput.value = selectedAddress.district;
    stateInput.value = selectedAddress.state;
    pincodeInput.value = selectedAddress.pincode;
    countryInput.value = selectedAddress.country;
    mobileInput.value = selectedAddress.mobile;
    IdInput.value = selectedAddress._id;
    deleteBtn.dataset.id = selectedAddress._id;
  }

  // Set default address on page load
  if (allAddresses.length > 0) {
    updateAddressFields(0);
  }

  // Update fields when dropdown changes
  addressSelect.addEventListener('change', e => {
    updateAddressFields(e.target.value);
  });

  // Edit Button and Validation for addressForm
  const toggleEditBtn = document.getElementById('toggleEditBtn');
  const addressForm = document.getElementById('addressForm');
  const inputs = addressForm.querySelectorAll('input');
  let isEditMode = false;

  toggleEditBtn.addEventListener('click', function () {
    if (isEditMode) {
      if (validateAddress(addressForm)) {
        addressForm.submit();
      }
    } else {
      // Enter edit mode
      isEditMode = true;
      toggleEditBtn.innerHTML = `<span>Save Changes</span>`;
      inputs.forEach(input => {
        input.disabled = false;
        input.classList.remove('input-disabled');
        input.classList.add('bg-white');
      });
      inputs[1].focus();
    }
  });

  // Exit edit mode after successful save
  function exitEditMode() {
    isEditMode = false;
    toggleEditBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
          <span>Edit</span>`;
    inputs.forEach(input => {
      input.disabled = true;
      input.classList.add('input-disabled');
      input.classList.remove('bg-white');
    });
  }

  // Modal for Add new address
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

  // Validation for newAddressForm
  document
    .getElementById('newAddressForm')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateAddress(this)) {
        e.target.submit(); // Submit the form if validation passes
      }
    });

  // Reusable validation function
  function validateAddress(form) {
    const fullName = form.querySelector('#fullName, #newFullName');
    const mobile = form.querySelector('#mobile, #newMobile');
    const address = form.querySelector('#street, #newStreet');
    const district = form.querySelector('#district, #newDistrict');
    const state = form.querySelector('#state, #newState');
    const country = form.querySelector('#country, #newCountry');
    const pincode = form.querySelector('#pincode, #newPincode');

    const fullNameValue = fullName.value.trim();
    const mobileValue = mobile.value.trim();
    const addressValue = address.value.trim();
    const districtValue = district.value.trim();
    const stateValue = state.value.trim();
    const countryValue = country.value.trim();
    const pincodeValue = pincode.value.trim();

    // Validation checks
    if (fullNameValue.length < 1) {
      showToast('Full Name is required!', 'error');
      return false;
    }
    if (fullNameValue.length < 2 || fullNameValue.length > 50) {
      showToast('Full Name must be between 2 and 50 characters!', 'error');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(fullNameValue)) {
      showToast('Full Name can only contain letters and spaces!', 'error');
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
      showToast('Street Address is required!', 'error');
      return false;
    }
    if (addressValue.length < 3 || addressValue.length > 100) {
      showToast(
        'Street Address must be between 3 and 100 characters!',
        'error'
      );
      return false;
    }

    if (districtValue.length < 1) {
      showToast('District is required!', 'error');
      return false;
    }
    if (districtValue.length < 2 || districtValue.length > 50) {
      showToast('District must be between 2 and 50 characters!', 'error');
      return false;
    }

    if (stateValue.length < 1) {
      showToast('State is required!', 'error');
      return false;
    }
    if (stateValue.length < 2 || stateValue.length > 50) {
      showToast('State must be between 2 and 50 characters!', 'error');
      return false;
    }

    if (countryValue.length < 1) {
      showToast('Country is required!', 'error');
      return false;
    }
    if (countryValue.length < 2 || countryValue.length > 50) {
      showToast('Country must be between 2 and 50 characters!', 'error');
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

    if (form.id === 'addressForm') {
      exitEditMode(); // Exit edit mode after successful validation
    }
    return true;
  }

  ///////////////////////////////////////////
  ///Delete Address

  deleteBtn.addEventListener('click', async function (e) {
    const id = this.dataset.id;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete this address?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, do it!',
      cancelButtonText: 'Cancel',
    }).then(async result => {
      if (!result.isConfirmed) {
        console.log('hai');

        return;
      }
      try {
        const response = await fetch(`/profile/address/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          showToast(data.message, 'success');
          setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (error) {
        showToast('Something went wrong!');
      }
    });
  });
}
const isAddress = document.querySelector('#address');
if (isAddress) {
  AddressFunctionality();
}

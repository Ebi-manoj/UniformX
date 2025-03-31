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
}
AddressFunctionality();

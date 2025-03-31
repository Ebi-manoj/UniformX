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
}
AddressFunctionality();

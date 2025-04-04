window.onload = function () {
  const successInput = document.getElementById('successMessage');
  const errorInput = document.getElementById('errorMessage');
  console.log('hai');

  if (
    successInput &&
    successInput.dataset.alert === 'true' &&
    successInput.value
  ) {
    Swal.fire({
      icon: 'success',
      title: successInput.value,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
    });
  }

  if (errorInput && errorInput.dataset.alert === 'true' && errorInput.value) {
    Swal.fire({
      icon: 'error',
      title: errorInput.value,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
    });
  }
};

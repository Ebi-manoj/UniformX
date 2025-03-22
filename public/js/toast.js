export const showToast = function (message, icon = 'error') {
  Swal.fire({
    position: 'bottom-end',
    icon: icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    toast: true,
  });
};

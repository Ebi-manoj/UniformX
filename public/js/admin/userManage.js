document.addEventListener('DOMContentLoaded', function () {
  ///////////////////////////////////////////////////////////////////////////////
  //Block and UnBlock Functionality
  const toggleButtons = document.querySelectorAll('.toggle-status');

  toggleButtons.forEach(toggle => {
    toggle.addEventListener('change', function () {
      const userId = this.dataset.id;
      const isBlocked = this.checked;

      Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to ${isBlocked ? 'block' : 'unblock'} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, do it!',
        cancelButtonText: 'Cancel',
      }).then(result => {
        if (!result.isConfirmed) {
          this.checked = !isBlocked;
          return;
        }

        fetch(`customers/block/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isBlocked }),
        })
          .then(response => response.json())
          .then(data => {
            if (!data.success) {
              Swal.fire('Error', 'Failed to update status!', 'error');
              this.checked = !isBlocked;
            } else {
              Swal.fire('Success', 'User status updated!', 'success');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'Something went wrong!', 'error');
            this.checked = !isBlocked;
          });
      });
    });
  });
});

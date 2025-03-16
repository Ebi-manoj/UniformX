document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearButton');
  ///////////////////////////////////////////////////////////////////////////////////
  // Toggle the search Clear button admin start typing
  console.log('Hai');

  function toggleClearButton() {
    input.addEventListener('focus', function () {
      clearBtn.classList.toggle('hidden', input?.value.trim() === '');
    });
    input.addEventListener('input', function () {
      clearBtn.classList.toggle('hidden', input?.value.trim() === '');
    });

    // Working of clear Button
    clearBtn.addEventListener('click', function () {
      input.value = '';
      clearBtn.classList.add('hidden');
      input.focus();
      const url = new URL(window.location.href);
      url.searchParams.delete('search');
      window.location.href = url.toString();
    });
  }
  ///////////////////////////////////////////////////////////////////////////////////////
  //////Search Functionality
  function searchFunctionality() {
    input.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const searchQuery = event.target.value.trim();
        const url = new URL(window.location.href);

        if (searchQuery) {
          url.searchParams.set('search', searchQuery);
        } else {
          url.searchParams.delete('search');
        }
        url.searchParams.set('page', 1);
        window.location.href = url.toString();
      }
    });
  }

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
          this.checked = !isBlocked; // Revert toggle if cancelled
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
              this.checked = !isBlocked; // Revert toggle if error occurs
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

  toggleClearButton();
  searchFunctionality();
});

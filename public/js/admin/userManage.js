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
      const isBlocked = this.checked; // true if checked, false otherwise

      const action = isBlocked ? 'block' : 'unblock';
      const confirmation = confirm(
        `Are you sure you want to ${action} this user?`
      );

      if (!confirmation) {
        // Revert the checkbox state if action is canceled
        this.checked = !isBlocked;
        return;
      }
      console.log(userId);

      // Send an AJAX request to update the status
      fetch(`customers/block/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked }),
      })
        .then(response => response.json())
        .then(data => {
          if (!data.success) {
            alert('Failed to update status!');
            this.checked = !isBlocked; // Revert toggle if error occurs
          } else {
            console.log('updated');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Something went wrong!');
          this.checked = !isBlocked;
        });
    });
  });

  toggleClearButton();
  searchFunctionality();
});

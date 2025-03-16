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
  const toggleButtons = document.querySelectorAll('.toggle-status');

  toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
      const userId = this.dataset.id;
      const status = this.getAttribute('data-status') === 'true';

      // Toggle UI instantly
      this.textContent = status ? 'Unblock' : 'Block';
      this.setAttribute('data-status', !status);

      // Optional: Update backend if needed
      // fetch(`/admin/users/toggle-status/${userId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ is_blocked: !status }),
      // })
      //   .then(res => res.json())
      //   .then(data => {
      //     console.log('Status updated:', data);
      //   })
      //   .catch(err => console.error('Error updating status:', err));
    });
  });

  toggleClearButton();
  searchFunctionality();
});

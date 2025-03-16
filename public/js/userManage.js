document.addEventListener('DOMContentLoaded', function () {
  ///////////////////////////////////////////////////////////////////////////////////
  // Toggle the search Clear button admin start typing
  console.log('Hai');

  function toggleClearButton() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearButton');

    input.addEventListener('input', function () {
      clearBtn.classList.toggle('hidden', input.value.trim() === '');
    });

    // Working of clear Button
    clearBtn.addEventListener('click', function () {
      input.value = '';
      clearBtn.classList.add('hidden');
      input.focus();
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
});

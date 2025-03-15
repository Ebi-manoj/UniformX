document.addEventListener('DOMContentLoaded', function () {
  const toggleButtons = document.querySelectorAll('.toggle-status');

  toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
      const userId = this.dataset.id; // Assuming each button has a user ID
      const status = this.getAttribute('data-status') === 'true'; // Check current status

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
});

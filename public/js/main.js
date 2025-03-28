function search() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearButton');

  function toggleClearButton() {
    // Show clear button on page load if input has value
    clearBtn.classList.toggle('hidden', input.value.trim() === '');

    input.addEventListener('focus', function () {
      clearBtn.classList.toggle('hidden', input.value.trim() === '');
    });

    input.addEventListener('input', function () {
      clearBtn.classList.toggle('hidden', input.value.trim() === '');
    });

    // Clear input when ✖ is clicked
    clearBtn.addEventListener('click', function () {
      input.value = '';
      clearBtn.classList.add('hidden');
      input.focus();
      const url = new URL(window.location.href);
      url.searchParams.delete('search');
      window.location.href = url.toString();
    });
  }
  function searchFunctionality() {
    input.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const searchQuery = event.target.value.trim();
        const url = new URL(window.location.origin + '/products/');

        if (searchQuery) {
          url.searchParams.set('search', searchQuery);
        }

        url.searchParams.set('page', 1); // Optional: Set default page to 1
        window.location.href = url.toString();
      }
    });
  }

  if (input && clearBtn) {
    toggleClearButton();
    searchFunctionality();
  }
}

document.addEventListener('DOMContentLoaded', search);

// Dropdwon
document.getElementById('category').addEventListener('change', function () {
  const selectedCategory = this.value;
  if (selectedCategory) {
    window.location.href = `/products?categories=${selectedCategory}`;
  }
});

document.getElementById('club').addEventListener('change', function () {
  const selectedClub = this.value;
  if (selectedClub) {
    window.location.href = `/products?club=${selectedClub}`;
  }
});

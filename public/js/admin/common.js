document.addEventListener('DOMContentLoaded', function () {
  const navItems = document.querySelectorAll('.nav-item a');

  let activeMenu = localStorage.getItem('activeMenu');
  const currentPage = window.location.pathname;

  // If activeMenu does not match the current page, update it
  if (!activeMenu || activeMenu !== currentPage) {
    localStorage.setItem('activeMenu', currentPage);
    activeMenu = currentPage;
  }

  // Apply active class based on activeMenu
  navItems.forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    link.parentElement.classList.remove('active');
    if (linkPath === activeMenu) {
      link.parentElement.classList.add('active');
    }
  });

  // Handle menu clicks
  navItems.forEach(link => {
    link.addEventListener('click', function () {
      navItems.forEach(item => item.parentElement.classList.remove('active'));
      this.parentElement.classList.add('active');

      localStorage.setItem(
        'activeMenu',
        new URL(this.href, window.location.origin).pathname
      );
    });
  });
});

function search() {
  ///////////////////////////////////////////////////////////////
  ///Search Functionality
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearButton');
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
  if (input && clearBtn) {
    toggleClearButton();
    searchFunctionality();
  }
}
search();

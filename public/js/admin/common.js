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

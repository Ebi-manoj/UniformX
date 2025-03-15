document.addEventListener('DOMContentLoaded', function () {
  const navItems = document.querySelectorAll('.nav-item a');

  const activeMenu = localStorage.getItem('activeMenu');

  if (activeMenu) {
    navItems.forEach(link => {
      link.parentElement.classList.remove('active');
      if (link.getAttribute('href') === activeMenu) {
        link.parentElement.classList.add('active');
      }
    });
  }
  navItems.forEach(link => {
    link.addEventListener('click', function () {
      navItems.forEach(item => item.parentElement.classList.remove('active'));
      this.parentElement.classList.add('active');

      localStorage.setItem('activeMenu', this.getAttribute('href'));
    });
  });
});

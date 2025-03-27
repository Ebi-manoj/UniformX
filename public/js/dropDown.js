document.addEventListener('DOMContentLoaded', function () {
  console.log('hai');

  // Get clubs data safely
  const clubDataElement = document.getElementById('clubData');
  if (!clubDataElement) return;

  const clubs = JSON.parse(clubDataElement.dataset.clubs);

  // Get category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategoryId = urlParams.get('category');
  const clubDropdown = document.getElementById('clubFilter');
  if (!clubDropdown) return;

  clubDropdown.innerHTML = '<option value="">All Club</option>';

  if (selectedCategoryId) {
    const filteredClubs = clubs.filter(
      club => String(club.category_id) === String(selectedCategoryId)
    );
    console.log('Filtered Clubs:', filteredClubs);

    filteredClubs.forEach(club => {
      const option = document.createElement('option');
      option.value = club._id;
      option.textContent = club.name;
      clubDropdown.appendChild(option);
    });

    // Populate club dropdown based on category
  }
});

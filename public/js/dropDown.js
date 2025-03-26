document.addEventListener('DOMContentLoaded', function () {
  console.log('hai');

  // Get clubs data safely
  const clubDataElement = document.getElementById('clubData');
  if (!clubDataElement) {
    console.error('Club data element not found.');
    return;
  }

  const clubs = JSON.parse(clubDataElement.dataset.clubs);
  console.log('All Clubs:', clubs);

  // Get category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategoryId = urlParams.get('category');
  console.log('Selected Category:', selectedCategoryId);

  // Debug: Check category IDs of clubs
  clubs.forEach(club =>
    console.log(`Club: ${club.name}, category_id:`, club.category_id)
  );

  // Populate club dropdown based on category
  const clubDropdown = document.getElementById('clubFilter');
  if (!clubDropdown) {
    console.error('Club dropdown element not found.');
    return;
  }

  clubDropdown.innerHTML = '<option value="">All Club</option>';

  if (selectedCategoryId) {
    const filteredClubs = clubs.filter(
      club => String(club.category_id) === String(selectedCategoryId) // Convert both to strings
    );
    console.log('Filtered Clubs:', filteredClubs);

    filteredClubs.forEach(club => {
      const option = document.createElement('option');
      option.value = club._id;
      option.textContent = club.name;
      clubDropdown.appendChild(option);
    });
  }
});

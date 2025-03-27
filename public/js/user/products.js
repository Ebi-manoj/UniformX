document.addEventListener('DOMContentLoaded', function () {
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const clubsData = JSON.parse(document.getElementById('clubsData').value);
  const clubDropdown = document.getElementById('clubFilter');

  function updateClubs() {
    let selectedCategories = [];

    // Collect selected categories
    document
      .querySelectorAll('.category-checkbox:checked')
      .forEach(checkbox => {
        selectedCategories.push(checkbox.value);
      });

    // If no category is selected, show all clubs
    let filteredClubs =
      selectedCategories.length === 0
        ? clubsData
        : clubsData.filter(club =>
            selectedCategories.includes(String(club.category_id))
          );

    console.log('Filtered Clubs:', filteredClubs);

    // Clear previous options
    clubDropdown.innerHTML = '<option value="">All Clubs</option>';

    // Populate dropdown with filtered clubs
    filteredClubs.forEach(club => {
      const option = document.createElement('option');
      option.value = club._id;
      option.textContent = club.name;
      clubDropdown.appendChild(option);
    });
  }

  // Event listeners for category checkboxes
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateClubs);
  });

  // Colors selection
  document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', function () {
      this.classList.toggle('ring-2');
      this.classList.toggle('ring-blue-500');
    });
  });

  // Size selection
  document.querySelectorAll('.size-btn').forEach(button => {
    button.addEventListener('click', function () {
      this.classList.toggle('border-blue-500');
      this.classList.toggle('text-blue-500');
      this.classList.toggle('font-semibold');
    });
  });

  updateClubs(); // Initial call to populate all clubs on page load
});

///////////////////////////////////////////////////////////////////////////////////
//////////// Dual price slider logic
function controlFromSlider(fromSlider, toSlider, minPriceText) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);

  if (from > to) {
    fromSlider.value = to;
    minPriceText.textContent = `₹${to}`;
  } else {
    minPriceText.textContent = `₹${from}`;
  }
}

function controlToSlider(fromSlider, toSlider, maxPriceText) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);

  if (from > to) {
    toSlider.value = from;
    maxPriceText.textContent = `₹${from}`;
  } else {
    maxPriceText.textContent = `₹${to}`;
  }
}

function getParsed(currentFrom, currentTo) {
  const from = parseInt(currentFrom.value, 10);
  const to = parseInt(currentTo.value, 10);
  return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
  const rangeDistance = to.max - to.min;
  const fromPosition = from.value - to.min;
  const toPosition = to.value - to.min;

  controlSlider.style.background = `linear-gradient(
            to right, 
            ${sliderColor} 0%, 
            ${sliderColor} ${(fromPosition / rangeDistance) * 100}%, 
            ${rangeColor} ${(fromPosition / rangeDistance) * 100}%, 
            ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
            ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
            ${sliderColor} 100%
        )`;
}

// Get DOM elements
const fromSlider = document.querySelector('#fromSlider');
const toSlider = document.querySelector('#toSlider');
const minPriceText = document.querySelector('#minPriceText');
const maxPriceText = document.querySelector('#maxPriceText');

// Initial setup
fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);

// Event listeners
fromSlider.oninput = () =>
  controlFromSlider(fromSlider, toSlider, minPriceText);
toSlider.oninput = () => controlToSlider(fromSlider, toSlider, maxPriceText);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////Apply filters logic
document.addEventListener('DOMContentLoaded', function () {
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const clubsData = JSON.parse(document.getElementById('clubsData').value);
  const clubDropdown = document.getElementById('clubFilter');
  let selectedColors = new Set();
  let selectedSizes = new Set();

  function updateClubs() {
    let selectedCategories = Array.from(
      document.querySelectorAll('.category-checkbox:checked')
    ).map(checkbox => checkbox.value);

    let filteredClubs =
      selectedCategories.length === 0
        ? clubsData
        : clubsData.filter(club =>
            selectedCategories.includes(String(club.category_id))
          ); // Ensure category_id is a string

    clubDropdown.innerHTML = '<option value="">All Clubs</option>';

    filteredClubs.forEach(club => {
      const option = document.createElement('option');
      option.value = club._id;
      option.textContent = club.name;
      clubDropdown.appendChild(option);
    });

    restoreSelectedClub(); // Restore selected club after updating
  }

  function restoreSelectedClub() {
    const queryParams = new URLSearchParams(window.location.search);
    const selectedClub = queryParams.get('club');
    if (selectedClub) {
      clubDropdown.value = selectedClub;
    }
  }

  function restoreFiltersFromQuery() {
    const queryParams = new URLSearchParams(window.location.search);

    // Restore selected categories
    const selectedCategories = queryParams.get('categories')?.split(',') || [];
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
      checkbox.checked = selectedCategories.includes(checkbox.value);
    });

    // Restore selected club
    restoreSelectedClub();

    // Restore selected colors
    const selectedColorsFromQuery = queryParams.get('colors')?.split(',') || [];
    selectedColors = new Set(selectedColorsFromQuery);
    document.querySelectorAll('.color-btn').forEach(button => {
      if (selectedColors.has(button.dataset.color)) {
        button.classList.add('ring-2', 'ring-blue-500');
      }
    });

    // Restore selected sizes
    const selectedSizesFromQuery = queryParams.get('sizes')?.split(',') || [];
    selectedSizes = new Set(selectedSizesFromQuery);
    document.querySelectorAll('.size-btn').forEach(button => {
      if (selectedSizes.has(button.textContent.trim())) {
        button.classList.add(
          'border-blue-500',
          'text-blue-500',
          'font-semibold'
        );
      }
    });

    // Restore price range
    if (queryParams.get('minPrice')) {
      document.getElementById('fromSlider').value = queryParams.get('minPrice');
      document.getElementById('minPriceText').textContent = `₹${queryParams.get(
        'minPrice'
      )}`;
    }
    if (queryParams.get('maxPrice')) {
      document.getElementById('toSlider').value = queryParams.get('maxPrice');
      document.getElementById('maxPriceText').textContent = `₹${queryParams.get(
        'maxPrice'
      )}`;
    }
    fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
  }

  function applyFilters() {
    const queryParams = new URLSearchParams();

    const selectedCategories = Array.from(
      document.querySelectorAll('.category-checkbox:checked')
    ).map(checkbox => checkbox.value);
    if (selectedCategories.length) {
      queryParams.set('categories', selectedCategories.join(','));
    }

    const selectedClub = clubDropdown.value;
    if (selectedClub) {
      queryParams.set('club', selectedClub);
    }

    if (selectedColors.size) {
      queryParams.set('colors', Array.from(selectedColors).join(','));
    }

    if (selectedSizes.size) {
      queryParams.set('sizes', Array.from(selectedSizes).join(','));
    }

    const minPrice = document.getElementById('fromSlider').value;
    const maxPrice = document.getElementById('toSlider').value;
    queryParams.set('minPrice', minPrice);
    queryParams.set('maxPrice', maxPrice);

    window.location.href =
      window.location.pathname + '?' + queryParams.toString();
  }

  // **Event Listeners for Colors and Sizes**
  document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', function () {
      const color = button.dataset.color;
      if (selectedColors.has(color)) {
        selectedColors.delete(color);
        button.classList.remove('ring-2', 'ring-blue-500');
      } else {
        selectedColors.add(color);
        button.classList.add('ring-2', 'ring-blue-500');
      }
    });
  });

  document.querySelectorAll('.size-btn').forEach(button => {
    button.addEventListener('click', function () {
      const size = button.textContent.trim();
      if (selectedSizes.has(size)) {
        selectedSizes.delete(size);
        button.classList.remove(
          'border-blue-500',
          'text-blue-500',
          'font-semibold'
        );
      } else {
        selectedSizes.add(size);
        button.classList.add(
          'border-blue-500',
          'text-blue-500',
          'font-semibold'
        );
      }
    });
  });

  document.querySelector('.filter-btn').addEventListener('click', applyFilters);

  // Call updateClubs first, then restore filters
  updateClubs();
  restoreFiltersFromQuery();
});

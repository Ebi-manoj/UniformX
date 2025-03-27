document.addEventListener('DOMContentLoaded', function () {
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const clubsData = JSON.parse(document.getElementById('clubsData').value);
  const clubDropdown = document.getElementById('clubFilter');

  if (!clubDropdown) return;

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

  updateClubs(); // Initial call to populate all clubs on page load
});

///////////////////////////////////////////////////////////////////////////////////
//////////// Dual price slider logic
function controlFromSlider(fromSlider, toSlider, minPriceText) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);

  if (from > to) {
    fromSlider.value = to;
    minPriceText.textContent = `$${to}`;
  } else {
    minPriceText.textContent = `$${from}`;
  }
}

function controlToSlider(fromSlider, toSlider, maxPriceText) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);

  if (from > to) {
    toSlider.value = from;
    maxPriceText.textContent = `$${from}`;
  } else {
    maxPriceText.textContent = `$${to}`;
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

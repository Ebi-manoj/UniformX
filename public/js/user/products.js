console.log('hai this is');

// Toggle dropdown function
function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
  } else {
    // Close all dropdowns first
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(d => d.classList.remove('show'));

    // Open the clicked dropdown
    dropdown.classList.add('show');
  }
}

// Close dropdowns when clicking outside
window.addEventListener('click', function (e) {
  if (
    !e.target.matches('.dropdown-toggle') &&
    !e.target.closest('.dropdown-menu')
  ) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(d => d.classList.remove('show'));
  }
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

const foundItemsList = document.querySelector('#found-items-list');
const savedItemsTable = document.querySelector('#saved-items-table');
const searchInput = document.querySelector('#foodstuff');
const searchForm = document.querySelector('#search-form');

const totalProteinsCell = document.querySelector('#total-proteins');
const totalFatsCell = document.querySelector('#total-fats');
const totalCarbohydratesCell = document.querySelector('#total-carbohydrates');
const totalMassCell = document.querySelector('#total-mass');
const totalCaloriesCell = document.querySelector('#total-calories');
const totalCaloriesNormalizedCell = document.querySelector('#total-calories-normalized');

let selectedIndex = -1

function updateSelection() {
    [...foundItemsList.children].forEach((child, index) => {
        if (index === selectedIndex) {
            child.classList.add('selected');
        } else {
            child.classList.remove('selected');
        }
    });
}

function save_item(data) {
    const savedItemRow = document.createElement('tr');

    // tick box
    const thermalProcessingCell = document.createElement('td')
    const thermalProcessingCheckBox = document.createElement('input');
    thermalProcessingCheckBox.type = 'checkbox';
    thermalProcessingCheckBox.addEventListener('input', updateSummary);
    thermalProcessingCell.appendChild(thermalProcessingCheckBox);
    savedItemRow.appendChild(thermalProcessingCell);

    // name
    const nameCell = document.createElement('td')
    nameCell.textContent = data.name
    savedItemRow.appendChild(nameCell)

    // proteins
    const proteinsCell = document.createElement('td')
    proteinsCell.textContent = data.proteins
    savedItemRow.appendChild(proteinsCell)

    // fats
    const fatsCell = document.createElement('td')
    fatsCell.textContent = data.fats
    savedItemRow.appendChild(fatsCell)

    // carbohydrates
    const carbohydratesCell = document.createElement('td')
    carbohydratesCell.textContent = data.carbohydrates
    savedItemRow.appendChild(carbohydratesCell)

    // mass
    const integerInputCell = document.createElement('td');
    const integerInput = document.createElement('input');
    integerInput.type = 'number';
    integerInput.min = '0';
    integerInput.step = '1';
    integerInput.value = '0';
    integerInput.addEventListener('input', () => {
        if (integerInput.value < 0)
            integerInput.value = '';
        updateSummary();
    });
    integerInput.classList.add('narrow-input');
    integerInputCell.appendChild(integerInput);
    savedItemRow.appendChild(integerInputCell);

    // calories
    const caloriesCell = document.createElement('td');

    // delete button
    const deleteButtonCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.addEventListener('click', () => {
        savedItemRow.remove();
        updateSummary();
    });
    deleteButtonCell.appendChild(deleteButton);
    savedItemRow.appendChild(deleteButtonCell);

    savedItemsTable.appendChild(savedItemRow);
    updateSummary();
}

function updateSummary() {
    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbohydrates = 0;
    let totalMass = 0;
    let totalCalories = 0;
    [...savedItemsTable.rows].slice(1).forEach(row => {
        let mass = parseInt(row.cells[5].querySelector('input').value) || 0;
        let thermalProcessing = row.cells[0].querySelector('input').checked;
        let proteins = parseFloat(row.cells[2].textContent) * mass / 100;
        let fats = parseFloat(row.cells[3].textContent) * mass / 100;
        let carbohydrates = parseFloat(row.cells[4].textContent) * mass / 100;


        let calories = NaN;
        if (thermalProcessing)
            // ККАЛпто=Б*4*0.94+Ж*9*0.88+У*4*0.91
            calories = proteins * 4 * 0.94 + fats * 9 * 0.99 + carbohydrates * 4 * 0.91
        else
            // ККАЛнпто=Б*4+Ж*9+У*4
            calories = proteins * 4 + fats * 9 + carbohydrates * 4

        console.assert(!isNaN(calories));

        totalMass += mass;
        totalProteins += proteins;
        totalFats += fats;
        totalCarbohydrates += carbohydrates;
        totalCalories += calories;
    });
    let totalCaloriesNormalized = totalMass === 0 ? 0 : totalCalories / totalMass * 100;

    totalProteinsCell.textContent = totalProteins.toFixed(2);
    totalFatsCell.textContent = totalFats.toFixed(2);
    totalCarbohydratesCell.textContent = totalCarbohydrates.toFixed(2);
    totalMassCell.textContent = totalMass;
    totalCaloriesCell.textContent = totalCalories.toFixed(2);
    totalCaloriesNormalizedCell.textContent = totalCaloriesNormalized.toFixed(2);
}

function selectItemListener(item) {
    return function () {
        if (![...savedItemsTable.rows].some(row => row.cells[1].textContent === item)) {
            fetch('/get_foodstuff_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({foodstuff: item})
            })
                .then(response => response.json())
                .then(data => save_item(data));
        }
    }
}

function searchItems() {
    const searchStr = searchInput.value;
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({search_str: searchStr})
    })
        .then(response => response.json())
        .then(data => {
            foundItemsList.innerHTML = '';
            data.found_items.forEach((item, index) => {
                const newItem = document.createElement('li');
                newItem.textContent = item;
                newItem.addEventListener('click', selectItemListener(item));
                newItem.addEventListener('mouseenter', () => {
                    selectedIndex = index;
                    updateSelection();
                });
                foundItemsList.appendChild(newItem);
            });
        });
}

window.addEventListener('DOMContentLoaded', () => {
    searchForm.addEventListener('submit', event => {
        event.preventDefault();
    });

    searchInput.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            foundItemsList.focus();
            if (selectedIndex < foundItemsList.children.length - 1) {
                selectedIndex++;
                updateSelection();
            }
        }
    });

    foundItemsList.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (selectedIndex < foundItemsList.children.length - 1) {
                selectedIndex++;
                updateSelection();
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (selectedIndex > 0) {
                selectedIndex--;
                updateSelection();
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < foundItemsList.children.length) {
                const item = foundItemsList.children[selectedIndex].textContent;
                selectItemListener(item)()
            }
        }
    });

    searchInput.addEventListener('input', searchItems);
});


searchItems();
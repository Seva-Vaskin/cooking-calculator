// javascript.js
window.addEventListener('DOMContentLoaded', () => {
    const foundItemsList = document.querySelector('#found-items-list');
    const savedItemsTable = document.querySelector('#saved-items-table');
    const searchInput = document.querySelector('#foodstuff');
    const searchForm = document.querySelector('#search-form');

    const totalProteinCell = document.querySelector('#total-protein');
    const totalFatsCell = document.querySelector('#total-fats');
    const totalCarbohydratesCell = document.querySelector('#total-carbohydrates');
    const totalAmountCell = document.querySelector('#total-amount');

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
    });

    let selectedIndex = -1;

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
        data.foodstuff_info.forEach(value => {
            const savedItemCell = document.createElement('td');
            savedItemCell.textContent = value;
            savedItemRow.appendChild(savedItemCell);
        });
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
        let totalProtein = 0;
        let totalFats = 0;
        let totalCarbohydrates = 0;
        let totalAmount = 0;
        [...savedItemsTable.rows].slice(1).forEach(row => {
            totalProtein += parseFloat(row.cells[1].textContent);
            totalFats += parseFloat(row.cells[2].textContent);
            totalCarbohydrates += parseFloat(row.cells[3].textContent);
            totalAmount += parseInt(row.cells[4].textContent);
        });
        totalProteinCell.textContent = totalProtein.toFixed(2);
        totalFatsCell.textContent = totalFats.toFixed(2);
        totalCarbohydratesCell.textContent = totalCarbohydrates.toFixed(2);
        totalAmountCell.textContent = totalAmount;
    }

    function selectItemListener(item) {
        return function () {
            if (![...savedItemsTable.rows].some(row => row.cells[0].textContent === item)) {
                fetch('/get_info', {
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

    searchInput.addEventListener('input', () => {
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
    });
});

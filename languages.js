
const authToken = localStorage.getItem('authToken');

// const authToken = "your-auth-token-here"; // Replace with your token
let languages = [];

async function fetchLanguages() {
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + authToken
        }
    };

    try {
        const response = await fetch('https://localhost:7299/api/Languages', options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        languages = data.languages;
        populateDropdowns();
    } catch (error) {
        console.error('Error fetching languages:', error);
    }
}

function populateDropdowns() {
    const inputDropdown = document.querySelector('#input-language .dropdown-menu');
    const outputDropdown = document.querySelector('#output-language .dropdown-menu');
    
    // Clear existing options if any
    inputDropdown.innerHTML = '';
    outputDropdown.innerHTML = '';

    // Populate each dropdown with languages
    languages.forEach(language => {
        const optionItem = `<li class="option" id= ${language.languageId} data-value="${language.languagecode}">${language.languageName}</li>`;
        
        inputDropdown.insertAdjacentHTML('beforeend', optionItem);
        outputDropdown.insertAdjacentHTML('beforeend', optionItem);
    });

    if (languages.length > 0) {
        const defaultInputLanguage = languages[0];
        const defaultOutputLanguage = languages[1];
        
        // Set default in input dropdown
        const inputSelected = document.querySelector('#input-language .dropdown-toggle .selected');
        inputSelected.textContent = defaultInputLanguage.languageName;
        inputSelected.setAttribute('data-value', defaultInputLanguage.languagecode);

        // Set default in output dropdown
        const outputSelected = document.querySelector('#output-language .dropdown-toggle .selected');
        outputSelected.textContent = defaultOutputLanguage.languageName;
        outputSelected.setAttribute('data-value', defaultOutputLanguage.languagecode);
    }

    // Optionally, add event listeners to handle selecting a language
    addDropdownListeners();
}

function addDropdownListeners() {
    document.querySelectorAll('.dropdown-menu .option').forEach(option => {
        option.addEventListener('click', function () {
            const selectedText = this.textContent;
            const dropdownToggle = this.closest('.dropdown-container').querySelector('.dropdown-toggle .selected');
            dropdownToggle.textContent = selectedText;
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLanguages();
});


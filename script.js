// DOM Elements
const dropdowns = document.querySelectorAll(".dropdown-container");
const inputLanguageDropdown = document.querySelector("#input-language");
const outputLanguageDropdown = document.querySelector("#output-language");
const inputTextElem = document.querySelector("#input-text");
const outputTextElem = document.querySelector("#output-text");
const swapBtn = document.querySelector(".swap-position");
const uploadDocument = document.querySelector("#upload-document");
const uploadTitle = document.querySelector("#upload-title");
const downloadBtn = document.querySelector("#download-btn");
const historyList = document.getElementById('historyList');
const favoritesList = document.getElementById('favoritesList');
const favBtn = document.querySelector("#fav-btn");
const inputChars = document.querySelector("#input-chars");
const authToken = localStorage.getItem('authToken');
lastTranslation = null;
let languages = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchLanguages(); // Fetch languages on page load
  const translateBtn = document.querySelector('.translate-btn');
  translateBtn.addEventListener('click', translate);
});

// Dropdown Handling
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", () => {
    dropdown.classList.toggle("active");
  });

  // Handle selection of a language option within each dropdown
  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      dropdown.querySelectorAll(".option").forEach((option) => {
        option.classList.remove("active"); // Remove active state from other options
      });
      item.classList.add("active"); // Add active state to selected option
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML; // Set display to selected language
      selected.dataset.value = item.dataset.value; // Store selected language code

      translate(); // Call translate function on selection
    });
  });
});

// Close dropdowns if clicked outside
document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

// Swap Languages
swapBtn.addEventListener("click", () => {
  const inputLanguage = inputLanguageDropdown.querySelector(".selected");
  const outputLanguage = outputLanguageDropdown.querySelector(".selected");

  // Swap languages
  const tempLanguage = inputLanguage.innerHTML;
  inputLanguage.innerHTML = outputLanguage.innerHTML;
  outputLanguage.innerHTML = tempLanguage;

  const tempValue = inputLanguage.dataset.value;
  inputLanguage.dataset.value = outputLanguage.dataset.value;
  outputLanguage.dataset.value = tempValue;

  // Swap text
  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate();
});

// Translation Function
async function translate() {
  const inputText = inputTextElem.value;
  const inputLanguage = inputLanguageDropdown.querySelector(".selected");
  const sourceLanguageId = inputLanguage.getAttribute("data-id");

  const outputLanguage = outputLanguageDropdown.querySelector(".selected");
  const targetLanguageId = outputLanguage.getAttribute("data-id");

  const url = 'https://localhost:7299/api/TranslationLogs';
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken,
    },
    body: JSON.stringify({
      sourceLanguageId: parseInt(sourceLanguageId),
      targetLanguageId: parseInt(targetLanguageId),
      sourceText: inputText,
    }),
  };

  try {
    const response = await fetch(url, options);
    if (response.status === 401) {
      alert('You are not authorized to access this page. Please login to continue.');
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    lastTranslation = data.translation; // Store last translation for future use
    outputTextElem.value = data.translation.targetText; // Update output text
  } catch (error) {
    console.error(error);
  }
}

// Add to Favorites
async function addToFavorite(translationId) {
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken,
    },
    body: JSON.stringify({ translationLogId: translationId }),
  };

  try {
    const response = await fetch('https://localhost:7299/api/Favorites', options);
    if (response.status === 401) {
      alert('You are not authorized to access this page. Please login to continue.');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok){
      result = await response.json();
      message = result.message
      alert(`HTTP error! Status: ${message}`);
      return
    }
    alert('Translation added to favorites');
  } catch (error) {
    console.error('Error:', error);
  }
}

favBtn.addEventListener('click', () => {
  try {
    if (lastTranslation === null) {
      alert('No translation to add to favorites');
    }
    addToFavorite(lastTranslation.translationLogId);
  } catch (error) {
    console.error('Error:', error);
  }

});

async function getFavourites() {
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    }
  };

  try {
    const response = await fetch('https://localhost:7299/api/Favorites', options);

    if (response.status === 401) {
      alert('You are not authorized to access this page. Please login to continue.');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const favorites = data.favorites.reverse(); // Reverse to display latest first

    favoritesList.innerHTML = '';

    if (favorites.length > 0) {
      favorites.forEach(favorite => {
        const listItem = document.createElement('li');
        listItem.classList.add('favorite-item');

        const deleteIcon = document.createElement('button');
        deleteIcon.classList.add('icon-button', 'delete-btn');
        deleteIcon.innerHTML = '<ion-icon id="delete-btn" name="trash"></ion-icon>'; // Font Awesome icon
        deleteIcon.onclick = async () => {
          await deleteFavorite(favorite.favoriteId);
          getFavourites();
        };

        listItem.innerHTML = `
                <div id=${favorite.favoriteId}>
                    <strong dir="auto">${favorite.translationLog.sourceText}</strong> → ${favorite.translationLog.targetText}
                </div>
                <div class="timestamp">${new Date(favorite.translationLog.createdAt).toLocaleString()}</div>
            `;
        listItem.appendChild(deleteIcon);
        favoritesList.appendChild(listItem);
      }
      );
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getHistory() {
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    }
  };

  try {
    const response = await fetch('https://localhost:7299/api/TranslationLogs', options);

    if (response.status === 401) {
      alert('You are not authorized to access this page. Please login to continue.');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const translations = data.translations;
    const latestTranslations = translations.slice(-15);

    // Clear the existing history
    historyList.innerHTML = '';

    // Loop through the translations to display them in the history list
    latestTranslations.reverse().forEach(translation => {
      const listItem = document.createElement('li');
      listItem.classList.add('history-item');

      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '<ion-icon id="delete-btn" name="trash"></ion-icon>'; // Font Awesome icon
      deleteBtn.classList.add('delete-btn');
      deleteBtn.onclick = async () => {
        await deleteTranslation(translation.translationLogId);
        getHistory();
      };

      const favBtn = document.createElement('button');
      favBtn.innerHTML = '<ion-icon name="star"></ion-icon>'; // Font Awesome icon
      favBtn.classList.add('fav-btn');
      favBtn.onclick = async () => {
        await addToFavorite(translation.translationLogId);
        getHistory();
      };

      listItem.innerHTML = `
              <div id=${translation.translationLogId}>
                  <strong dir="auto">${translation.sourceText}</strong> → ${translation.targetText}
              </div>
              <div class="timestamp">${new Date(translation.createdAt).toLocaleString()}</div>
          `;

      listItem.appendChild(favBtn);
      listItem.appendChild(deleteBtn);
      historyList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
async function deleteTranslation(id) {
  const options = {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    }
  };

  try {
    const response = await fetch(`https://localhost:7299/api/TranslationLogs/${id}`, options);

    if (response.status === 401) {
      alert('You are not authorized to access this page. Please login to continue.');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    getHistory();

  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteFavorite(id) {
  const options = {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    }
  };

  try {
    const response = await fetch(`https://localhost:7299/api/Favorites/${id}`, options);

    if (response.status === 401) {
      alert('You are not authorized to access this page. Please login to continue.');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }


  } catch (error) {
    console.error('Error:', error);
  }
}

// Document Upload Handler
uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const validFileTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (validFileTypes.includes(file.type)) {
    uploadTitle.innerHTML = file.name;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;
      translate(); // Translate upon file upload
    };
  } else {
    alert("Please upload a valid file");
  }
});

// Download Translated Text
downloadBtn.addEventListener("click", () => {
  const outputText = outputTextElem.value;
  const outputLanguage = outputLanguageDropdown.querySelector(".selected").dataset.value;

  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `translated-to-${outputLanguage}.txt`;
    a.href = url;
    a.click();
  }
});

// Display Input Text Character Count
inputTextElem.addEventListener("input", () => {
  inputChars.innerHTML = inputTextElem.value.length;
});

// Add Event Listener to Translate on Enter Key Press
inputTextElem.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent form submission
    translate(); // Call translate function
  }
});

// Side Panel Functions
function openHistPanel() {
  document.getElementById("favPanel").classList.remove("open");
  document.getElementById("historyPanel").classList.add("open");
  getHistory();
}

function closeHistPanel() {
  document.getElementById("historyPanel").classList.remove("open");
}

function openFavPanel() {
  document.getElementById("historyPanel").classList.remove("open");
  document.getElementById("favPanel").classList.add("open");
  getFavourites();
}

function closeFavPanel() {
  document.getElementById("favPanel").classList.remove("open");
}

// Fetching Languages and Populating Dropdowns
async function fetchLanguages() {
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + authToken,
    },
  };

  try {
    const response = await fetch('https://localhost:7299/api/Languages', options);
    if (response.status === 401) {
      alert('You are not authorized to access this page. Please login to continue.');
      window.location.href = 'login.html';
      return; // Exit function if not authorized
    }
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    languages = data.languages;
    populateDropdowns(); // Populate dropdowns after fetching languages
  } catch (error) {
    console.error('Error fetching languages:', error);
  }
}

function populateDropdowns() {
  const inputDropdown = document.querySelector('#input-language .dropdown-menu');
  const outputDropdown = document.querySelector('#output-language .dropdown-menu');

  inputDropdown.innerHTML = '';
  outputDropdown.innerHTML = '';

  languages.forEach(language => {
    const optionItem = `<li class="option" data-id="${language.languageId}" data-value="${language.languageCode}">${language.languageName}</li>`;
    inputDropdown.insertAdjacentHTML('beforeend', optionItem);
    outputDropdown.insertAdjacentHTML('beforeend', optionItem);
  });

  if (languages.length > 0) {
    setDefaultLanguage('#input-language', languages[0]);
    setDefaultLanguage('#output-language', languages[1]);
  }

  addDropdownListeners(); // Add listeners to dropdown options
}

function setDefaultLanguage(selector, language) {
  const selected = document.querySelector(`${selector} .dropdown-toggle .selected`);
  selected.textContent = language.languageName;
  selected.setAttribute('data-value', language.languageCode);
  selected.setAttribute('data-id', language.languageId);
}

function addDropdownListeners() {
  document.querySelectorAll('.dropdown-menu .option').forEach(option => {
    option.addEventListener('click', function () {
      const dropdownToggle = this.closest('.dropdown-container').querySelector('.dropdown-toggle .selected');
      dropdownToggle.textContent = this.textContent;
      dropdownToggle.setAttribute('data-value', this.getAttribute('data-value'));
      dropdownToggle.setAttribute('data-id', this.getAttribute('data-id'));

      translate();
    });
  });
}

const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language");

// Toggle dropdown visibility and handle language selection
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", () => {
    dropdown.classList.toggle("active"); // Toggle active state
  });

  // Handle selection of a language option within each dropdown
  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active"); // Remove active state from other options
      });
      item.classList.add("active"); // Add active state to selected option
      const selected = dropdown.querySelector(".selected"); // Find selected display element
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
      dropdown.classList.remove("active"); // Close if outside click
    }
  });
});

const swapBtn = document.querySelector(".swap-position"),
  inputLanguage = inputLanguageDropdown.querySelector(".selected"),
  outputLanguage = outputLanguageDropdown.querySelector(".selected"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text");

// Swap input/output languages and text
swapBtn.addEventListener("click", () => {
  const temp = inputLanguage.innerHTML;
  inputLanguage.innerHTML = outputLanguage.innerHTML;
  outputLanguage.innerHTML = temp;

  const tempValue = inputLanguage.dataset.value;
  inputLanguage.dataset.value = outputLanguage.dataset.value;
  outputLanguage.dataset.value = tempValue;

  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate();
});

async function translate(){
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
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({
      sourceLanguageId: parseInt(sourceLanguageId),
      targetLanguageId: parseInt(targetLanguageId),
      sourceText: inputText
    })
  };
  
  await fetch(url, options)
    .then((response) => {
      
      if (response.tatus === 401) {
        alert('You are not authorized to access this page. Please login to continue.');
        window.location.href = 'login.html';
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      outputTextElem.value = data.translation.targetText;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function addToFavorite(id) {
  const options = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
      },
      body: JSON.stringify({
          translationLogId: id
      })
  };

  try {
      const response = await fetch('https://localhost:7299/api/Favourites', options);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      alert('Translation added to favorites');
      // getFavourites();
  } catch (error) {
      console.error('Error:', error);
  }
}

// Document upload handler
const uploadDocument = document.querySelector("#upload-document"),
  uploadTitle = document.querySelector("#upload-title");

uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    uploadTitle.innerHTML = file.name;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;
      translate();
    };
  } else {
    alert("Please upload a valid file");
  }
});

// JavaScript: Add event listener for translate button
document.addEventListener('DOMContentLoaded', () => {
  const translateBtn = document.querySelector('.translate-btn');
  translateBtn.addEventListener('click', translate);
});

// Download button functionality
const downloadBtn = document.querySelector("#download-btn");

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

// Display input text character count
const inputChars = document.querySelector("#input-chars");

inputTextElem.addEventListener("input", () => {
  inputChars.innerHTML = inputTextElem.value.length;
});

// Add event listener to translate when pressing Enter
inputTextElem.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { // Check if the pressed key is Enter
    e.preventDefault(); // Prevent the default action (like a form submission)
    translate(); // Call the translate function
  }
});

// Function to open the side panel
function openFavPanel() {
  document.getElementById("sidePanel").classList.add("open");
}

// Function to close the side panel
function closeFavPanel() {
  document.getElementById("sidePanel").classList.remove("open");
}

// Fetching languages and populating dropdowns
const authToken = localStorage.getItem('authToken');
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
    
    if (response.status === 401) {
      alert('You are not authorized to access this page. Please login to continue.');
      window.location.href = 'login.html';
    }

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
  
  inputDropdown.innerHTML = '';
  outputDropdown.innerHTML = '';

  languages.forEach(language => {
    const inputOptionItem = `<li class="option" data-id="${language.languageId}" data-value="${language.languageCode}">${language.languageName}</li>`;
    const outputOptionItem = `<li class="option" data-id="${language.languageId}" data-value="${language.languageCode}">${language.languageName}</li>`;
    
    inputDropdown.insertAdjacentHTML('beforeend', inputOptionItem);
    outputDropdown.insertAdjacentHTML('beforeend', outputOptionItem);
  });

  if (languages.length > 0) {
    setDefaultLanguage('#input-language', languages[0]);
    setDefaultLanguage('#output-language', languages[1]);
  }

  addDropdownListeners();
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

      translate(); // Trigger translation on selection
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchLanguages();
});

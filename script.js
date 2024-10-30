// Select all dropdown containers for languages, input and output language dropdowns
const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language");

// Populate dropdown options for language selection
function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = ""; // Clear existing options
  options.forEach((option) => {
    const li = document.createElement("li"); // Create list item for each language
    li.innerHTML = option.name; // Set option name
    li.dataset.value = option.code; // Set data value as language code
    li.classList.add("option"); // Add styling class
    dropdown.querySelector("ul").appendChild(li); // Add to dropdown menu
  });
}

// Populate both input and output language dropdowns with languages array
populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

// Toggle dropdown visibility and handle language selection
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
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

// Select swap button, input and output language, text elements
const swapBtn = document.querySelector(".swap-position"),
  inputLanguage = inputLanguageDropdown.querySelector(".selected"),
  outputLanguage = outputLanguageDropdown.querySelector(".selected"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text");

// Swap input/output languages and text
swapBtn.addEventListener("click", (e) => {
  // Swap selected languages
  const temp = inputLanguage.innerHTML;
  inputLanguage.innerHTML = outputLanguage.innerHTML;
  outputLanguage.innerHTML = temp;

  // Swap language codes
  const tempValue = inputLanguage.dataset.value;
  inputLanguage.dataset.value = outputLanguage.dataset.value;
  outputLanguage.dataset.value = tempValue;

  // Swap input and output text
  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate(); // Re-translate after swapping
});

// Translate function: fetches translation from Google Translate API
function translate() {
  const inputText = inputTextElem.value; // Get user input text
  const inputLanguage = inputLanguageDropdown.querySelector(".selected").dataset.value; // Input language code
  const outputLanguage = outputLanguageDropdown.querySelector(".selected").dataset.value; // Output language code
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(inputText)}`;

  fetch(url)
    .then((response) => response.json()) // Parse JSON from response
    .then((json) => {
      outputTextElem.value = json[0].map((item) => item[0]).join(""); // Display translated text
    })
    .catch((error) => {
      console.log(error); // Log errors
    });
}

// Limit input text to 5000 characters and trigger translation on input
inputTextElem.addEventListener("input", (e) => {
  if (inputTextElem.value.length > 5000) {
    inputTextElem.value = inputTextElem.value.slice(0, 5000); // Restrict length
  }
});

// Document upload handler to read and display file content in input area
const uploadDocument = document.querySelector("#upload-document"),
  uploadTitle = document.querySelector("#upload-title");

uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0]; // Select uploaded file
  // Check file type and read as text if valid
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    uploadTitle.innerHTML = file.name; // Display file name
    const reader = new FileReader(); // Create file reader
    reader.readAsText(file); // Read file as text
    reader.onload = (e) => {
      inputTextElem.value = e.target.result; // Display file content
      translate(); // Translate after loading
    };
  } else {
    alert("Please upload a valid file"); // Alert if invalid
  }
});

// Download button functionality for translated text
const downloadBtn = document.querySelector("#download-btn");

downloadBtn.addEventListener("click", (e) => {
  const outputText = outputTextElem.value;
  const outputLanguage = outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" }); // Create text file
    const url = URL.createObjectURL(blob); // Create download link
    const a = document.createElement("a");
    a.download = `translated-to-${outputLanguage}.txt`; // Set download file name
    a.href = url;
    a.click(); // Trigger download
  }
});

// Display input text character count
const inputChars = document.querySelector("#input-chars");

inputTextElem.addEventListener("input", (e) => {
  inputChars.innerHTML = inputTextElem.value.length; // Update character count
});

// Function to open the side panel
function openFavPanel() {
  document.getElementById("sidePanel").classList.add("open");
}

// Function to close the side panel
function closeFavPanel() {
  document.getElementById("sidePanel").classList.remove("open");
}

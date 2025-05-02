'use strict';

window.onload = function() {
    attachFormSubmitHandler();
    getDefinitionsList();
};

// Global event-listener checking every user click for popups
document.addEventListener('click', handleClickOutside);

// Global variables indicating user config options
// TODO: This resets everytime at page reload, may need to turn into cookies!
sessionStorage['guidedModeActive'] = true;
sessionStorage['definitionsActive'] = false;

let definitions = [{}];

function saveUsername(event) {
    event.preventDefault();

    // Determine which popup form was submitted
    let loginEmail = document.querySelector("#loginPopup input[type='email']");
    let signupEmail = document.querySelector("#signupPopup input[type='email']");

    let email = loginEmail?.value || signupEmail?.value; // Get email from either form
    if (!email) {
        return; // Stop execution if no email is found
    }

    const username = email.substring(0, email.indexOf('@'));

    sessionStorage['username'] = username;

    // Close relevant popups
    closeloginPopup();
    closesignupPopup();

    // Redirect to General Finance Mode
    window.location.href = "learningmode.html";
}

// Show the Guided Mode popup
introGuidedModePopup();

// Function to grab the stored username; 'Unknown' otherwise
function displayUsername() {
    const username = sessionStorage['username'];
    if (username) {
        return username;
    } else {
        return "Unknown";
    }
}

// Grab the username and display it for the user when signed in.

if (document.getElementById("greeting") && document.getElementById("greeting p")) {
    let h2 = document.getElementById("greeting");
    h2.textContent = "Hi, " + displayUsername() + "!";

    let beginningDescription = document.getElementById("greeting p");
    // Add <span class='highlight'> to 'Learning Mode'
    beginningDescription.textContent = "Welcome to Learning Mode.";
}


function clearUsername() {
    localStorage.removeItem("username"); // Remove username from storage
    window.location.href = "Initial.html"; // Redirect to the login page
}

// Function to open the popup
function openloginPopup() {
    closesignupPopup(); // Close signup popup
    let popup = document.getElementById("loginPopup");
    popup.style.display = "flex";

    requestAnimationFrame(() => {
        let emailLine = document.getElementById("email");
        emailLine.select(); // Automatically selects the text
    });
}

// Function to close the popup
function closeloginPopup() {
    document.getElementById("loginPopup").style.display = "none";
}

// Function to open the popup
function opensignupPopup() {
    closeloginPopup(); // Close login popup
    let popup = document.getElementById("signupPopup");
    popup.style.display = "flex";

    requestAnimationFrame(() => {
        let emailLine = document.getElementById("email");
        emailLine.select(); // Automatically selects the text
    });
}

// Function to close the popup
function closesignupPopup() {
    document.getElementById("signupPopup").style.display = "none";
}

// Helper function to remove object from DOM
function closePopup(container, object) {
    container.removeChild(object);
}

function clearUsername() {
  localStorage.removeItem("username"); // Remove username from storage
  window.location.href = "Initial.html"; // Redirect to the login page
}

function toggleSubmenu(id) {
    var submenu = document.getElementById(id);
    if (submenu.style.display === "block") {
        submenu.style.display = "none";
    } else {
        submenu.style.display = "block";
    }
}

// Helper function to get the current value of config settings
function getConfigFlag(key) {
    return sessionStorage.getItem(key) === "true";
}

// Helper Function to toggle the user's config preferences within cookies
function toggleConfigFlag(key) {
    const current = getConfigFlag(key);
    if (typeof current === "boolean") {
        sessionStorage.setItem(key, !current);
    }
}

// Store the selected item's ID and text
let selectedItemId = "";
let selectedItemText = "";

let chatprompt = ""

// Get all submenu items
const submenuItems = document.querySelectorAll(".submenu-item");

submenuItems.forEach(item => {
  item.addEventListener("click", () => {
    selectedItemId = item.id;
    selectedItemText = item.textContent;

    // Remove previous highlighted sections (querySelectorAll for redundancy)
    document.querySelectorAll(".submenu-item-selected").forEach(previous => {
        previous.classList.remove("submenu-item-selected");
    });

    /* Highlight selected section.
       Once a user selects a submenu, they can't unselect all options again. */
    document.getElementById(selectedItemId).classList.add("submenu-item-selected");

    console.log("Selected ID:", selectedItemId);
  });
});

function attachFormSubmitHandler() {
    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Collect form data
        const company = document.getElementById('company').value;
        const year = document.getElementById('year').value;
        const prompt = document.getElementById('prompt').value;

        chatprompt = prompt;

        console.log(company, year, prompt, selectedItemId);

        const ticker = company.split(' ').join('').split('-')[0]; // Remove spaces from ticker

        console.log(ticker);

        const apiUrl = 'http://localhost:8000/submit';

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ticker, year, prompt, selectedItemId })
        })
        .then(response => response.json())
        .then(data => {
            displayApiResponse(data);
        })
        .catch(error => {
            document.getElementById('api-response').textContent = 'Error: ' + error;
        });

        document.getElementById('prompt').value = ''; // Clear the prompt input field
    });
}

// Get Definitions JSON data from Python Server
function getDefinitionsList() {
    const apiUrl = 'http://localhost:8000/submitDef';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // definitions = data;
        console.log("This is data at initiation:", data);
        definitions = data;
        console.log(definitions.map(entry => entry.Term.toLowerCase()));
        // console.log("GOOFY AAH FUNCTION BE LIKE:", Object.values(definitions).map(entry => entry.Term));
    })
    .catch(error => {
        document.getElementById('api-response').textContent = error + '\nServer likely not online!';
    });

}

// // Displays all known definitons words as hoverable popups within the LLM response section.
// function displayHoverDefinitions(data) {
//     // Check to see if Definitions mode is active
//     if (getConfigFlag('definitionsActive')) {
//         document.getElementById('api-response').addEventListener('Asynchronous data fetching', function(event) {

//         });
//     }
// }


// Function to handle the search input for company tickers
if (document.URL.includes("learningmode.html")) {
    document.getElementById("company").addEventListener("input", function () {
        let query = this.value.toUpperCase();

        if (query.length > 0) {
            fetch(`http://localhost:8000/search?query=${query}`)
                .then(response => response.json())
                .then(data => {
                    let suggestionsList = document.getElementById("suggestionsList");
                    suggestionsList.innerHTML = ""; // Clear previous results

                    data.forEach(ticker => {
                        let listItem = document.createElement("li");
                        listItem.textContent = ticker;
                        listItem.addEventListener("click", function () {
                            document.getElementById("company").value = ticker;
                            suggestionsList.innerHTML = ""; // Hide suggestions after selection
                        });
                        suggestionsList.appendChild(listItem);
                    });

                    suggestionsList.style.display = data.length > 0 ? "block" : "none"; // Hide if no results
                })
                .catch(error => console.error("Error fetching tickers:", error));
        } else {
            document.getElementById("suggestionsList").innerHTML = "";
        }
    });
}

// Dislplay the API response
function displayApiResponse(data) {
    const pain = document.getElementById("container");
    pain.innerHTML = ""; // Clear previous content

    const container = document.getElementById("api-response");

    const element = document.createElement("div");

    let p = document.createElement("div");

    let XD = document.createElement("md-block");
    XD.classList.add("chatprompt");
    XD.textContent = chatprompt;
    p.appendChild(XD);

    let cringe = document.createElement("br");
    p.appendChild(cringe);

    element.appendChild(p);

    container.appendChild(element);

    for (const key in data) {
        // Value is the LLM API response
        const value = data[key];

        // SEC Citation Source
        if (typeof value === "string" && value.startsWith("http")) {
            let citation = document.createElement('md-block');
            citation.setAttribute("id", "citation-source");
            citation.textContent = `**${formatKey(key)}:**`;

            let source = document.createElement('a');
            source.href = value;
            source.target = "_blank";
            source.textContent = "View Here";

            citation.appendChild(source);
            element.appendChild(citation);
        } else {
            // EDGAR Response
            let EDGAR_Response = document.createElement("md-block");
            EDGAR_Response.classList.add("EDGAR_response");
            addDefinitionPopups(value, EDGAR_Response); // EDGAR_Response.textContent = `**${formatKey(key)}:** ${value}`;
            element.appendChild(EDGAR_Response);
        }

        // container.appendChild(element);

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth' // or 'auto'
        });
    }
}

// Adds definition popups to the returned LLM response
function addDefinitionPopups(value, mdBlock) {
    // Clear mdBlock
    while (mdBlock.firstChild) {
        mdBlock.removeChild(mdBlock.firstChild);
    }

    // Build term-to-definition map (lowercase for matching)
    const termDefinitionMap = {};
    const definitionsTerms = definitions.map(entry => {
        const term = entry.Term.toLowerCase();
        termDefinitionMap[term] = entry.Definition;
        return term;
    });

    // RegExp to tokenize the string into words, spaces, punctuation, etc.
    const tokens = value.match(/(\*\*[^*]+\*\*|\b\w+\b|\s+|[^\w\s])/g);

    tokens.forEach(token => {
        const cleanToken = token.replace(/[*]/g, '').toLowerCase();

        if (definitionsTerms.includes(cleanToken)) {
            const span = document.createElement('span');
            span.className = 'highlighted-term';
            span.textContent = token;
            span.setAttribute('data-definition', termDefinitionMap[cleanToken]);
            span.addEventListener('mouseenter', showDefinitionPopup);
            span.addEventListener('mouseleave', hideDefinitionPopup);
            mdBlock.appendChild(span);
        // } else if (token === '\n') {
        //     mdBlock.appendChild(document.createElement('br'));
        } else {
            mdBlock.appendChild(document.createTextNode(token));
        }
    });
}

let popupEl = null;

function showDefinitionPopup(e) {
    const definition = e.target.getAttribute('data-definition');

    // Remove existing popup if any
    if (popupEl) {
        document.body.removeChild(popupEl);
        popupEl = null;
    }

    // Create popup
    popupEl = document.createElement('div');
    popupEl.className = 'definitionpopup';
    popupEl.textContent = definition;
    document.body.appendChild(popupEl);

    // Position near the hovered word
    const rect = e.target.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    popupEl.style.position = 'absolute';
    popupEl.style.top = `${rect.bottom + scrollTop + 6}px`;
    popupEl.style.left = `${rect.left + scrollLeft}px`;
}

function hideDefinitionPopup() {
    if (popupEl) {
        document.body.removeChild(popupEl);
        popupEl = null;
    }
}

// Settings Config Menu on Searchbar Toggle
function openConfig() {
    const container = document.getElementById("search-container");
    let configMenu = document.getElementById("config-menu");

    if (configMenu) { // If displayed, toggle off Config Menu

        container.removeChild(configMenu);

    } else {

        configMenu = document.createElement("div"); // Config Menu
        configMenu.setAttribute("id", "config-menu");

        let guidedMode = document.createElement("div"); // Guided Mode Option

        guidedMode.setAttribute("id", "tutorial");

        // Toggle Guided Mode
        guidedMode.setAttribute("onclick", "selectConfigOption('tutorial')");

        // Show highlight if applicable
        if (getConfigFlag('guidedModeActive')) {
            guidedMode.classList.add("highlight-dark");
        }

        let guidedModeTitle = document.createElement("h5");
        guidedModeTitle.textContent = "Guided Mode";
        let guidedModeDesc = document.createElement("p");
        guidedModeDesc.textContent = "Removes instructional pop-ups";
        guidedMode.appendChild(guidedModeTitle);
        guidedMode.appendChild(guidedModeDesc);

        let definitions = document.createElement("div"); // Definitions Option

        definitions.setAttribute("id", "definitions");

        // Toggle Definitions Mode
        definitions.setAttribute("onclick", "selectConfigOption('definitions')");

        // Show highlight if applicable
        if (getConfigFlag('definitionsActive')) {
            definitions.classList.add("highlight-dark");
        }

        let definitionsTitle = document.createElement("h5");
        definitionsTitle.textContent = "Definitions";
        let definitionsDesc = document.createElement("p");
        definitionsDesc.textContent = "Provides jargon definitions";
        definitions.appendChild(definitionsTitle);
        definitions.appendChild(definitionsDesc);

        configMenu.appendChild(guidedMode);
        configMenu.appendChild(definitions);

        container.appendChild(configMenu);

    }
}

// Function to drop popups if user clicked outside of popup
function handleClickOutside(event) {

    const currentPage = document.URL; // gets the HTML page

    // Handles Popups in Landing Page (initial.html)
    if (currentPage.includes("initial.html")) {
        const clickedElement = event.target;
        const allPopups = document.querySelectorAll('popup-content');

        console.log("This is allpopups: ", allPopups);

        allPopups.forEach(popup => {
          if (!popup.contains(clickedElement)) {
            if (popup.style.display === "none") {
                popup.style.display = "block";
              } else {
                popup.style.display = "none";
              }
          }
        });
    }

    // Handles Popups in Learning Mode
    else if (currentPage.includes("learningmode.html")) {
        const configMenu = document.getElementById('config-menu');
        const searchContainer = document.getElementById('search-container');

        if (!configMenu) return; // No menu to remove

        const clickedElement = event.target;

        const clickedConfigButton = clickedElement.classList.contains('fa-sliders');

        const clickedInsideMenu = configMenu.contains(clickedElement);

        if (!clickedConfigButton && !clickedInsideMenu) {
        searchContainer.removeChild(configMenu);
        }
    }
}



// Maintain config menu options and currently selected options
function selectConfigOption(selectedOption) {

    // Toggle Guided Mode
    if (selectedOption === 'tutorial') {
        toggleConfigFlag('guidedModeActive'); // toggle the Guided Mode selection
        if (getConfigFlag('guidedModeActive')) {
            document.getElementById('tutorial').classList.add("highlight-dark");
        } else {
            document.getElementById('tutorial').classList.remove("highlight-dark");
        }

    // Toggle Definitions
    } else if (selectedOption === 'definitions') {
        toggleConfigFlag('definitionsActive'); // toggle the Definitions selection
        if (getConfigFlag('definitionsActive')) {
            document.getElementById('definitions').classList.add("highlight-dark");
        } else {
            document.getElementById('definitions').classList.remove("highlight-dark");
        }
    }
}



function formatKey(key) {
    return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}


function buttonquery() {
    const buttonText = event.target.textContent;
    const buttonId = event.target.id; // Get the ID of the clicked button
    console.log("Button clicked:", buttonText);
    console.log("Button ID:", buttonId); // Log the button ID

    const x = buttonId.split(" ")[1]; // Get the second word of the button text
    const button = buttonId.split(" ")[0]; // Get the first word of the button ID

    selectedItemId = x; // Store the button ID in the global variable
    document.getElementById("company").value = button; // Set the input value to the button text
    document.getElementById("prompt").value = buttonText; // Set the input value to the button text
}


// Display initial popup on learningmode telling users to select a company,
// year, and file type. Appears to the right of the sidebar.
function introGuidedModePopup() {
    // If a Guided Mode popup should be shown to the user
    if (getConfigFlag('guidedModeActive') && document.URL.includes("learningmode.html")) {
        let container = document.getElementById("report");
        let target = document.getElementById("dropdown-container");

        let popup = document.createElement("span");
        popup.classList.add("guidedpopup");

        let popupMessage = document.createElement("p");
        popupMessage.classList.add("popup-message");
        popupMessage.textContent = "Select a company, year, and file type.";

        let x_button = document.createElement("span");
        x_button.classList.add("popup-close");
        // x_button.setAttribute("onclick", closePopup(container, popup));
        x_button.textContent = "x";

        popup.appendChild(x_button);
        popup.appendChild(popupMessage);

        document.body.appendChild(popup);

        // Modify the HTML location of the popup
        const rect = container.getBoundingClientRect();
        const targetHeight = target.offsetHeight;

        // "pins" the popup to the right of the company info + popup sizing
        requestAnimationFrame(() => {
            popup.style.position = "absolute";
            popup.style.top = `${window.scrollY + rect.top}px`;
            popup.style.left = `${window.scrollX + rect.right + 10}px`;
            popup.style.height = `${targetHeight - 10}px`; // Height is related to size of target container
        });

        // Remove the popup if the 'x' is clicked
        x_button.addEventListener("click", () => {
            popup.remove();
        });
    // Remove any Guided Mode popups otherwise
    } else {
        // Assuming only 1 Guided Popup at a time
        const existingPopup = document.querySelector(".guidedpopup");
        if (existingPopup) {
            existingPopup.remove();
        }
    }
}
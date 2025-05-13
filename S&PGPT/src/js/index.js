'use strict';

window.onload = function() {
    attachFormSubmitHandler();
    getDefinitionsList();
};

// Global event-listener checking every user click for popups
document.addEventListener('click', handleClickOutside);

// Global variables indicating user config options
// Check to see if already set, if not set to default values
if (localStorage.getItem('guidedModeActive') === null) {
    localStorage.setItem('guidedModeActive', true);
}
if (localStorage.getItem('definitionsActive') === null) {
    localStorage.setItem('definitionsActive', true); // CURRENTLY SET TO TRUE! CHANGE LATER!
}

let definitions = {};

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
    return localStorage.getItem(key) === "true";
}

// Helper Function to toggle the user's config preferences within cookies
function toggleConfigFlag(key) {
    const current = getConfigFlag(key);
    if (typeof current === "boolean") {
        localStorage.setItem(key, !current);
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

        // Create and append loading spinner
        const spinner = document.createElement('div');
        spinner.id = 'spinner';
        spinner.className = 'spinner';
        
        // Create the 4 inner divs
        for (let i = 0; i < 4; i++) {
            const innerDiv = document.createElement('div');
            spinner.appendChild(innerDiv);
        }

        // Append spinner to api-response
        document.getElementById('api-response').appendChild(spinner);
        // Scroll to the bottom of the page when loading bar is displayed
        window.scrollTo(0, document.body.scrollHeight);

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ticker, year, prompt, selectedItemId })
        })
        .then(response => response.json())
        .then(data => {
            // Remove the spinner after the API response is received
            document.getElementById('spinner').remove();
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
        // Definitions is defined at this point
        definitions = data;
        // Setup the definition tooltips for hover definitions
        setupDefinitionHover();
    })
    .catch(error => {
        document.getElementById('api-response').textContent = error;
    });

}


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

                    data.forEach(item => {
                        let listItem = document.createElement("li");
                        // Display just the symbol in the dropdown
                        listItem.textContent = item.symbol;
                        // Store the full name as a data attribute
                        listItem.dataset.fullName = item.fullName;
                        listItem.addEventListener("click", function () {
                            // When clicked, set the input value to just the fullName
                            document.getElementById("company").value = item.fullName;
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

// Display the API response
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
            citation.textContent = `**${formatKey(key)}:**` + " ";

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
            EDGAR_Response.textContent = `**${formatKey(key)}:** ${value}`;
            createDefinitionTags(EDGAR_Response);
            element.appendChild(EDGAR_Response);
        }

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth' // or 'auto'
        });
    }
}



// Function to add definition tags to definition words
// Created using ChatGPT and Claude with numerous (30+) revisions to get the desired functionality
function createDefinitionTags(mdElement) {
    if (!(getConfigFlag('definitionsActive')) || !Array.isArray(definitions) || definitions.length === 0)
        return;

    // Get all unique terms from the definitions array
    const terms = definitions.map(d => d.Term.trim()).filter(Boolean);

    // Escape and prepare the regex to support optional surrounding quotes/parens
    const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // Match term with optional leading/trailing quotes, parentheses, etc.
    const regex = new RegExp(
        `(["'"“‘(\\[]*)(\\b(?:${escapedTerms.join("|")})\\b)([\\])”’"'.,;!?)]*)`,
        "gi"
    );

    // Flag to ensure the tagging only runs once (No double divs)
    let hasRun = false;

    // Function to apply definition tags to the LLM response
    function applyTagging() {
        if (hasRun) return;
        hasRun = true;

        const walker = document.createTreeWalker(mdElement, NodeFilter.SHOW_TEXT, null, false);
        const nodesToUpdate = [];

        let node;
        while ((node = walker.nextNode())) {
            if (regex.test(node.nodeValue)) {
                nodesToUpdate.push(node);
            }
        }

        nodesToUpdate.forEach(textNode => {
            const parent = textNode.parentNode;
            const text = textNode.nodeValue;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            regex.lastIndex = 0;
            const matches = [...text.matchAll(regex)];

            matches.forEach(match => {
                const leading = match[1];
                const word = match[2];
                const trailing = match[3];
                const matchStart = match.index;
                const matchEnd = matchStart + match[0].length;

                if (matchStart > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));
                }

                if (leading) fragment.appendChild(document.createTextNode(leading));

                const cleanedWord = word.toLowerCase().replace(/\s+/g, "-"); // Add .replace(/\s+/g, "-") if want spaces to be dashes

                // Create div for the matched term
                const div = document.createElement("div");
                div.textContent = word;
                div.className = "definition-word";
                div.id = `def-${cleanedWord}`;
                div.style.display = "inline";
                fragment.appendChild(div);

                if (trailing) fragment.appendChild(document.createTextNode(trailing));

                lastIndex = matchEnd;
            });

            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }

            parent.replaceChild(fragment, textNode);
        });
    }

    // MutationObserver: Wait for md-block to render its parsed Markdown
    const observer = new MutationObserver((mutations, obs) => {
        if (mdElement.innerText && mdElement.innerText.trim().length > 0) {
            obs.disconnect();
            applyTagging();
        }
    });

    observer.observe(mdElement, { childList: true, subtree: true });

    // If the LLM response fails to render, re-run the tagging function after 1 second
    setTimeout(() => {
        if (!hasRun && mdElement.innerText && mdElement.innerText.trim().length > 0) {
            observer.disconnect();
            applyTagging();
        }
    }, 1000);
}


// Function to setup the definition hover tooltips
// Created using ChatGPT using the following prompt (and a few revisions):
// "I now want a separate function that triggers whenever an icon with a definition-word is hovered,
//  displaying the definition (under the key 'Definition') of the hovered word depending on its ID."
function setupDefinitionHover() {
    if (!Array.isArray(definitions) || definitions.length === 0) return;

    // Create tooltip element once
    const tooltip = document.createElement("div");
    tooltip.id = "definition-tooltip";
    tooltip.className = "definition-tooltip";
    document.body.appendChild(tooltip);

    // Show tooltip on hover
    document.addEventListener("mouseover", (event) => {
        const el = event.target.closest(".definition-word");
        if (!el) return;

        // Remove the def- prefix
        const cleanedId = el.id.replace(/^def-/, "").toLowerCase();
        
        // Try exact match first (for special terms like 10-K)
        let match = definitions.find(def => def.Term.toLowerCase() === cleanedId);
        
        // If no match found, try with dashes replaced by spaces
        if (!match) {
            const cleanedIdNoDashes = cleanedId.replace(/-/g, " ");
            match = definitions.find(def => def.Term.toLowerCase() === cleanedIdNoDashes);
        }
        // If no match found, exit
        if (!match) return;

        tooltip.textContent = match.Definition;
        tooltip.style.display = "block";

        const rect = el.getBoundingClientRect();
        tooltip.style.top = `${window.scrollY + rect.bottom + 8}px`;
        tooltip.style.left = `${window.scrollX + rect.left}px`;
    });

    // Hide tooltip on mouseout
    document.addEventListener("mouseout", (event) => {
        const el = event.target.closest(".definition-word");
        if (el) {
            tooltip.style.display = "none";
        }
    });
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
        popupMessage.textContent = "Select a company ticker, year, and file type.";

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
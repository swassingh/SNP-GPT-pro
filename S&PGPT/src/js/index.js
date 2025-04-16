'use strict';


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
    document.getElementById("loginPopup").style.display = "flex";
}

// Function to close the popup
function closeloginPopup() {
    document.getElementById("loginPopup").style.display = "none";
}

// Function to open the popup
function opensignupPopup() {
    closeloginPopup(); // Close login popup
    document.getElementById("signupPopup").style.display = "flex";
}

// Function to close the popup
function closesignupPopup() {
    document.getElementById("signupPopup").style.display = "none";
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

    console.log("Selected ID:", selectedItemId);
    console.log("Selected Text:", selectedItemText);
  });
});

// Function to handle form submission
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const company = document.getElementById('company').value;
    const year = document.getElementById('year').value;
    const prompt = document.getElementById('prompt').value;

    chatprompt = prompt

    console.log(company, year, prompt, selectedItemId);

    const ticker = company.split(' ').join('').split('-')[0]; // Remove spaces from ticker

    console.log(ticker);

    // Replace with your API endpoint
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

// Function to handle the search input for company tickers
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

    for (const key in data) {
        const value = data[key];

        // SEC Citation Source
        if (typeof value === "string" && value.startsWith("http")) {
            let citation = document.createElement('md-block');
            // citation.setAttribute = ("id", "citation");
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
            EDGAR_Response.textContent = `**${formatKey(key)}:** ${value}`;
            element.appendChild(EDGAR_Response);
        }

        container.appendChild(element);

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth' // or 'auto'
          });
    }
}

function openConfig() {
    const container = document.getElementById("search-container");
    let configMenu = document.getElementById("config-menu");

    if (configMenu) {

        container.removeChild(configMenu);

    } else {

        configMenu = document.createElement("div");
        configMenu.setAttribute("id", "config-menu");

        let guidedMode = document.createElement("div");
        // guidedMode.classList.add("popup");
        guidedMode.setAttribute("id", "tutorial");
        let guidedModeTitle = document.createElement("h5");
        guidedModeTitle.textContent = "Guided Mode";
        let guidedModeDesc = document.createElement("p");
        guidedModeDesc.textContent = "Removes instructional pop-ups";
        guidedMode.appendChild(guidedModeTitle);
        guidedMode.appendChild(guidedModeDesc);

        let definitions = document.createElement("div");
        // definitions.classList.add("popup");
        definitions.setAttribute("id", "definitions");
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

function formatKey(key) {
    return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

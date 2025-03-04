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


document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const company = document.getElementById('company').value;
    const year = document.getElementById('year').value;
    const prompt = document.getElementById('prompt').value;

    console.log(company, year, prompt);

    const ticker = company.split(' ').join('').split('-')[0]; // Remove spaces from ticker

    console.log(ticker);

    // Replace with your API endpoint
    const apiUrl = 'http://localhost:8000/submit';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticker, year, prompt })
    })
    .then(response => response.json())
    .then(data => {
        displayApiResponse(data);
    })
    .catch(error => {
        document.getElementById('api-response').textContent = 'Error: ' + error;
    });
});


/*
 * This code currently does not work, as we do not have a server or container
 * to run our database. As such, when directly loading the HTML page on a
 * browser, we hit a Cross-Origin Resource Sharing (CORS) error.
 *
 * We may want to look into developing a Node.js or Docker container to
 * implement the Trie structure to operate properly.
 * 
 * if (document.getElementById('company') && document.getElementById('suggestionsList')) {
    const companyInput = document.getElementById('company');
    const suggestionsList = document.getElementById('suggestionsList');

    const fetchCompanies = async (prefix) => {
        try {
            const response = await fetch(`/get-companies?prefix=${prefix}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displaySuggestions(data.companies); // Call function to display suggestions
        } catch (error) {
            console.error('Could not fetch companies:', error);
            suggestionsList.innerHTML = `<li>Error fetching data</li>`; // Display error in suggestions
            suggestionsList.style.display = 'block'; // Make sure suggestion box is visible to show error
        }
    };

    const displaySuggestions = (companies) => {
        suggestionsList.innerHTML = ''; // Clear previous suggestions
        if (companies && companies.length > 0) {
            companies.forEach(company => {
                const li = document.createElement('li');
                li.textContent = company;

                li.addEventListener('click', () => { // Add click handler to fill input on suggestion click
                    companyInput.value = company;     // Fill the input with the clicked suggestion
                    suggestionsList.style.display = 'none'; // Hide suggestions after selection
                    // You can add further action here if needed, e.g., submit a form, display more info, etc.
                });

                suggestionsList.appendChild(li);
            });
            suggestionsList.style.display = 'block'; // Show suggestions box
        } else {
            suggestionsList.style.display = 'none'; // Hide suggestions box if no results
        }
    };

    // Initial load - Top 10 companies
    fetchCompanies('');

    companyInput.addEventListener('input', (event) => {
        const prefix = companyInput.value;
        if (prefix.trim().length >= 0) { // You can adjust the minimum prefix length if needed (e.g., >= 1 to start searching after first char)
            fetchCompanies(prefix);
        } else {
            suggestionsList.style.display = 'none'; // Hide suggestions if input is empty or whitespace
            suggestionsList.innerHTML = ''; // Clear suggestions when input is cleared
                fetchCompanies(''); // Re-fetch top 10 when input is empty, if desired. Remove if you don't want to re-show initial list
        }
    });

    // Initially hide suggestions list on page load
    suggestionsList.style.display = 'none';

    // Optional: Hide suggestions list when clicking outside input/suggestions
    document.addEventListener('click', (event) => {
        if (!companyInput.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.style.display = 'none';
        }
    });
}

 */
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


function displayApiResponse(data) {
    const container = document.getElementById("api-response");
    container.innerHTML = ""; // Clear previous content

    for (const key in data) {
        const value = data[key];

        const element = document.createElement("p");

        if (typeof value === "string" && value.startsWith("http")) {
            element.innerHTML = `<strong>${formatKey(key)}:</strong> <a href="${value}" target="_blank">View Here</a>`;
        } else {
            element.innerHTML = `<strong>${formatKey(key)}:</strong> ${value}`;
        }

        container.appendChild(element);
    }
}

function formatKey(key) {
    return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

'use strict';

let idk;

function saveUsername(event) {
    event.preventDefault();

    // Determine which popup form was submitted
    let loginEmail = document.querySelector("#loginPopup input[type='email']");
    let signupEmail = document.querySelector("#signupPopup input[type='email']");

    let email = loginEmail?.value || signupEmail?.value; // Get email from either form
    if (!email) {
        return; // Stop execution if no email is found
    }

    console.log("test?"); // THIS CONSOLE.LOG ISN'T RUNNING???
    const username = email.substring(0, email.indexOf('@'));
    console.log("THIS IS USERNAME IN saveUsername: ", username);
    idk = username; // THIS GLOBAL VARIABLE MAY NOT BE GETTING UPDATED?!

    localStorage.setItem("username", username); // Store username
    console.log("Here is proof of localstorage set before heading to learningmode: ", localStorage.username);

    // Close relevant popups
    closeloginPopup();
    closesignupPopup();

    // Redirect to General Finance Mode
    window.location.href = "learningmode.html";
}

// Function to grab the stored username; 'Unknown' otherwise
function displayUsername() {
    console.log("This is idk: ", idk);
    const username = localStorage.getItem("username");
    if (username) {
        return username;
    } else {
        return "Unknown";
    }
}

// Grab the username and display it for the user when signed in.
let h2 = document.getElementById("greeting");
h2.textContent = "Hi, " + displayUsername() + "!";

let beginningDescription = document.getElementById("greeting p");
// Add <span class='highlight'> to 'Learning Mode'
beginningDescription.textContent = "Welcome to Learning Mode.";

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

function saveUsername(event) {
    event.preventDefault();

    // Determine which popup form was submitted
    let loginEmail = document.querySelector("#loginPopup input[type='email']");
    let signupEmail = document.querySelector("#signupPopup input[type='email']");

    let email = loginEmail?.value || signupEmail?.value; // Get email from either form
    if (!email) return; // Stop execution if no email is found

    const username = email.substring(0, email.indexOf('@'));

    localStorage.setItem("username", username); // Store username
    console.log("Here is proof of localstorage set before heading to learningmode: ", localStorage.username);
    console.log(localStorage);

    // Close relevant popups
    closeloginPopup();
    closesignupPopup();

    // Redirect to General Finance Mode
    window.location.href = "learningmode.html";
}

console.log(localStorage);
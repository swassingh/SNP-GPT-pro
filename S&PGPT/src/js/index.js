'use strict';

// Grab the username of a user who signs in from initial.html
// WORK IN PROGRESS!
let newUsername = document.getElementById("myPopup");
// console.log("This is newUsername: ", newUsername);

// WORK IN PROGRESS!
function saveUsername(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const username = email.substring(0, email.indexOf('@'));

    localStorage.setItem("username", username); // Store username
    closePopup(); // Close login popup

    window.location.href = "generalmode.html"; // Redirect to General Finance Mode
}

// Grab the username and display it for the user when signed in.
let h2 = document.getElementById("greeting");
h2.textContent = "Welcome " + displayUsername() + "!";

let beginningDescription = document.getElementById("greeting p");
// Add <span class='highlight'> to 'Learning Mode'
beginningDescription.textContent = "Welcome to Learning Mode.";


// Function to grab the stored username; 'Unknown' otherwise
function displayUsername() {
    const username = localStorage.getItem("username"); // Will need to change...
    // console.log("This is username: ", username);
    if (username) {
        return username;
    } else {
        return "Unknown";
    }
}

function clearUsername() {
    localStorage.removeItem("username"); // Remove username from storage
    window.location.href = "Initial.html"; // Redirect to the login page
}
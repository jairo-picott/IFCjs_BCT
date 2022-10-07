const loginContainer = document.getElementById("login-container");
const siteContainer = document.getElementById("site-container");
const form = document.getElementById("login-form");
const go = document.getElementById("submit-go");
const username = document.getElementById("username");



go.addEventListener("click", function() {
    if (username.value) {
        document.getElementById("username-title").innerText = username.value;
        openViewer();
    } else {
        alert("Please enter a valid name");
    }
})




function openViewer() {
    loginContainer.hidden = true;
    siteContainer.hidden = false;
}

function goLobby() {
    loginContainer.hidden = false;
    siteContainer.hidden = true;
}
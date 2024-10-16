// Global Variable
var video = document.getElementById("example");
var videoSource = document.getElementById("vid-src");
var descriptionSource = document.getElementById("despsrc");

// Hamburger Menu Function
function hamburger() {
    var menu = document.getElementById("menu-links");
    var logo = document.getElementById("header");
    if (menu.style.display === "block" && logo.style.display === "none") {
        menu.style.display = "none";
        logo.style.display = "block";
    } else {
        menu.style.display = "block";
        logo.style.display = "none";
    }
}
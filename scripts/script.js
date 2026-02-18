// Global Variables
var video = document.getElementById("example");
var videoSource = document.getElementById("vid-src");
var descriptionSource = document.getElementById("despsrc");

// Create Sticky Header and Top Scroll Progress Bar
window.addEventListener("load", () => {
  initProgressBarTop();
  animateHeaders();
  animateFrames();
  animateVideosOnScroll();
  typeText("intro-text", 50);
  initProgressBars();
  initFloatingElements();
  animateContent();
});

// Hamburger Menu Function
function hamburger() {
  var menu = document.getElementById("menu-links");

  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}

// Page Load Animations
function animateHeaders() {
  document.querySelectorAll("h1").forEach((h1, i) => {
    h1.style.opacity = 0;
    h1.style.transform = "translateY(-30px)";
    setTimeout(() => {
      h1.style.transition = "all 0.8s ease";
      h1.style.opacity = 1;
      h1.style.transform = "translateY(0)";
    }, 200 * i);
  });
}

function animateFrames() {
  document.querySelectorAll(".frame").forEach((frame, i) => {
    frame.style.opacity = 0;
    frame.style.transform = "translateY(30px)";
    setTimeout(() => {
      frame.style.transition = "all 0.6s ease";
      frame.style.opacity = 1;
      frame.style.transform = "translateY(0)";
    }, 150 * i);
  });
}

// Animate paragraphs and lists
function animateContent() {
  document.querySelectorAll("p, li").forEach((el, i) => {
    el.style.opacity = 0;
    el.style.transform = "translateY(20px)";
    setTimeout(() => {
      el.style.transition = "all 0.8s ease-out";
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }, 100 * i);
  });
}

// Scroll-triggered animations
function animateOnScroll() {
  const triggerElements = document.querySelectorAll(
    ".animate-on-scroll, p, li",
  );
  const windowBottom = window.scrollY + window.innerHeight;

  triggerElements.forEach((el) => {
    const elementTop = el.offsetTop;
    if (windowBottom > elementTop + 50) {
      el.style.transition = "all 0.8s ease-out";
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }
  });

  animateVideosOnScroll();
  animateFloatingElements();
  animateProgressBars();
  updateProgressBarTop();
}
window.addEventListener("scroll", animateOnScroll);

// Animate videos on scroll
function animateVideosOnScroll() {
  const videos = document.querySelectorAll("video");
  const scrollY = window.scrollY + window.innerHeight;

  videos.forEach((video) => {
    const rect = video.getBoundingClientRect();
    const videoTop = rect.top + window.scrollY;
    if (scrollY > videoTop + 100) {
      video.style.transition = "opacity 1s ease, transform 1s ease";
      video.style.opacity = 1;
      video.style.transform = "translateY(0)";
    } else {
      video.style.opacity = 0.5;
      video.style.transform = "translateY(20px)";
    }
  });
}

// Grid frame hover animation
document.querySelectorAll(".frame").forEach((frame) => {
  frame.addEventListener("mouseenter", () => {
    frame.style.transform = "translateY(-10px) scale(1.05)";
    frame.style.transition = "transform 0.3s ease";
  });
  frame.addEventListener("mouseleave", () => {
    frame.style.transform = "translateY(0) scale(1)";
  });
});

// Optional Typing Text Effect
function typeText(elementId, speed = 50) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText;
  el.innerText = "";
  let i = 0;
  const typing = setInterval(() => {
    el.innerText += text[i];
    i++;
    if (i >= text.length) clearInterval(typing);
  }, speed);
}

// Smooth Page Transitions
document.querySelectorAll("a").forEach((link) => {
  if (!link.href.includes(window.location.hostname)) return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.style.transition = "opacity 0.6s ease";
    document.body.style.opacity = 0;
    setTimeout(() => {
      window.location.href = link.href;
    }, 600);
  });
});

// Floating Elements / Parallax
function initFloatingElements() {
  document.querySelectorAll(".floating").forEach((el) => {
    el.dataset.originalY = el.offsetTop;
    el.style.transition = "transform 0.3s ease";
  });
}

function animateFloatingElements() {
  const scrollY = window.scrollY;
  document.querySelectorAll(".floating").forEach((el) => {
    const speed = el.dataset.speed ? parseFloat(el.dataset.speed) : 0.2;
    el.style.transform = `translateY(${(el.dataset.originalY - scrollY) * speed}px)`;
  });
}

// Progress Bars Animation
function initProgressBars() {
  document.querySelectorAll(".progress-bar").forEach((bar) => {
    bar.style.width = "0%";
    bar.style.transition = "width 1.5s ease-out";
  });
}

function animateProgressBars() {
  const scrollY = window.scrollY + window.innerHeight;
  document.querySelectorAll(".progress-bar").forEach((bar) => {
    const top = bar.offsetTop;
    if (scrollY > top) {
      const value = bar.dataset.value || "70";
      bar.style.width = value + "%";
    }
  });
}

// Top Scroll Progress Bar
function initProgressBarTop() {
  const bar = document.createElement("div");
  bar.id = "top-progress-bar";
  bar.style.position = "fixed";
  bar.style.top = 0;
  bar.style.left = 0;
  bar.style.height = "5px";
  bar.style.width = "0%";
  bar.style.backgroundColor = "#ff8528";
  bar.style.zIndex = 9999;
  document.body.appendChild(bar);

  // Make header sticky
  const header = document.querySelector("header");
  header.style.position = "sticky";
  header.style.top = "0";
  header.style.zIndex = 9998;
}

function updateProgressBarTop() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrolled = (scrollTop / docHeight) * 100;
  document.getElementById("top-progress-bar").style.width = scrolled + "%";
}

// Cursor Effects
const cursor = document.createElement("div");
cursor.id = "custom-cursor";
document.body.appendChild(cursor);

cursor.style.width = "20px";
cursor.style.height = "20px";
cursor.style.border = "2px solid #F5934A";
cursor.style.borderRadius = "50%";
cursor.style.position = "fixed";
cursor.style.pointerEvents = "none";
cursor.style.transform = "translate(-50%, -50%)";
cursor.style.transition = "transform 0.1s ease, background-color 0.2s ease";
cursor.style.zIndex = 9999;

document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1.8)";
    cursor.style.backgroundColor = "rgba(245, 147, 74, 0.3)";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
    cursor.style.backgroundColor = "transparent";
  });
});

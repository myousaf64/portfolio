import { ProjectCard } from "./ProjectCard.js";
// import { Nav } from "./nav.js";
import { responseParsed, displayElements } from "./utils.js";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// const nav = new Nav();
// nav.injectTo(document.body);

const OTHER_TITLES = [
  "a 42 student",
  "an elite norminetter",
  "a proud Pakistani",
  "a software developer",
  "an embedded systems enthusiast",
  "in your house...",
];
const otherTitlesEl = document.querySelector(".otherTitles");

// Display a new title every duration milliseconds
const TITLE_DURATION = 2000;
setInterval(() => {
  otherTitlesEl.style.transform = "translateY(25px) rotateZ(5deg)";
  setTimeout(() => {
    otherTitlesEl.innerText = OTHER_TITLES[getRandomInt(OTHER_TITLES.length)];
    otherTitlesEl.style.transform = "initial";
  }, 250);
}, TITLE_DURATION);

// Handle landing page button clicks
const projectsBtn = document.querySelector(".projectsBtn");
const aboutBtn = document.querySelector(".aboutBtn");

aboutBtn.onclick = () => {
  window.open("#about", "_self");
};
projectsBtn.onclick = () => {
  window.open("#projects", "_self");
};

const projectsWrapper = document.querySelector(".projectsWrapper");

const HIGHLIGHTED_REPO_NAMES = ["wipe", "IRC-server", "push_swap", "cub3D"];

// Loop through each repository that was found and create a project card for it and add it to the website
responseParsed.forEach((repo) => {
  if (HIGHLIGHTED_REPO_NAMES.includes(repo.name)) {
    let card = new ProjectCard(
      repo.name,
      repo.description,
      repo.topics,
      repo.clone_url,
    );
    projectsWrapper.append(card);
  }
});

const observerOptions = {
  threshold: 0.5,
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      displayElements(entry.target);
    }
  });
}, observerOptions);

const landingPage = document.querySelector(".landing");
const projectsPage = document.querySelector(".projects");
const navBar = document.querySelector("nav");
const aboutPage = document.querySelector(".about");
const observedPages = [landingPage, projectsPage, navBar, aboutPage];

observedPages.forEach((page) => {
  observer.observe(page);
});

const viewMoreProjectsBtn = document.querySelector(".projects__viewMoreBtn");
viewMoreProjectsBtn.onclick = () => {
  window.location.assign("./projects.html");
};

export { displayElements };

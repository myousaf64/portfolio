// github.js - public repos for the project grids. Loaded by index.html and projects.html.

import { revealIn } from "./main.js";

const USER = "myousaf64";
const API = `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`;
const PROFILE = `https://github.com/${USER}`;
const CACHE_KEY = "repos:" + USER;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour. The API allows 60 unauthenticated calls per hour per IP.

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { time, repos } = JSON.parse(raw);
    if (Date.now() - time > CACHE_TTL) return null;
    return repos;
  } catch {
    return null;
  }
}

function writeCache(repos) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), repos }));
  } catch {
    /* storage full or blocked: the page works, it just refetches next load */
  }
}

async function loadRepos() {
  const cached = readCache();
  if (cached) return cached;

  const response = await fetch(API);
  if (!response.ok) throw new Error(`GitHub API responded ${response.status}`);

  const repos = (await response.json())
    .filter((repo) => !repo.fork && !repo.archived)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url, // html_url, not clone_url: clone_url opens a .git address
      language: repo.language,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
    }));

  writeCache(repos);
  return repos;
}

function repoCard(repo) {
  const item = document.createElement("li");
  item.className = "card card--link reveal";

  const title = document.createElement("h3");
  const link = document.createElement("a");
  link.href = repo.url;
  link.textContent = repo.name;
  title.append(link);

  const description = document.createElement("p");
  description.className = "card__desc";
  description.textContent = repo.description || "No description on GitHub yet.";

  item.append(title, description);

  const tags = [repo.language, ...repo.topics.slice(0, 3)].filter(Boolean);

  if (tags.length) {
    const list = document.createElement("ul");
    list.className = "tags";
    tags.forEach((tag) => {
      const entry = document.createElement("li");
      entry.className = "tag";
      entry.textContent = tag;
      list.append(entry);
    });
    item.append(list);
  }

  return item;
}

function renderEmpty(target, message) {
  const note = document.createElement("p");
  note.className = "empty-state";
  note.innerHTML = `${message} You can browse them directly at <a href="${PROFILE}">github.com/${USER}</a>.`;
  target.replaceChildren(note);
}

async function render() {
  const target = document.querySelector("[data-repos]");
  if (!target) return;

  const limit = Number(target.dataset.repos) || Infinity;

  try {
    const repos = await loadRepos();
    if (!repos.length) {
      renderEmpty(target, "No public repositories to show right now.");
      return;
    }
    target.replaceChildren(...repos.slice(0, limit).map(repoCard));
    revealIn(target);
  } catch {
    renderEmpty(target, "The GitHub list could not load.");
  }
}

render();

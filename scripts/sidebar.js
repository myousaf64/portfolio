// sidebar.js - keyboard-driven navigation drawer. Loaded by every page.
// The whole panel is built here rather than repeated in three HTML files.

// Motion is handled entirely by the prefers-reduced-motion block in site.css.
import { toggleTheme } from "./main.js";

const EMAIL = "64yousaf@gmail.com";

const PAGES = [
  { label: "Home", href: "./index.html", file: "index.html", icon: "⌂", key: "h" },
  { label: "Projects", href: "./projects.html", file: "projects.html", icon: "▦", key: "p" },
  { label: "Experience", href: "./experience.html", file: "experience.html", icon: "☰", key: "e" },
];

const SHORTCUTS = [
  { keys: ["Ctrl", "Shift", "B"], label: "Open or close this panel" },
  { keys: ["Ctrl", "K"], label: "Open and search" },
  { keys: ["/"], label: "Open and search" },
  { keys: ["g", "h"], label: "Go to home" },
  { keys: ["g", "p"], label: "Go to projects" },
  { keys: ["g", "e"], label: "Go to experience" },
  { keys: ["?"], label: "Show this list" },
  { keys: ["Esc"], label: "Close" },
];

const currentFile = location.pathname.split("/").pop() || "index.html";
const trigger = document.querySelector(".nav-trigger");
const main = document.querySelector("main");
const header = document.querySelector(".site-header");

/* ---------- build ---------- */

function row(tag, { label, icon, hint, href, onClick, current }) {
  const el = document.createElement(tag);
  el.className = "sidebar__row";
  if (href) el.href = href;
  if (tag === "button") el.type = "button";
  if (current) el.setAttribute("aria-current", "page");

  const glyph = document.createElement("span");
  glyph.className = "sidebar__icon";
  glyph.setAttribute("aria-hidden", "true");
  glyph.textContent = icon;

  const text = document.createElement("span");
  text.textContent = label;

  el.append(glyph, text);

  if (hint) {
    const kbd = document.createElement("kbd");
    kbd.textContent = hint;
    el.append(kbd);
  }

  if (onClick) el.addEventListener("click", onClick);
  return el;
}

function group(title, rows) {
  const section = document.createElement("div");
  section.className = "sidebar__group";

  const heading = document.createElement("h2");
  heading.textContent = title;

  const list = document.createElement("ul");
  list.className = "sidebar__list";
  rows.forEach((r) => {
    const li = document.createElement("li");
    li.append(r);
    list.append(li);
  });

  section.append(heading, list);
  return section;
}

// Section outline, read from the page itself.
function outlineRows() {
  const headings = [...document.querySelectorAll("main h2")];
  return headings.map((h, index) => {
    if (!h.id) h.id = `section-${index + 1}`;
    const r = row("a", { label: h.textContent.trim(), icon: "§", href: `#${h.id}` });
    r.dataset.section = h.id;
    return r;
  });
}

async function copyEmail(event) {
  const button = event.currentTarget;
  const text = button.querySelector("span:nth-child(2)");
  try {
    await navigator.clipboard.writeText(EMAIL);
    text.textContent = "Email copied";
  } catch {
    text.textContent = EMAIL; // clipboard blocked: show it so it can be copied by hand
  }
  setTimeout(() => (text.textContent = "Copy email"), 1600);
}

const backdrop = document.createElement("div");
backdrop.className = "sidebar-backdrop";

const panel = document.createElement("aside");
panel.className = "sidebar";
panel.id = "sidebar";
panel.setAttribute("role", "dialog");
panel.setAttribute("aria-modal", "true");
panel.setAttribute("aria-label", "Site menu");

const search = document.createElement("input");
search.type = "search";
search.className = "sidebar__search";
search.placeholder = "Search pages and sections";
search.setAttribute("aria-label", "Search pages and sections");

const closeButton = document.createElement("button");
closeButton.type = "button";
closeButton.className = "sidebar__close";
closeButton.setAttribute("aria-label", "Close menu");
closeButton.textContent = "✕";

const head = document.createElement("div");
head.className = "sidebar__head";
head.append(search, closeButton);

const body = document.createElement("div");
body.className = "sidebar__body";

const pageRows = PAGES.map((p) =>
  row("a", { label: p.label, icon: p.icon, href: p.href, hint: `g ${p.key}`, current: p.file === currentFile })
);

const sections = outlineRows();

const actionRows = [
  row("a", { label: "Download CV", icon: "↓", href: "./assets/CV.pdf" }),
  row("button", { label: "Copy email", icon: "✉", onClick: copyEmail }),
  row("button", { label: "Toggle theme", icon: "◑", onClick: toggleTheme }),
  row("a", { label: "GitHub", icon: "⌘", href: "https://github.com/myousaf64" }),
  row("a", { label: "LinkedIn", icon: "◎", href: "https://linkedin.com/in/myousaf64" }),
];

actionRows[0].setAttribute("download", "");

const groups = [group("Pages", pageRows)];
if (sections.length) groups.push(group("On this page", sections));
groups.push(group("Actions", actionRows));

const noResults = document.createElement("p");
noResults.className = "sidebar__empty";
noResults.textContent = "Nothing matches.";
noResults.hidden = true;

body.append(...groups, noResults);

const foot = document.createElement("div");
foot.className = "sidebar__foot";
SHORTCUTS.forEach(({ keys, label }) => {
  const line = document.createElement("p");
  line.className = "sidebar__shortcut";
  const text = document.createElement("span");
  text.textContent = label;
  const combo = document.createElement("span");
  keys.forEach((k) => {
    const kbd = document.createElement("kbd");
    kbd.textContent = k;
    combo.append(kbd);
  });
  line.append(text, combo);
  foot.append(line);
});

panel.append(head, body, foot);
document.body.append(backdrop, panel);

/* ---------- open and close ---------- */

let isOpen = false;
let lastFocus = null;

function focusable() {
  return [...panel.querySelectorAll("a[href], button, input")].filter((el) => !el.closest("[hidden]"));
}

function open({ focusSearch = true } = {}) {
  if (isOpen) return;
  isOpen = true;
  lastFocus = document.activeElement;
  document.body.classList.add("sidebar-open");
  trigger?.setAttribute("aria-expanded", "true");
  main?.setAttribute("inert", "");
  header?.setAttribute("inert", "");
  if (focusSearch) search.focus();
  else closeButton.focus();
}

// restoreFocus is false when a link closed the panel: sending focus back to the
// trigger in the sticky header would scroll away from the section just jumped to.
function close({ restoreFocus = true } = {}) {
  if (!isOpen) return;
  isOpen = false;
  document.body.classList.remove("sidebar-open");
  trigger?.setAttribute("aria-expanded", "false");
  main?.removeAttribute("inert");
  header?.removeAttribute("inert");
  search.value = "";
  filter("");
  if (restoreFocus) lastFocus?.focus?.();
}

function toggle() {
  isOpen ? close() : open();
}

trigger?.addEventListener("click", toggle);
closeButton.addEventListener("click", close);
backdrop.addEventListener("click", close);

// A link inside the panel closes it. A same-page anchor also needs the scroll.
panel.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (link && !link.hasAttribute("download") && link.target !== "_blank") {
    close({ restoreFocus: false });
    // A same-page anchor must still move focus, or the keyboard stays at the top.
    const id = link.getAttribute("href")?.startsWith("#") && link.getAttribute("href").slice(1);
    if (id) {
      const heading = document.getElementById(id);
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }
  }
});

/* ---------- filter ---------- */

function filter(query) {
  const q = query.trim().toLowerCase();
  let visible = 0;

  groups.forEach((g) => {
    let shown = 0;
    g.querySelectorAll(".sidebar__row").forEach((r) => {
      const match = !q || r.textContent.toLowerCase().includes(q);
      r.parentElement.hidden = !match;
      r.classList.remove("is-active");
      if (match) shown += 1;
    });
    g.hidden = shown === 0;
    visible += shown;
  });

  noResults.hidden = visible > 0;
  foot.hidden = Boolean(q);
}

search.addEventListener("input", () => filter(search.value));

/* ---------- arrow keys inside the panel ---------- */

function rows() {
  return [...panel.querySelectorAll(".sidebar__row")].filter((r) => !r.parentElement.hidden);
}

function move(step) {
  const list = rows();
  if (!list.length) return;
  const index = list.findIndex((r) => r.classList.contains("is-active"));
  const nextIndex =
    index < 0 ? (step > 0 ? 0 : list.length - 1) : (index + step + list.length) % list.length;
  const next = list[nextIndex];
  list.forEach((r) => r.classList.remove("is-active"));
  next.classList.add("is-active");
  next.scrollIntoView({ block: "nearest" });
}

panel.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    move(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    move(-1);
  } else if (event.key === "Enter" && event.target === search) {
    const active = panel.querySelector(".sidebar__row.is-active") || rows()[0];
    active?.click();
  } else if (event.key === "Tab") {
    // Trap focus inside the panel.
    const list = focusable();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

/* ---------- scroll spy ---------- */

if (sections.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sections.forEach((r) => r.classList.toggle("is-current-section", r.dataset.section === entry.target.id));
      });
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  document.querySelectorAll("main h2").forEach((h) => spy.observe(h));
}

/* ---------- shortcuts ---------- */

// The old scripts/index.js bound bare "p" and "h" with no guard, so typing either
// character anywhere navigated the page. Every bare key below checks this first.
function typing(target) {
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

let pendingGo = 0;

document.addEventListener("keydown", (event) => {
  const mod = event.ctrlKey || event.metaKey;

  // Ctrl/Cmd+Shift+B. Collides with the bookmarks bar; preventDefault claims it.
  if (mod && event.shiftKey && event.key.toLowerCase() === "b") {
    event.preventDefault();
    toggle();
    return;
  }

  // Ctrl/Cmd+K, the command-palette convention.
  if (mod && !event.shiftKey && event.key.toLowerCase() === "k") {
    event.preventDefault();
    isOpen ? close() : open();
    return;
  }

  if (event.key === "Escape" && isOpen) {
    event.preventDefault();
    close();
    return;
  }

  if (mod || event.altKey || typing(event.target)) return;

  if (event.key === "/") {
    event.preventDefault();
    open();
    return;
  }

  if (event.key === "?") {
    event.preventDefault();
    open({ focusSearch: false });
    foot.scrollIntoView({ block: "nearest" });
    return;
  }

  // "g" then h / p / e, within one second.
  if (event.key === "g") {
    pendingGo = Date.now();
    return;
  }

  if (pendingGo && Date.now() - pendingGo < 1000) {
    const page = PAGES.find((p) => p.key === event.key);
    pendingGo = 0;
    if (page) {
      event.preventDefault();
      location.href = page.href;
    }
    return;
  }

  pendingGo = 0;
});

// The panel needs no JavaScript-free fallback: the header keeps its three links.
if (trigger) trigger.hidden = false;

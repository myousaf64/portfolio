// main.js - theme, reveal, scroll progress and metric count-up. Loaded by every page.

const root = document.documentElement;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- theme ---------- */

function storedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function activeTheme() {
  return root.dataset.theme || (systemPrefersDark() ? "dark" : "light");
}

function setTheme(theme) {
  root.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* private mode or blocked storage: the theme still applies for this page */
  }
  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
  document.querySelectorAll(".theme-toggle").forEach((b) => b.setAttribute("aria-label", label));
}

export function toggleTheme() {
  setTheme(activeTheme() === "dark" ? "light" : "dark");
}

const themeButton = document.querySelector(".theme-toggle");

if (themeButton) {
  setTheme(activeTheme());
  themeButton.addEventListener("click", toggleTheme);
}

// Follow the system only while the visitor has made no explicit choice.
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (storedTheme()) return;
  root.dataset.theme = event.matches ? "dark" : "light";
});

/* ---------- reveal ---------- */

export function revealIn(scope = document) {
  const targets = scope.querySelectorAll(".reveal:not(.is-visible)");
  if (!targets.length) return;

  // Stagger within each parent group, capped so a long grid does not crawl.
  const seen = new Map();
  targets.forEach((el) => {
    const parent = el.parentElement;
    const n = seen.get(parent) ?? 0;
    seen.set(parent, n + 1);
    el.style.setProperty("--i", Math.min(n, 6));
  });

  if (reducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

revealIn();

/* ---------- scroll progress and header shrink ---------- */

let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    root.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : "0");
    if (y > 8) root.setAttribute("data-scrolled", "");
    else root.removeAttribute("data-scrolled");
    ticking = false;
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
onScroll();

/* ---------- card pointer glow ---------- */

document.addEventListener(
  "pointermove",
  (event) => {
    const card = event.target.closest?.(".card");
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - box.left}px`);
    card.style.setProperty("--my", `${event.clientY - box.top}px`);
  },
  { passive: true }
);

/* ---------- metric count-up ---------- */

// "10K+" -> prefix "", number 10, suffix "K+". The HTML already holds the final
// text, so a reader with no JavaScript sees the real value.
function splitValue(text) {
  const match = text.match(/^(\D*)([\d.]+)(.*)$/s);
  if (!match) return null;
  return { prefix: match[1], value: Number(match[2]), suffix: match[3], decimals: (match[2].split(".")[1] || "").length };
}

function countUp(el) {
  const parts = splitValue(el.textContent.trim());
  if (!parts || !Number.isFinite(parts.value)) return;

  const duration = 900;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // matches --ease-out closely enough
    const current = (parts.value * eased).toFixed(parts.decimals);
    el.textContent = `${parts.prefix}${current}${parts.suffix}`;
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const metrics = document.querySelectorAll(".metric__value");

if (metrics.length && !reducedMotion() && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  metrics.forEach((el) => observer.observe(el));
}

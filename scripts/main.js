// main.js - theme, role variant, reveal, scroll progress and metric count-up.
// Loaded by every page, and loaded first.

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

/* ---------- role variant ---------- */

// The HTML holds the fde variant in full. This block only overwrites text and
// link targets, so a reader with no JavaScript still sees a complete page.
// Every value below comes from a CV in assets/. Add no number that a CV does
// not state.

const METRICS_FDE = [
  ["10K+", "industrial data points processed per session", "emx-network-twin"],
  ["<200 ms", "inference latency on real-time pipelines", "emx-network-twin"],
  ["94%+", "macro accuracy across 50+ identities", "employee-identity"],
  [">99.9%", "uptime on a containerized platform", "containerized-platform"],
];

const METRICS_AI = [
  ["5,000+", "autonomous agent iterations on an NVIDIA A100", "fedros-omni"],
  ["28%", "lower hallucination rate after evaluation and tool-use refinement", "fedros-omni"],
  ["96%", "F1-score on held-out ICAO compliance data", "passport-icao"],
  ["94%+", "macro accuracy across 50+ identities", "employee-identity"],
];

// order maps to the DOM order of the #work cards:
// 0 EMX, 1 FEDROS OMNI, 2 Containerized platform, 3 Employee identity.
const ROLES = {
  fde: {
    value:
      "I sit with the people who will use the system, then hand it over so they can keep changing it without me.",
    tagline: "Forward Deployed Engineer. AI systems, full-stack, cloud and infrastructure.",
    cv: "CV-fde.pdf",
    metrics: METRICS_FDE,
    order: [0, 1, 2, 3],
  },
  ai: {
    value:
      "I build LLM, agent and vision systems, then measure them on held-out data before they ship.",
    tagline: "AI/ML Engineer. LLM and agentic AI, computer vision and MLOps.",
    cv: "CV-ai.pdf",
    metrics: METRICS_AI,
    order: [1, 0, 3, 2],
  },
  // No CV states an MLOps metric, so this role reuses the AI set.
  mlops: {
    value:
      "I make a model observable: tracked runs, measured drift and a pipeline that runs the same way twice.",
    tagline:
      "MLOps and evaluation pipelines. Model monitoring with MLflow, Weights & Biases, Kubeflow and Airflow.",
    cv: "CV-ai.pdf",
    metrics: METRICS_AI,
    order: [2, 0, 1, 3],
  },
  freelance: {
    value:
      "Fixed scope, milestone based, and you own the code at the end.",
    tagline:
      "Contract engineer in Abu Dhabi. AI systems, full-stack delivery and secure infrastructure.",
    cv: "CV-fde.pdf",
    metrics: METRICS_FDE,
    order: [0, 2, 1, 3],
  },
};

const DEFAULT_ROLE = "fde";

function activeRole() {
  const name = new URLSearchParams(location.search).get("role");
  return name && Object.hasOwn(ROLES, name) ? name : DEFAULT_ROLE;
}

function applyRole(name) {
  const role = ROLES[name];
  root.dataset.role = name;

  // Only index.html carries this attribute. The other pages keep their own line.
  const tagline = document.querySelector("[data-role-tagline]");
  if (tagline) tagline.textContent = role.tagline;

  const value = document.querySelector("[data-role-value]");
  if (value) value.textContent = role.value;

  document.querySelectorAll("[data-cv]").forEach((link) => {
    link.href = `./assets/${role.cv}`;
  });

  document.querySelectorAll(".role-switch a").forEach((link) => {
    const target = new URL(link.href, location.href).searchParams.get("role") || DEFAULT_ROLE;
    if (target === name) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });

  document.querySelectorAll(".metric").forEach((tile, i) => {
    const entry = role.metrics[i];
    if (!entry) return;
    const [value, label, target] = entry;
    tile.querySelector(".metric__value").textContent = value;
    tile.querySelector(".metric__label").textContent = label;
    const link = tile.querySelector("a");
    if (link) link.href = `./projects.html#${target}`;
  });

  document.querySelectorAll("#work .card").forEach((card, i) => {
    card.style.order = role.order[i] ?? i;
  });
}

// Runs before revealIn() and before the count-up observer, so the count-up
// reads the number of the active role.
applyRole(activeRole());

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
    // The rAF timestamp can predate start, which makes t negative and prints
    // "-0,000+" on the first frame. Clamp both ends.
    const t = Math.min(Math.max((now - start) / duration, 0), 1);
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

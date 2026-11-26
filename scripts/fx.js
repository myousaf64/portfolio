// fx.js - background particle network, custom cursor, card tilt and magnetic buttons.
// One pointermove listener and one animation frame loop serve all four.
// Every effect is motion, so the whole file stands down under reduced motion.

const root = document.documentElement;
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarseQuery = window.matchMedia("(pointer: coarse)");

/* ---------- shared pointer state ---------- */

const pointer = { x: -9999, y: -9999, active: false };

/* ---------- canvas ---------- */

const canvas = document.createElement("canvas");
canvas.id = "bg";
canvas.setAttribute("aria-hidden", "true");
document.body.prepend(canvas);
const ctx = canvas.getContext("2d", { alpha: true });

const LINK = 118; // neighbour link distance, in CSS pixels
const CURSOR_LINK = 170;
const REPEL = 110;

let nodes = [];
let width = 0;
let height = 0;
let palette = { node: "#5a5a5a", link: "rgba(90,90,90,0.35)", glow: 0 };

function readPalette() {
  const style = getComputedStyle(root);
  palette = {
    node: style.getPropertyValue("--fx-node").trim() || "#5a5a5a",
    link: style.getPropertyValue("--fx-link").trim() || "rgba(90,90,90,0.3)",
    glow: parseFloat(style.getPropertyValue("--fx-glow")) || 0,
  };
}

function nodeCount() {
  // Under 80 everywhere, and far under it on a phone.
  if (width < 560) return Math.min(40, Math.floor(width / 14));
  return Math.min(78, Math.floor(width / 18));
}

function seed() {
  const count = nodeCount();
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: 1 + Math.random() * 1.4,
  }));
}

function resize() {
  // Cap the device pixel ratio: a 3x phone screen triples the fill cost for no gain here.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seed();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  // Links first, so a node sits on top of the lines that reach it.
  ctx.strokeStyle = palette.link;
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d > LINK) continue;
      ctx.globalAlpha = 1 - d / LINK;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    if (!pointer.active) continue;
    const dx = a.x - pointer.x;
    const dy = a.y - pointer.y;
    const d = Math.hypot(dx, dy);
    if (d > CURSOR_LINK) continue;
    ctx.globalAlpha = 1 - d / CURSOR_LINK;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(pointer.x, pointer.y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.node;
  ctx.shadowBlur = palette.glow;
  ctx.shadowColor = palette.node;
  nodes.forEach((n) => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function step() {
  nodes.forEach((n) => {
    n.x += n.vx;
    n.y += n.vy;

    if (pointer.active) {
      const dx = n.x - pointer.x;
      const dy = n.y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < REPEL && d > 0.01) {
        const push = (1 - d / REPEL) * 1.1;
        n.x += (dx / d) * push;
        n.y += (dy / d) * push;
      }
    }

    // Wrap instead of bounce: no node piles up against an edge.
    if (n.x < -10) n.x = width + 10;
    if (n.x > width + 10) n.x = -10;
    if (n.y < -10) n.y = height + 10;
    if (n.y > height + 10) n.y = -10;
  });
}

/* ---------- custom cursor ---------- */

let dot = null;
let ring = null;
const ringPos = { x: -9999, y: -9999 };

function buildCursor() {
  dot = document.createElement("div");
  dot.className = "cursor-dot";
  ring = document.createElement("div");
  ring.className = "cursor-ring";
  [dot, ring].forEach((el) => {
    el.setAttribute("aria-hidden", "true");
    document.body.append(el);
  });
  // Hide the native cursor only once the replacement is in the document.
  root.classList.add("has-cursor");
}

function moveCursor() {
  if (!dot) return;
  dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
  // The ring eases toward the dot, so it trails on a fast move.
  ringPos.x += (pointer.x - ringPos.x) * 0.18;
  ringPos.y += (pointer.y - ringPos.y) * 0.18;
  ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
}

/* ---------- card tilt and magnetic buttons ---------- */

const TILT = 6; // degrees
const MAGNET = 6; // pixels

let tilted = null;
let magnetic = null;

function clearTilt() {
  if (!tilted) return;
  tilted.style.removeProperty("--rx");
  tilted.style.removeProperty("--ry");
  tilted = null;
}

function clearMagnet() {
  if (!magnetic) return;
  magnetic.style.removeProperty("--tx");
  magnetic.style.removeProperty("--ty");
  magnetic = null;
}

function onPointerMove(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;

  const card = event.target.closest?.(".card");
  if (card !== tilted) clearTilt();
  if (card) {
    const box = card.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    card.style.setProperty("--ry", `${(px * TILT).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${(-py * TILT).toFixed(2)}deg`);
    tilted = card;
  }

  const btn = event.target.closest?.(".btn");
  if (btn !== magnetic) clearMagnet();
  if (btn) {
    const box = btn.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    btn.style.setProperty("--tx", `${(px * 2 * MAGNET).toFixed(2)}px`);
    btn.style.setProperty("--ty", `${(py * 2 * MAGNET).toFixed(2)}px`);
    magnetic = btn;
  }
}

/* ---------- one loop ---------- */

const FRAME = 15.5; // ms, so the work never runs faster than 60fps
let last = 0;
let running = false;

function frame(now) {
  if (!running) return;
  if (now - last >= FRAME) {
    last = now;
    step();
    draw();
    moveCursor();
  }
  requestAnimationFrame(frame);
}

function start() {
  if (running) return;
  running = true;
  last = 0;
  requestAnimationFrame(frame);
}

function stop() {
  running = false;
}

/* ---------- wiring ---------- */

let bound = false;
let resizeTimer = 0;

function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resize();
    if (!running) draw();
  }, 150);
}

function enable() {
  readPalette();
  resize();

  if (motionQuery.matches) {
    // One static frame. No loop, no pointer effects, no cursor swap.
    stop();
    draw();
    // If the setting changed while the page was open, give the native cursor back.
    root.classList.remove("has-cursor");
    return;
  }

  if (!bound) {
    bound = true;
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", () => {
      pointer.active = false;
      clearTilt();
      clearMagnet();
    });
    document.addEventListener("pointerover", (event) => {
      if (!ring) return;
      const hit = event.target.closest?.("a, button, [role='button'], .metric, summary");
      ring.classList.toggle("is-big", Boolean(hit));
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
    if (!coarseQuery.matches) buildCursor();
  } else if (dot) {
    root.classList.add("has-cursor");
  }

  start();
}

window.addEventListener("resize", onResize, { passive: true });

// The theme can change at any moment; the canvas colours follow it.
new MutationObserver(() => {
  readPalette();
  if (!running) draw();
}).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

// Honour a live change of either media query.
motionQuery.addEventListener("change", enable);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => readPalette());

enable();

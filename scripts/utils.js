function displayElements(targetEl) {
  if (!targetEl) return;
  const fadeEls = targetEl.querySelectorAll(".fade");
  if (!fadeEls.length) return;
  const unhide = (i) => {
    if (i == fadeEls.length) return;
    fadeEls[i].style.opacity = "1";
    fadeEls[i].style.transform = "initial";
    setTimeout(() => {
      unhide((i += 1));
    }, 1000 / fadeEls.length);
  };
  unhide(0);
}

// Get all the public repositories in the user account myousaf64
const USER = "myousaf64";
let responseParsed = [];

try {
  let response = await fetch(`https://api.github.com/users/${USER}/repos`);
  if (response.ok) {
    const data = await response.json();
    responseParsed = Array.isArray(data) ? data : [];
  }
} catch (error) {
  responseParsed = [];
}

export { displayElements, responseParsed };

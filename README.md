# Portfolio

Personal portfolio website built with HTML, SCSS, and JavaScript.

## Project structure

- `index.html` – Home page
- `projects.html` – Projects page
- `scripts/` – JavaScript components and page logic
- `styles/` – SCSS source and compiled CSS
- `assets/` – Static assets (images, icons, CV)

## Run locally

Use the included Make target:

```bash
make server
```

Then open `http://localhost:8000`.

## Development workflow

To edit styles, use any SCSS compiler to rebuild the CSS from files in `styles/`.

An easy setup in VS Code is:

- [Live Sass Compiler](https://marketplace.visualstudio.com/items?itemName=glenn2223.live-sass)
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

After installing, click `Watch Sass` and `Go Live` to auto-compile SCSS and preview changes locally.

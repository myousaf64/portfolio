# Portfolio

The personal portfolio of Mohammad Yousaf. Static site: HTML, plain CSS and
JavaScript modules. No framework, no build step, no dependencies.

Live: <https://myousaf64.github.io/portfolio/>

## Project structure

- `index.html` – Home: hero, metrics, selected work, public repositories, about, contact
- `projects.html` – Delivered systems, then every public GitHub repository
- `experience.html` – Roles, skills, education, certifications
- `styles/tokens.css` – Design tokens. The only `:root` block, light and dark
- `styles/site.css` – Reset, layout, components
- `scripts/main.js` – Theme toggle and scroll reveal
- `scripts/github.js` – Public repositories, fetched from the GitHub API and cached
- `assets/` – CV and favicon

## Run locally

```bash
make server
```

Then open `http://localhost:8000`.

Use a server, not `file://`. The pages load ES modules, which the browser
blocks on the `file://` scheme.

## Development

Edit the files. There is nothing to compile and nothing to install.

Sass was removed on 2026-11-01: the compiled CSS had been hand-edited and no
longer matched its `.scss` source. `styles/` now holds plain CSS only.

Before you open a pull request, run the checklist in `AGENTS.md` under
**Verify**. See `docs/decisions.md` for why the site is built this way.

# Samuel Beteta — Personal Website

This repository contains a simple static personal website (portfolio / "About me") for Samuel Beteta. The primary page is `index.html` at the repository root and includes information about studies, skills, projects and media samples.

## What this site is

- A lightweight, static HTML page built with Bootstrap 5 and Bootstrap Icons.
- Intended to be hosted on GitHub Pages or any static hosting provider.
- No build step or server-side code is required.

## Download

You can download or clone this repository with Git:

```bash
git clone https://github.com/Svbeteta/Weengz-Air.git
cd Weengz-Air
```

## Run locally

Since this is a static HTML page, there are multiple simple ways to open or serve it locally:

- Open directly in a browser:

  1. Double-click `index.html` or open it from your browser (`File → Open`).

- Use Python built-in HTTP server (recommended for consistent behavior):

  ```bash
  # Python 3
  python -m http.server 8000
  # then open: http://localhost:8000/
  ```

- Use VS Code Live Server extension (if you use Visual Studio Code):
  - Install Live Server, open the folder, right-click `index.html` → `Open with Live Server`.

## Publish with GitHub Pages

1. Push the repository to GitHub (if not already pushed):

```bash
git remote add origin https://github.com/Svbeteta/Weengz-Air.git
git branch -M main
git push -u origin main
```

2. In the repository on GitHub, go to `Settings` → `Pages`.
   - Under "Build and deployment" choose "Deploy from a branch".
   - Select `main` branch and folder `/ (root)` (or choose `/docs` if you place the site in `docs/`).
   - Click Save. GitHub will publish the site and show the URL (usually `https://<username>.github.io/Weengz-Air/`).

## File structure

- `index.html` — main page (About / Projects / Media).
- Other assets are loaded from external CDNs (Bootstrap, Bootstrap Icons) and remote media links.

If you add local assets (images, videos, CSS), keep them in a clear folder structure such as `assets/` or `css/`.

## Notes and recommendations

- The page is static — for more complex functionality consider adding a small build step with a static site generator.
- For mobile-friendliness, test the page at different viewport sizes and adjust Bootstrap classes if necessary.

## License

This repository does not include a license file. Add a `LICENSE` if you want to make reuse terms explicit (e.g., MIT).

## Contact

Samuel Beteta — see the GitHub profile: https://github.com/Svbeteta
# WeengzAir

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.4.

## UI theme and buttons

The app uses a dark theme with a unified brand palette. Reusable button styles are available:

- Primary action: `btn btn-primary`
- Subtle action: `btn btn-outline-primary`

Examples:

```html
<button class="btn btn-primary">Confirmar</button>
<button class="btn btn-outline-primary">Cancelar</button>
```

Notes:

- Forms, cards, and the navbar are themed automatically via CSS variables in `src/styles.scss`.
- Seat states use `.seat.free | .seat.selected | .seat.busy` for consistent visuals in both the seat page and the modify modal.
- Prefer `btn-primary` and `btn-outline-primary` over Bootstrap’s other color variants to keep a cohesive look.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

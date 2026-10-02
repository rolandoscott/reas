# Rolando Scott — portfolio

Static site, no build step. Everything that ships lives in `public/`:

```
public/
├── index.html
├── 404.html
├── _headers              # Cloudflare Pages security + cache headers (CSP etc.)
├── favicon.svg
├── robots.txt
└── assets/
    ├── css/styles.css    # all styles
    ├── js/main.js        # all behaviour (clock, typewriter, ember grid, terminal)
    ├── fonts/            # self-hosted woff2 (Bricolage Grotesque, Instrument Sans, JetBrains Mono)
    └── img/
```

`design-source/` holds the original Claude Design export for reference; it is not deployed.

## Before going live

- Add `public/assets/img/portrait.jpg` (the card shows a plain panel until it exists).
- Add `public/cv.pdf`.
- Replace the LinkedIn placeholder URL (`https://www.linkedin.com/in/yourname`) in
  `public/index.html` and `LINKS.linkedin` in `public/assets/js/main.js`.

## Local preview

```sh
npx wrangler pages dev        # uses wrangler.toml, honours _headers
# or simply: python3 -m http.server -d public 8080
```

## Deploy to Cloudflare Pages

**Git integration (dashboard):** Workers & Pages → Create → Pages → connect repo.
Framework preset: *None*, build command: *(empty)*, build output directory: `public`.

**Direct upload (CLI):**

```sh
npx wrangler pages deploy
```

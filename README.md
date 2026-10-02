# Rolando Scott — portfolio

Static site, no build step. Everything that ships lives in `public/`:

```
public/
├── index.html
├── 404.html
├── _headers              # security + cache headers (Cloudflare) (CSP etc.)
├── favicon.svg
├── robots.txt
└── assets/
    ├── css/styles.css    # all styles
    ├── js/main.js        # all behaviour (typewriter, terminal)
    ├── data/cities.json  # world cities for the terminal's `fly` command (lazy-loaded)
    ├── fonts/            # self-hosted woff2 (Bricolage Grotesque, Instrument Sans, JetBrains Mono)
    └── img/
```

`tools/gen-code-bg.py` regenerates the code-texture background tile.

`design-source/` holds the original Claude Design export for reference; it is not deployed.

## Before going live

- Add `public/cv.pdf`.

## Email signature

`email-signature/signature.html` holds an HTML email signature (inline styles on
purpose — mail clients ignore external CSS). Open it in a browser, select the
signature, copy, and paste it into your mail client's signature settings.
Its headshot loads from `https://reas.cr/assets/img/email/rolando-signature.png`,
so it only shows once reas.cr serves this site.

## Local preview

```sh
npx wrangler dev              # uses wrangler.toml, honours _headers
# or simply: python3 -m http.server -d public 8080
```

## Deploy to Cloudflare Workers

Served as a static-assets-only Worker (see `wrangler.toml`).

**Git integration (dashboard):** Workers & Pages → Create → Import a repository.
Build command: *(empty)*, deploy command: `npx wrangler deploy`.
The Worker name must match `name` in `wrangler.toml` (`reas-site`).

**From your machine:**

```sh
npx wrangler deploy
```

## Credits

City data for the terminal's `fly` command comes from [GeoNames](https://www.geonames.org/)
(`cities15000`, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)),
trimmed to cities with 100k+ people, all capitals, and all Costa Rican towns.
Flight times are rough estimates from great-circle distance.

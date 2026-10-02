/* ==========================================================================
   Rolando Scott — portfolio interactions
   ========================================================================== */
(() => {
  'use strict';

  const LINKS = {
    hire: 'https://teqqr.com',
    linkedin: 'https://www.linkedin.com/in/yourname',
    cv: '/cv.pdf'
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Costa Rica time (terminal "time" command) ----------------------- */
  const sjoFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Costa_Rica',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const sjoTime = () => sjoFormat.format(new Date());

  /* ---- Flight estimates from SJO (terminal "fly" command) -------------- */
  const SJO = { lat: 9.99, lon: -84.21 }; // Juan Santamaría International
  const BLOCK_KMH = 800;          // average gate-to-gate speed
  const GROUND_HOURS = 0.5;       // taxi, take-off and landing
  const NONSTOP_MAX_KM = 9000;    // beyond this, assume a connection
  const CONNECTION_HOURS = 3;
  const DRIVE_MAX_KM = 300;       // closer than this, it's a road trip
  const COUNTRY_ALIASES = { uk: 'gb', usa: 'us', america: 'us', uae: 'ae' };
  const HOME_ALIASES = ['sjo', 'costa rica', 'san jose cr', 'san jose costa rica'];

  const normalize = str => str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const countryName = cc => {
    try { return regionNames.of(cc); } catch { return cc; }
  };

  // ~6k cities (population 100k+ and all capitals), loaded on first use
  let citiesPromise = null;
  const loadCities = () => {
    citiesPromise ??= fetch('/assets/data/cities.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => data.cities.map(([name, cc, lat, lon]) => ({ name, cc, lat, lon, key: normalize(name) })))
      .catch(err => {
        citiesPromise = null; // allow a retry
        throw err;
      });
    return citiesPromise;
  };

  // "london", "paris, fr", "san jose, costa rica" — cities are sorted by population,
  // so an ambiguous name resolves to the biggest match.
  function findCity(cities, query) {
    const [cityPart, countryPart = ''] = query.split(',');
    const q = normalize(cityPart);
    let country = normalize(countryPart);
    country = COUNTRY_ALIASES[country] ?? country;
    if (!q) return null;

    const inCountry = city => !country
      || city.cc.toLowerCase() === country
      || normalize(countryName(city.cc)) === country;

    return cities.find(c => c.key === q && inCountry(c))
      ?? (q.length >= 3 ? cities.find(c => c.key.startsWith(q) && inCountry(c)) : undefined)
      ?? null;
  }

  function distanceKm(a, b) {
    const rad = deg => deg * Math.PI / 180;
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }

  const formatHours = hours => {
    const mins = Math.round(hours * 60);
    return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
  };

  const formatNumber = n => Math.round(n).toLocaleString('en-US');

  // Best guess at the visitor's city from their browser's time zone, e.g. "Europe/London"
  const visitorTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';

  /* ---- Typewriter tagline ---------------------------------------------- */
  function initTypewriter() {
    const elA = document.querySelector('[data-type-a]');
    const elB = document.querySelector('[data-type-b]');
    if (!elA || !elB || reducedMotion) return; // full text is already in the markup

    const a = elA.textContent;
    const b = elB.textContent;
    elA.textContent = '';
    elB.textContent = '';

    const type = (el, text, delay) => new Promise(resolve => {
      let i = 0;
      const step = () => {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(step, delay); else resolve();
      };
      step();
    });
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    wait(500)
      .then(() => type(elA, a, 55))
      .then(() => wait(750))
      .then(() => type(elB, b, 75));
  }

  /* ---- Terminal --------------------------------------------------------- */
  function initTerminal() {
    const dialog = document.querySelector('.term');
    const log = document.querySelector('[data-term-log]');
    const body = document.querySelector('[data-term-body]');
    const form = document.querySelector('[data-term-form]');
    const input = document.getElementById('term-input');
    if (!dialog || !log || !form || !input) return;

    const print = (text, tone = '') => {
      const line = document.createElement('div');
      line.className = tone ? `term__line term__line--${tone}` : 'term__line';
      line.textContent = text;
      log.append(line);
      body.scrollTop = body.scrollHeight;
    };

    const openUrl = url => window.open(url, '_blank', 'noopener');

    const download = url => {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.append(a);
      a.click();
      a.remove();
    };

    const COMMANDS = {
      help() {
        [
          ['whoami', 'who is this guy?'],
          ['hire', 'work with me (opens teqqr.com)'],
          ['cv', 'download my CV'],
          ['linkedin', 'connect on LinkedIn'],
          ['fly [city]', 'how long it takes me to fly to you'],
          ['fire', 'run a fire check'],
          ['time', 'local time in Costa Rica'],
          ['clear', 'clear the screen'],
          ['exit', 'close this shell']
        ].forEach(([cmd, desc]) => print(`${cmd.padEnd(12)} ${desc}`));
      },
      whoami() {
        print('Rolando Scott — Solutions Lead @ amazee.io');
        print('20+ yrs building, securing & rescuing websites · 15 yrs volunteer firefighter', 'dim');
        print('Drupal & WordPress migrations · WAF · bot management · incident response', 'dim');
      },
      hire() {
        print('Dispatching to teqqr.com…', 'hi');
        openUrl(LINKS.hire);
      },
      linkedin() {
        print('Opening LinkedIn…', 'hi');
        openUrl(LINKS.linkedin);
      },
      cv() {
        print('Downloading cv.pdf…', 'hi');
        download(LINKS.cv);
      },
      async fly(query) {
        print('          __|__', 'hi');
        print('   --o--o--(_)--o--o--', 'hi');

        const tz = visitorTimeZone();
        const guessed = !query;
        if (guessed) {
          if (tz === 'America/Costa_Rica') {
            print("Looks like you're already in Costa Rica. No flight needed — coffee?", 'ok');
            return;
          }
          query = tz.includes('/') ? tz.split('/').pop().replace(/_/g, ' ') : '';
        }

        if (HOME_ALIASES.includes(normalize(query))) {
          print("That's home base. No flight needed — coffee?", 'ok');
          return;
        }

        let city = null;
        if (query) {
          try {
            city = findCity(await loadCities(), query);
          } catch {
            print('Flight charts are unavailable right now. Try again in a bit.', 'hi');
            return;
          }
        }

        if (!city) {
          if (!guessed) print(`"${query}" isn't on my charts. Try a bigger city nearby.`, 'hi');
          print('Usage: fly <city>   e.g. fly london · fly paris, fr · fly new york', 'dim');
          return;
        }

        const km = distanceKm(SJO, city);
        const place = `${city.name}, ${countryName(city.cc)}`;
        if (guessed) print(`Your browser says you're around ${city.name}. Not right? Try "fly <city>".`, 'dim');

        if (km < 50) {
          print(`${place} is in my backyard. No flight needed — coffee?`, 'ok');
          return;
        }

        const byRoad = km < DRIVE_MAX_KM;
        print(`${byRoad ? 'ROAD TRIP  ' : 'FLIGHT PLAN'}  SJO → ${place}`);
        print(`distance     ${formatNumber(km)} km · ${formatNumber(km * 0.621371)} mi`, 'dim');

        if (byRoad) {
          print(`by road      ~${formatHours((km * 1.3) / 60)} each way. That's a drive, not a flight.`);
        } else {
          const connecting = km > NONSTOP_MAX_KM;
          const oneWay = km / BLOCK_KMH + GROUND_HOURS + (connecting ? CONNECTION_HOURS : 0);
          print(`one way      ~${formatHours(oneWay)}`);
          print(`round trip   ~${formatHours(oneWay * 2)}`);
          if (connecting) print(`(no nonstop from SJO, so that includes a ~${CONNECTION_HOURS}h connection)`, 'dim');
        }
        print('Wheels up whenever you need me → type "hire"', 'ok');
      },
      fire() {
        print('Scanning for fires… ▓▓▓▓▓▓▓▓▓▓ 100%', 'dim');
        print('0 active incidents. All systems nominal.', 'ok');
        print('Got one burning? → type "hire"', 'dim');
      },
      time() {
        print(`SJO ${sjoTime()} (UTC−6)`);
      },
      sudo() {
        print('Nice try. Permission denied.', 'hi');
      },
      clear() {
        log.replaceChildren();
      },
      exit() {
        dialog.close();
      }
    };
    COMMANDS.teqqr = COMMANDS.hire;
    COMMANDS.fires = COMMANDS.fire;
    COMMANDS.quit = COMMANDS.exit;

    const run = raw => {
      const [name = '', ...rest] = raw.trim().split(/\s+/);
      const cmd = name.toLowerCase();
      if (cmd !== 'clear') print(`~/rolando $ ${raw}`, 'echo');
      if (!cmd) return;
      const handler = Object.hasOwn(COMMANDS, cmd) ? COMMANDS[cmd] : null;
      if (handler) handler(rest.join(' '));
      else print(`command not found: ${cmd} — try "help"`, 'hi');
    };

    const open = () => {
      if (dialog.open) return;
      if (!log.hasChildNodes()) {
        print('rolando-os v20.26 — volunteer firefighter edition');
        print('Type "help" to see what I can do.', 'dim');
      }
      dialog.showModal();
      input.focus();
    };

    form.addEventListener('submit', e => {
      e.preventDefault();
      run(input.value);
      input.value = '';
    });

    document.querySelectorAll('[data-term-open]').forEach(btn => btn.addEventListener('click', open));
    document.querySelectorAll('[data-term-close]').forEach(btn => btn.addEventListener('click', () => dialog.close()));

    // Click on the backdrop closes; click anywhere else in the body focuses the prompt
    dialog.addEventListener('click', e => {
      if (e.target === dialog) dialog.close();
      else if (body.contains(e.target) && !window.getSelection().toString()) input.focus();
    });

    // "/" or "`" opens the shell, unless the user is typing somewhere
    window.addEventListener('keydown', e => {
      if (dialog.open || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (!typing && (e.key === '/' || e.key === '`')) {
        e.preventDefault();
        open();
      }
    });
  }

  initTypewriter();
  initTerminal();
})();

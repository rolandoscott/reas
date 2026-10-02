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
          ['fly', 'file a flight plan'],
          ['fire', 'run a fire check'],
          ['time', 'local time in Costa Rica'],
          ['clear', 'clear the screen'],
          ['exit', 'close this shell']
        ].forEach(([cmd, desc]) => print(`${cmd.padEnd(10)} ${desc}`));
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
      fly() {
        print('          __|__', 'hi');
        print('   --o--o--(_)--o--o--', 'hi');
        print('FLIGHT PLAN  SJO → anywhere · ALT 35,000ft · cleared for takeoff', 'dim');
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
    COMMANDS['sudo su'] = COMMANDS.sudo;
    COMMANDS.quit = COMMANDS.exit;

    const run = raw => {
      const cmd = raw.trim().toLowerCase();
      if (cmd !== 'clear') print(`~/rolando $ ${raw}`, 'echo');
      if (!cmd) return;
      const handler = Object.hasOwn(COMMANDS, cmd) ? COMMANDS[cmd] : null;
      if (handler) handler();
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
      body.scrollTop = body.scrollHeight;
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

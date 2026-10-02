"""Generate public/assets/img/bg-code.svg: a repeating tile of faint config,
code and shell snippets used as the page background.

Usage:  python3 tools/gen-code-bg.py   (edit the snippets A / B below)
"""
from xml.sax.saxutils import escape
A = r'''server {
    listen 443 ssl http2;
    server_name example.com;
    root /var/www/html/web;

    location / {
        try_files $uri /index.php?$query_string;
    }
    location ~ \.php$ {
        fastcgi_pass php:9000;
    }
}

$ drush sql:sync @prod @self -y
$ drush cr && drush updb -y
 [success] Cache rebuild complete.

$ wp search-replace 'http://' 'https://' --all-tables
Success: Made 1,284 replacements.

<?php
function rescue_site(array $site): bool {
  if ($site['status'] !== 200) {
    return migrate($site, 'new-host');
  }
  return TRUE;
}

SecRule REQUEST_HEADERS:User-Agent \
    "@pmFromFile bad-bots.txt" \
    "id:100042,phase:1,deny,status:403"

$ composer update drupal/core-* -W
  - Upgrading drupal/core (10.3.6 => 11.0.5)

$ tail -f /var/log/nginx/error.log
'''
B = r'''$ dig +short example.com
104.21.32.7

$ curl -sI https://example.com | head -1
HTTP/2 200

sub vcl_recv {
  if (req.url ~ "^/admin") {
    return (pass);
  }
}

$ git log --oneline -3
a1f9c2e Cut over DNS, 0s downtime
7be04d1 Tune WAF rule 942100
3c88e90 Move public files to S3

environments:
  main:
    routes:
      - nginx: www.example.com
    cronjobs:
      - name: drush cron
        schedule: "*/15 * * * *"
        command: drush cron

$ rsync -avz --delete files/ prod:/var/www/files/
sent 1.2G bytes  received 48K bytes

$ redis-cli info stats | grep hit
keyspace_hits:9734211

$ certbot renew --quiet
$ systemctl reload nginx
'''
LH=18; W=980; H=720
out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
     '  <!-- Repeating background tile: faint snippets of config, code and shell -->',
     '  <g fill="#c4c4bf" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="12">']
for x,text in ((24,A),(520,B)):
    lines=text.rstrip('\n').split('\n')
    assert len(lines)*LH < H-20, len(lines)
    assert max(map(len,lines))*7.3 < 470, max(lines,key=len)
    for i,l in enumerate(lines):
        if l.strip():
            body = l.lstrip(' ')
            indent = '\u00a0' * (len(l) - len(body))  # keep code indentation
            out.append(f'    <text x="{x}" y="{30+i*LH}">{indent}{escape(body)}</text>')
out.append('  </g>\n</svg>\n')
open(__import__('pathlib').Path(__file__).resolve().parent.parent / 'public/assets/img/bg-code.svg','w').write('\n'.join(out))
print(len(A.split('\n')),len(B.split('\n')))

// Builds privacy.html from the privacy notice packaged in the released app, so the hosted
// notice always matches what ships. Usage: node build-privacy.cjs <path to PRIVACY.md>
// privacy-mac.md (how the Mac preview differs) goes in just before the contact section.
const fs = require('fs'), path = require('path');
const mac = fs.readFileSync(path.join(__dirname, 'privacy-mac.md'), 'utf8').replace(/\r\n/g, '\n').trim();
const source = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'installer', 'win-unpacked', 'resources', 'PRIVACY.md'), 'utf8').replace(/\r\n/g, '\n')
  .replace(/\n## Contact\b/, () => '\n' + mac + '\n\n## Contact');
if (!source.includes(mac)) throw new Error('No contact section to put the Mac notes before');
const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = text => escape(text)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\b([\w.+-]+@[\w-]+\.[\w.]+\w)\b/g, '<a href="mailto:$1">$1</a>');
const blocks = source.trim().split(/\n{2,}/), out = [];
let title = 'Privacy notice', updated = '';
for (const block of blocks) {
  if (block.startsWith('# ')) { title = block.slice(2).trim(); continue; }
  if (/^Updated /.test(block)) { updated = block.trim(); continue; }
  if (block.startsWith('## ')) { out.push(`<h2>${inline(block.slice(3).trim())}</h2>`); continue; }
  if (/^- /m.test(block) && block.split('\n').every(line => /^- |^\s+\S/.test(line))) {
    const items = block.split(/\n(?=- )/).map(item => `<li>${inline(item.replace(/^- /, '').replace(/\n\s+/g, ' '))}</li>`);
    out.push(`<ul>${items.join('')}</ul>`); continue;
  }
  out.push(`<p>${inline(block.replace(/\n/g, ' '))}</p>`);
}
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Privacy · Lecture Desk</title>
<meta name="description" content="How Lecture Desk handles your recordings, notes and data.">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v=${process.env.ASSET_VERSION || Date.now().toString(36)}">
</head>
<body class="doc">
<header class="nav scrolled"><div class="wrap nav-inner"><a class="brand" href="index.html"><picture><source srcset="img/icon-light-512.png" media="(prefers-color-scheme: dark)"><img src="img/icon-512.png" alt="" width="30" height="30"></picture>Lecture Desk</a><a class="btn btn-sm btn-ink" href="index.html#download">Download</a></div></header>
<main class="wrap prose">
<h1>${inline(title)}</h1>
${updated ? `<p class="updated">${inline(updated)}</p>` : ''}
${out.join('\n')}
</main>
<footer class="footer"><div class="wrap footer-inner"><a class="brand" href="index.html"><picture><source srcset="img/icon-light-512.png" media="(prefers-color-scheme: dark)"><img src="img/icon-512.png" alt="" width="24" height="24"></picture>Lecture Desk</a><nav aria-label="Footer"><a href="index.html">Home</a><a href="index.html#download">Download</a></nav></div></footer>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'privacy.html'), html);
console.log(JSON.stringify({ title, updated, blocks: out.length }));

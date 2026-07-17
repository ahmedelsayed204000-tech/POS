import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectDir = process.argv[2];
const outputFile = process.argv[3];

if (!projectDir || !outputFile) {
  throw new Error('Usage: node build-standalone.mjs <built-project-directory> <output-html>');
}

const distDir = path.join(projectDir, 'dist');
const index = await readFile(path.join(distDir, 'index.html'), 'utf8');
const scriptMatch = index.match(/src="\.\/assets\/([^"]+\.js)"/);
const styleMatch = index.match(/href="\.\/assets\/([^"]+\.css)"/);

if (!scriptMatch || !styleMatch) throw new Error('Could not find the built JavaScript and CSS assets.');

let script = await readFile(path.join(distDir, 'assets', scriptMatch[1]), 'utf8');
let style = await readFile(path.join(distDir, 'assets', styleMatch[1]), 'utf8');

const embeddedAssets = [
  ['goal-garden-energy.png', 'image/png'],
  ['life-garden-hero.png', 'image/png'],
];

for (const [fileName, mimeType] of embeddedAssets) {
  const encoded = (await readFile(path.join(distDir, fileName))).toString('base64');
  const dataUrl = `data:${mimeType};base64,${encoded}`;
  script = script.replaceAll(`/${fileName}`, dataUrl).replaceAll(`./${fileName}`, dataUrl);
  style = style.replaceAll(`/${fileName}`, dataUrl).replaceAll(`./${fileName}`, dataUrl);
}

script = script.replaceAll('</script', '<\\/script');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="PersonalOS local interactive preview" />
    <title>PersonalOS — Local Interactive Preview</title>
    <style>${style}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${script}</script>
  </body>
</html>`;

const integrity = {
  doctype: html.startsWith('<!doctype html>'),
  moduleScript: html.includes('<script type="module">'),
  embeddedImages: (html.match(/data:image\/png;base64/g) || []).length >= embeddedAssets.length,
  noBuiltAssetLinks: !html.includes('./assets/'),
  noRootImageLinks: !html.includes('/goal-garden-energy.png') && !html.includes('/life-garden-hero.png'),
  localAppRoute: html.includes('location.hash="app"'),
};

if (!Object.values(integrity).every(Boolean)) {
  throw new Error(`Standalone integrity check failed: ${JSON.stringify(integrity)}`);
}

await writeFile(outputFile, html, 'utf8');
console.log(`Created ${outputFile}`);
console.log(`Integrity checks: ${JSON.stringify(integrity)}`);

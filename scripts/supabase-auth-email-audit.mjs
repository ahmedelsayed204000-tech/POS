import fs from 'node:fs';

const configPath = 'supabase/config.toml';
const envFiles = ['.env.local', '.env.example'];

function read(path) {
  try { return fs.readFileSync(path, 'utf8'); }
  catch { return ''; }
}

function parseEnv(text) {
  return Object.fromEntries(text.split(/\r?\n/).map((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    return match ? [match[1], match[2].replace(/^["']|["']$/g, '')] : null;
  }).filter(Boolean));
}

function tomlString(text, key) {
  const match = text.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, 'm'));
  return match?.[1] || '';
}

function tomlArray(text, key) {
  const match = text.match(new RegExp(`^\\s*${key}\\s*=\\s*\\[([^\\]]*)\\]`, 'm'));
  return match ? [...match[1].matchAll(/"([^"]*)"/g)].map((item) => item[1]) : [];
}

function hasSection(text, section) {
  return new RegExp(`^\\s*\\[${section.replaceAll('.', '\\.')}\\]`, 'm').test(text);
}

const config = read(configPath);
const env = {};
for (const file of envFiles) {
  for (const [key, value] of Object.entries(parseEnv(read(file)))) {
    if (value && !env[key]) env[key] = value;
  }
}
for (const [key, value] of Object.entries(process.env)) {
  if (value) env[key] = value;
}
const siteUrl = tomlString(config, 'site_url');
const redirects = tomlArray(config, 'additional_redirect_urls');
const appOrigin = env.APP_ORIGIN || env.VITE_APP_ORIGIN || '';
const expectedOrigins = [...new Set([appOrigin, siteUrl].filter(Boolean))];
const expectedMagicRedirects = expectedOrigins.flatMap((origin) => [`${origin}/app`, `${origin}/app?profile=1`]);

const checks = [
  {
    name: 'Supabase frontend URL is configured',
    ok: Boolean(env.VITE_SUPABASE_URL),
    detail: env.VITE_SUPABASE_URL ? 'VITE_SUPABASE_URL is present.' : 'Set VITE_SUPABASE_URL in the deployment environment.',
  },
  {
    name: 'Supabase publishable key is configured',
    ok: Boolean(env.VITE_SUPABASE_PUBLISHABLE_KEY),
    detail: env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'VITE_SUPABASE_PUBLISHABLE_KEY is present.' : 'Set VITE_SUPABASE_PUBLISHABLE_KEY. Never use a service role key in the frontend.',
  },
  {
    name: 'Local auth site URL is set',
    ok: Boolean(siteUrl),
    detail: siteUrl || 'Set [auth].site_url in supabase/config.toml for local Supabase.',
  },
  {
    name: 'Local redirect allow-list covers profile magic link',
    ok: expectedMagicRedirects.every((url) => redirects.includes(url) || redirects.includes(`${new URL(url).origin}/**`)),
    detail: `Expected local allow-list entries include: ${expectedMagicRedirects.join(', ')}`,
  },
  {
    name: 'Custom SMTP is configured locally',
    ok: hasSection(config, 'auth.email.smtp') && /enabled\s*=\s*true/.test(config.slice(config.indexOf('[auth.email.smtp]'))),
    detail: 'Hosted Supabase custom SMTP must still be verified in Dashboard > Authentication > SMTP Settings.',
  },
  {
    name: 'Magic-link template is configured locally',
    ok: hasSection(config, 'auth.email.template.magic_link'),
    detail: 'Hosted Supabase magic-link template must still be verified in Dashboard > Authentication > Email Templates.',
  },
];

let failed = 0;
console.log('Supabase auth email readiness audit\n');
for (const check of checks) {
  const mark = check.ok ? 'PASS' : 'NEEDS VERIFICATION';
  if (!check.ok) failed += 1;
  console.log(`${mark}: ${check.name}`);
  console.log(`  ${check.detail}`);
}

console.log('\nManual production verification required:');
console.log('- Supabase hosted Site URL is the production origin.');
console.log('- Redirect allow-list includes the production /app and /app?profile=1 redirect targets.');
console.log('- Magic-link email template uses {{ .ConfirmationURL }} or a custom {{ .TokenHash }} flow that preserves redirect_to.');
console.log('- Custom SMTP is enabled with verified SPF, DKIM, and DMARC.');
console.log('- Email tracking/link rewriting is disabled for auth messages.');
console.log('- A real test message has been sent to a non-team inbox and the clicked link opens /app?profile=1.');

if (failed) process.exitCode = 1;

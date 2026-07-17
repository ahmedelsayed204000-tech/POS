import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL, URLSearchParams } from 'node:url';

const port = Number(process.env.AUTOMATION_PORT || 8787);
const appOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';
const redirectBase = process.env.OAUTH_REDIRECT_BASE || `http://localhost:${port}`;
const storePath = join(dirname(fileURLToPath(import.meta.url)), 'data', 'connections.json');
const pendingStates = new Map();
const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY ? createHash('sha256').update(process.env.TOKEN_ENCRYPTION_KEY).digest() : null;
const json = (response, status, body) => { response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': appOrigin, Vary: 'Origin' }); response.end(JSON.stringify(body)); };
const redirect = (response, location) => { response.writeHead(302, { Location: location }); response.end(); };
const configured = (provider) => provider === 'google' ? Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) : provider === 'notion' ? Boolean(process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET) : provider === 'fitbit' ? Boolean(process.env.FITBIT_CLIENT_ID && process.env.FITBIT_CLIENT_SECRET) : provider === 'whoop' ? Boolean(process.env.WHOOP_CLIENT_ID && process.env.WHOOP_CLIENT_SECRET) : Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
const stateFor = (provider) => { const state = randomBytes(32).toString('base64url'); pendingStates.set(state, { provider, expiresAt: Date.now() + 10 * 60_000 }); return state; };
const consumeState = (state, provider) => { const record = pendingStates.get(state); pendingStates.delete(state); return Boolean(record && record.provider === provider && record.expiresAt > Date.now() && timingSafeEqual(Buffer.from(record.provider), Buffer.from(provider))); };
const encrypt = (value) => { if (!encryptionKey) throw new Error('TOKEN_ENCRYPTION_KEY is required before storing connections.'); const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv); const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]); return { iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), ciphertext: ciphertext.toString('base64url') }; };
const decrypt = (value) => { const decipher = createDecipheriv('aes-256-gcm', encryptionKey, Buffer.from(value.iv, 'base64url')); decipher.setAuthTag(Buffer.from(value.tag, 'base64url')); return JSON.parse(Buffer.concat([decipher.update(Buffer.from(value.ciphertext, 'base64url')), decipher.final()]).toString('utf8')); };
const readConnections = async () => { try { return JSON.parse(await readFile(storePath, 'utf8')); } catch { return {}; } };
const writeConnection = async (provider, payload) => { const connections = await readConnections(); connections[provider] = encrypt(payload); await mkdir(dirname(storePath), { recursive: true }); await writeFile(storePath, JSON.stringify(connections), 'utf8'); };
const getConnection = async (provider) => { const record = (await readConnections())[provider]; return record ? decrypt(record) : null; };
const tokenRequest = async (provider, code) => {
  const callback = `${redirectBase}/api/auth/${provider}/callback`;
  if (provider === 'notion') {
    const basic = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString('base64');
    const result = await fetch('https://api.notion.com/v1/oauth/token', { method: 'POST', headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'authorization_code', code, redirect_uri: callback }) });
    if (!result.ok) throw new Error(`Notion token exchange failed (${result.status}).`);
    return result.json();
  }
  if (provider === 'fitbit') {
    const basic = Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString('base64');
    const result = await fetch('https://api.fitbit.com/oauth2/token', { method: 'POST', headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, grant_type: 'authorization_code', redirect_uri: callback }) });
    if (!result.ok) throw new Error(`Fitbit token exchange failed (${result.status}).`);
    return result.json();
  }
  if (provider === 'whoop') {
    const result = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, grant_type: 'authorization_code', redirect_uri: callback, client_id: process.env.WHOOP_CLIENT_ID, client_secret: process.env.WHOOP_CLIENT_SECRET }) });
    if (!result.ok) throw new Error(`WHOOP token exchange failed (${result.status}).`);
    return result.json();
  }
  const endpoint = provider === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  const params = new URLSearchParams({ client_id: provider === 'google' ? process.env.GOOGLE_CLIENT_ID : process.env.MICROSOFT_CLIENT_ID, client_secret: provider === 'google' ? process.env.GOOGLE_CLIENT_SECRET : process.env.MICROSOFT_CLIENT_SECRET, code, redirect_uri: callback, grant_type: 'authorization_code' });
  const result = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
  if (!result.ok) throw new Error(`OAuth token exchange failed (${result.status}).`);
  return result.json();
};
const readJsonBody = (request) => new Promise((resolve, reject) => { let body = ''; request.on('data', (chunk) => { body += chunk; if (body.length > 100_000) request.destroy(); }); request.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON.')); } }); request.on('error', reject); });
const sendReminder = async (provider, to, subject, text) => {
  const connection = await getConnection(provider); if (!connection?.access_token) throw new Error(`No ${provider} account is connected.`);
  if (provider === 'google') { const raw = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${text}`).toString('base64url'); const result = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', headers: { Authorization: `Bearer ${connection.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ raw }) }); if (!result.ok) throw new Error(`Gmail send failed (${result.status}).`); return; }
  const result = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', { method: 'POST', headers: { Authorization: `Bearer ${connection.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: { subject, body: { contentType: 'Text', content: text }, toRecipients: [{ emailAddress: { address: to } }] }, saveToSentItems: true }) }); if (!result.ok) throw new Error(`Outlook send failed (${result.status}).`);
};

http.createServer(async (request, response) => {
  const url = new URL(request.url, redirectBase);
  if (request.method === 'OPTIONS') { response.writeHead(204, { 'Access-Control-Allow-Origin': appOrigin, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); return response.end(); }
  if (url.pathname === '/api/health') return json(response, 200, { ok: true, providers: { google: configured('google'), microsoft: configured('microsoft') } });
  const auth = url.pathname.match(/^\/api\/auth\/(google|microsoft|notion|fitbit|whoop)$/);
  if (request.method === 'GET' && auth) { const provider = auth[1]; if (!configured(provider)) return json(response, 503, { error: `${provider} OAuth is not configured yet.` }); const state = stateFor(provider); const callback = `${redirectBase}/api/auth/${provider}/callback`; if (provider === 'google') return redirect(response, `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: callback, response_type: 'code', scope: 'openid email profile https://www.googleapis.com/auth/gmail.send', access_type: 'offline', prompt: 'consent', state })}`); if (provider === 'notion') return redirect(response, `https://api.notion.com/v1/oauth/authorize?${new URLSearchParams({ owner: 'user', client_id: process.env.NOTION_CLIENT_ID, redirect_uri: callback, response_type: 'code', state })}`); if (provider === 'fitbit') return redirect(response, `https://www.fitbit.com/oauth2/authorize?${new URLSearchParams({ response_type: 'code', client_id: process.env.FITBIT_CLIENT_ID, redirect_uri: callback, scope: 'activity heartrate sleep weight profile', state })}`); if (provider === 'whoop') return redirect(response, `https://api.prod.whoop.com/oauth/oauth2/auth?${new URLSearchParams({ response_type: 'code', client_id: process.env.WHOOP_CLIENT_ID, redirect_uri: callback, scope: 'offline read:profile read:recovery read:cycles read:workout read:sleep read:body_measurement', state })}`); return redirect(response, `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams({ client_id: process.env.MICROSOFT_CLIENT_ID, redirect_uri: callback, response_type: 'code', response_mode: 'query', scope: 'openid profile email offline_access Mail.Send', state })}`); }
  const callback = url.pathname.match(/^\/api\/auth\/(google|microsoft|notion|fitbit|whoop)\/callback$/);
  if (request.method === 'GET' && callback) { const provider = callback[1]; if (!consumeState(url.searchParams.get('state') || '', provider) || !url.searchParams.get('code')) return json(response, 400, { error: 'Invalid or expired OAuth response.' }); try { await writeConnection(provider, await tokenRequest(provider, url.searchParams.get('code'))); return redirect(response, `${appOrigin}?connection=${provider}&status=connected`); } catch (error) { return json(response, 500, { error: error.message }); } }
  if (request.method === 'POST' && url.pathname === '/api/reminders/test') { try { const { provider, to, subject = 'PersonalOS reminder test', text = 'Your PersonalOS reminder connection is working.' } = await readJsonBody(request); if (!['google', 'microsoft'].includes(provider) || !to) return json(response, 400, { error: 'provider and recipient email are required.' }); await sendReminder(provider, to, subject, text); return json(response, 202, { sent: true }); } catch (error) { return json(response, 400, { error: error.message }); } }
  return json(response, 404, { error: 'Not found' });
}).listen(port, () => console.log(`PersonalOS automation API listening on ${port}`));

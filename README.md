Usage
1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. In the app: click `Fetch JSON` to GET the data from the external API.

Notes about CORS during development

- The dev server is configured to proxy requests that start with `/api` to the external API to avoid CORS errors. The app fetches `/api?email=trevor.spielman@gmail.com` while running locally and Vite forwards that request to `https://interview-screener-api.thriveglobal.workers.dev/?email=...`.
- This is configured in `vite.config.ts` under `server.proxy`. No CORS headers are being added by this client, the proxy forwards requests server-side.

If you prefer not to use the proxy, alternate options are:

- Add proper CORS headers on the remote API (requires control of the remote server).
- Use a dedicated server-side forwarder or serverless function to relay requests.

- Left pane: raw original response text.
- Right pane: validated/sanitized JSON (editable). Fix issues and press `Submit Edited JSON (POST)` to send POST back to the same endpoint.

- Removes trailing commas before `}` or `]`.
- Adds quotes around simple unquoted keys using a heuristic regex (e.g. `key: value` → `"key": value`).
- If an odd number of quotes is detected, a closing quote is appended.
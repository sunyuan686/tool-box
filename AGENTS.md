# AGENTS.md

## Cursor Cloud specific instructions

This is a client-side only React 19 + TypeScript + Vite SPA ("工具匣", a personal developer toolbox; the shipped tool is a JSON formatter). It is deployed to Cloudflare Workers as static assets. There is **no backend, database, or external service** — everything runs in the browser, so no secrets or auth are needed to develop or test.

### Node version (non-obvious gotcha)
- The build/dev toolchain requires **Node 24** (installed via `nvm`). The default `node` on the VM (`/exec-daemon/node`, v22.14) is too old: `@cloudflare/vite-plugin` imports `registerHooks` from `node:module`, which only exists in Node ≥ 22.15 / 24, so `npm run build` and `npm run dev` fail on the default node with `does not provide an export named 'registerHooks'`.
- `~/.bashrc` has been configured to prepend the Node 24 bin to `PATH` for login shells, so a fresh `bash -l` already resolves `node` to v24. If you ever see v22.14, run `nvm use 24` (or start a login shell) before building/running.

### Commands (see `package.json` scripts)
- Dev server: `npm run dev` (Vite on http://localhost:5173/).
- Lint: `npm run lint` (oxlint).
- Build: `npm run build` (`tsc -b && vite build`).
- Preview/deploy target Cloudflare Workers (`npm run preview`, `npm run deploy` via wrangler); deploy needs `wrangler login` and is not needed for local dev.

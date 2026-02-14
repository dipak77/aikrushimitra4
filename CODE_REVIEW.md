# Code Review and Enhancement Suggestions

## Scope
Reviewed key runtime, API, and frontend entrypoint files to identify high-impact improvements in security, maintainability, and performance.

## Priority 1 — Security / Secrets

1. **Do not expose Gemini API keys to the browser.**
   - `server.js` currently injects `API_KEY` into `window.ENV` in production HTML.
   - `vite.config.js` and `vite.config.ts` also inject API keys at build time.
   - **Enhancement:** keep all LLM credentials server-side only, remove browser key injection, and route all AI requests through backend endpoints.

2. **Remove hardcoded credential logic from analytics service.**
   - `services/analyticsService.ts` includes a hardcoded password special-case (`"Dpk#2026"`) and a static hash constant.
   - **Enhancement:** remove credential-related logic from frontend code entirely; use server-side authentication and salted password hashing (Argon2/bcrypt) if auth is required.

3. **Tighten CORS and transport assumptions.**
   - `server.js` sets `Access-Control-Allow-Origin: *` for all environments.
   - **Enhancement:** use explicit allowlist origins via env var, and validate forwarded headers only when behind trusted proxy.

## Priority 2 — Architecture / Maintainability

4. **Consolidate duplicate Vite configs.**
   - Both `vite.config.js` and `vite.config.ts` exist with overlapping but conflicting behavior.
   - **Enhancement:** keep a single config file (prefer TypeScript), delete the other, and codify one source of truth for dev server port, aliases, proxying, and env handling.

5. **Split the large Voice Assistant component into modules/hooks.**
   - `components/views/VoiceAssistant.tsx` is very large and mixes UI, audio DSP, websocket lifecycle, and rendering engine code.
   - **Enhancement:** extract to: `useVoiceSession`, `useAudioGraph`, and `OrbRenderer` module; add unit coverage for non-UI logic.

6. **Adopt route-based code splitting for heavy views.**
   - `App.tsx` eagerly imports many view components.
   - **Enhancement:** use `React.lazy` + `Suspense` (or router-based lazy routes) to reduce initial bundle and improve startup time.

## Priority 3 — Robustness / Observability

7. **Add input validation on API endpoints.**
   - `/api/chat`, `/api/vision`, and `/api/updates` accept request payloads without schema validation.
   - **Enhancement:** validate with `zod` or `ajv`, reject malformed payloads early, and normalize expected lengths (prompt/image bounds).

8. **Add rate limiting and abuse controls.**
   - AI endpoints are unthrottled and websocket setup is open.
   - **Enhancement:** per-IP rate limits, basic auth/session checks for websocket setup, and request body quotas.

9. **Standardize error contracts and logging.**
   - API errors currently return generic strings and `console.error` only.
   - **Enhancement:** return structured errors (`code`, `message`, `traceId`), and add centralized request logging/metrics.

## Quick Wins (Low effort, high value)

- Remove API-key injection from frontend build/runtime.
- Remove hardcoded password/hash code from client.
- Merge to one Vite config.
- Add request schema validation middleware.
- Add bundle splitting for top 3 heaviest views first.

# Backend

Install dependencies with `npm install`. Copy `.env.example` to `.env` and set credentials for live Koha access.

Mock mode: in `.env`, set `MOCK_SIP=true`; run `npm run mock` in one terminal and `npm run dev` in another. The API listens on `127.0.0.1:4000`.

Live mode: set `MOCK_SIP=false`, configure `SIP_HOST`, `SIP_PORT`, `SIP_USER`, `SIP_PASS`, `SIP_INSTITUTION`, and `SIP_LOCATION`; run `npm run dev`.

Example: `curl http://127.0.0.1:4000/api/health`; `curl -H "Content-Type: application/json" -d "{\"identifier\":\"NFSU2026001\"}" http://127.0.0.1:4000/api/patron/identify`.

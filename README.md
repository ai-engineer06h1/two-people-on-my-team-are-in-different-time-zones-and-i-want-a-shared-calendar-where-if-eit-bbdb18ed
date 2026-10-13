# Scheduling Tool

A shared calendar for team members in different time zones. Propose a meeting time and immediately see whether it overlaps with each attendee's local working hours.

## Features

- View team calendars with timezones and working hours.
- Propose a meeting time and see per-person local time + overlap status.
- Persisted meeting proposals via SQLAlchemy (SQLite by default).

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + Pydantic

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+

## Local Development

1. Clone the repository.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Install backend dependencies:
   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```
4. (Optional) Configure the database URL:
   ```bash
   cp .env.example .env
   # Edit .env to set DATABASE_URL; defaults to sqlite:///./scheduling.db
   ```
5. Start the backend:
   ```bash
   .venv/bin/uvicorn api.index:app --reload --port 8000
   ```
6. In another terminal, start the Vite dev server with the API proxy:
   ```bash
   npm run dev
   ```
   The proxy forwards `/api/*` requests to `http://127.0.0.1:8000` by default. Override the target with:
   ```bash
   API_PROXY_URL=http://localhost:8000 npm run dev
   ```
7. Open http://localhost:5173 in your browser.

## Production Build

```bash
npm run build
```

The static frontend is output to `dist/` and can be served by any static host. The FastAPI backend is served from `/api` using the `api/index.py` handler (see Vercel config below).

## Deploy to Vercel

This project is configured for Vercel:

```bash
npm i -g vercel
vercel
```

- `vercel.json` routes `/api/*` to `api/index.py` and all other routes to the React app.
- Set environment variables in the Vercel dashboard if needed:
  - `DATABASE_URL` — defaults to SQLite in the project root.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy-compatible database URL | `sqlite:///./scheduling.db` |
| `API_PROXY_URL` | Backend URL for Vite dev proxy | `http://127.0.0.1:8000` |

## API Endpoints

- `GET /api/calendars` — list team calendars.
- `POST /api/propose-meeting` — propose a meeting time (ISO 8601) and get per-person overlap info.
- `GET /api/proposals` — list persisted proposals.
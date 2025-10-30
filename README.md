# Widebrain Classic Network Portal

**Portal name:** Widebrain Classic Network Portal  
This package contains a UI (React + Vite) and a backend (Node.js + Express) ready to connect to MongoDB Atlas.
Generated for Bill (Widebrain Classic).

## Structure
- `client/` — React frontend (Vite)
- `server/` — Node.js + Express backend (MongoDB + Nodemailer)
- `.env.example` — example environment variables

## Quick start (locally)
You will need Node.js (v16+) and npm.

### Backend
1. `cd server`
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `EMAIL_USER`, `EMAIL_PASS`.
3. `npm install`
4. `npm run dev` (uses nodemon) — server runs on port 5000

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev` — opens Vite dev server (port 5173)

### Deploy to Vercel
- Push repo to GitHub.
- Connect project on Vercel and set environment variables from `.env.example` in the Vercel dashboard.
- For a simple deployment, you may deploy frontend separately and use the server on Render/Railway, or use Vercel Serverless functions (requires minor adjustments).
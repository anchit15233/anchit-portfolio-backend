# Anchit Portfolio Backend

## 1) What this does
- Exposes `POST /chat` that returns answers about Anchit.
- Uses prefilled Q&A for: **about, skills, projects, papers/publications, experience**.
- Falls back to **GPT** with Anchit’s resume context for specific recruiter questions.

## 2) Files
- `package.json` – dependencies and start script
- `server.js` – Express server
- `.env` – NOT committed. Set on Render as an environment variable.

## 3) Deploy on Render
1. Create a **Web Service** from this repo.
2. Runtime: **Node 18+**
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Environment Variable:** `OPENAI_API_KEY = your_openai_api_key`
6. In `server.js`, update the CORS whitelist to include your Netlify URL:

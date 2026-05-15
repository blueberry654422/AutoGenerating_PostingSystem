# CaptionAI — Auto Generating & Posting System

A full-stack web application that uses AI to automatically generate social media captions and post them to multiple platforms. Users upload an image or describe a topic, choose a tone and language, review AI-generated caption variants, select target platforms, and schedule or immediately publish — all in a guided 5-step wizard.

## Features

- **AI Caption Generation** — generates 1–3 caption variants per post, with tone and language options (English, Bahasa Malaysia, Chinese, Bilingual)
- **Multi-Platform Support** — adapts captions for Xiaohongshu (XHS), Instagram, and Facebook, respecting each platform's character limits and hashtag rules
- **Flexible Scheduling** — post immediately, schedule for a specific date/time, or let AI recommend the best posting time based on engagement patterns
- **Edit & Regenerate** — edit any caption inline or regenerate individual variants before posting
- **Post History** — view all past posts and their statuses on the Done screen

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (port 5173) |
| Backend | Node.js + Express (port 3001) |
| State Management | React Context + useReducer |
| File Uploads | Multer (memory storage) |
| Storage | In-memory (no database required) |
| Styling | Plain CSS with CSS custom properties |

---

## Prerequisites

Make sure the following are installed on your machine before proceeding.

### Required

| Tool | Version | Download |
|---|---|---|
| Node.js | v18 or higher | https://nodejs.org |
| npm | v9 or higher (comes with Node.js) | — |
| Git | Any recent version | https://git-scm.com |

### Verify your versions

Open a terminal and run:

```bash
node -v    # should print v18.x.x or higher
npm -v     # should print 9.x.x or higher
git --version
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ky0504/AutoGenerating_PostingSystem.git
cd AutoGenerating_PostingSystem
```

### 2. Install root dependencies

The root `package.json` provides the `concurrently` script that runs both servers at once.

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

> **Shortcut:** You can run steps 3 and 4 together with:
> ```bash
> npm run install:all
> ```

---

## Running the App

### Development mode (recommended)

From the project root, run:

```bash
npm run dev
```

This starts both servers simultaneously:

| Server | URL | Description |
|---|---|---|
| React frontend | http://localhost:5173 | The UI |
| Express backend | http://localhost:3001 | The API |

Open **http://localhost:5173** in your browser.

> The Vite dev server automatically proxies all `/api` requests to the Express server, so you do not need to configure CORS or change any URLs.

---

### Running servers individually

If you prefer to run them separately (e.g. for debugging):

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Project Structure

```
AutoGenerating_PostingSystem/
├── package.json                  # Root: dev script (concurrently)
├── frontend/                     # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js            # Proxies /api → localhost:3001
│   └── src/
│       ├── App.jsx               # Router + route guards
│       ├── main.jsx
│       ├── api/client.js         # All fetch calls to the backend
│       ├── context/PostContext.jsx   # Global wizard state
│       ├── components/           # Nav, Stepper, PageShell
│       ├── pages/                # One file per screen
│       │   ├── UploadPage.jsx
│       │   ├── GeneratePage.jsx
│       │   ├── PlatformPage.jsx
│       │   ├── SchedulePage.jsx
│       │   └── DonePage.jsx
│       └── styles/global.css     # Shared CSS variables and utilities
└── backend/                      # Express backend
    ├── index.js                  # Entry point (port 3001)
    ├── middleware/multer.js      # File upload config
    ├── mock/
    │   ├── captionGenerator.js   # Mock AI caption generation
    │   └── socialPoster.js       # Mock social media posting
    ├── routes/
    │   ├── upload.js             # POST /api/upload
    │   ├── captions.js           # POST /api/captions/generate|regenerate
    │   ├── platforms.js          # POST /api/platforms
    │   ├── schedule.js           # POST /api/schedule
    │   └── posts.js              # GET /api/posts
    └── store/inMemoryStore.js    # In-memory session and post storage
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload image + settings, returns `sessionId` |
| GET | `/api/upload/:sessionId/preview` | Serve the uploaded image |
| POST | `/api/captions/generate` | Generate AI captions for a session |
| POST | `/api/captions/regenerate` | Regenerate a single caption variant |
| PATCH | `/api/captions/:sessionId` | Save user edits to a caption |
| POST | `/api/platforms` | Select platforms and get adapted captions |
| POST | `/api/schedule` | Submit post (immediate, scheduled, or best-time) |
| GET | `/api/posts` | Retrieve post history |

---

## User Flow

```
1. Upload      →  Upload image or enter a topic, choose tone/language/caption count
2. Generate    →  Review AI-generated captions, edit or regenerate, select one
3. Platform    →  Choose platforms (XHS / Instagram / Facebook), preview adapted captions
4. Schedule    →  Post now, schedule for later, or use AI-recommended best time
5. Done        →  See per-platform post status and history
```

---

## Notes for Developers

- **Storage is in-memory.** All sessions and posts are lost when the server restarts. To add persistence, replace `backend/store/inMemoryStore.js` with a database (e.g. SQLite, PostgreSQL, MongoDB).
- **AI is mocked.** Caption generation uses hardcoded templates in `backend/mock/captionGenerator.js`. To use a real LLM, replace the `generateCaptions` and `regenerateCaption` functions with API calls to Claude, OpenAI, etc.
- **Social posting is mocked.** `backend/mock/socialPoster.js` simulates posting. XHS always returns `pending` (requires in-app confirmation), IG and FB return `posted`. Replace with real Meta Graph API and XHS API calls when ready.
- **Image uploads** are held in memory (max 10 MB). Sessions older than 2 hours are automatically purged.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `staging` | Integration branch — PRs merge here before main |
| `feature/*` | Feature branches cut from `staging` |

# Signal — Meeting Summarizer

Turn a raw meeting recording into a clean transcript, an AI-generated summary, key discussion points, decisions, and a structured action-item list — automatically.

## Description

Signal is a full-stack web application that takes a meeting audio file, transcribes it with a speech-to-text (ASR) model, and runs the transcript through an LLM to extract:

- A concise overview and detailed summary
- The most important discussion points
- Decisions that were actually made
- Action items with assignee, deadline, and priority (only when explicitly stated in the transcript — the model is instructed never to invent facts)

Everything is stored in MongoDB so past meetings can be revisited at any time.

## Features

- 🔐 Email/password signup & login with JWT-based sessions; meetings are private to each account
- 🎙️ Drag-and-drop audio upload (MP3, WAV, M4A, MP4, WebM — up to 50MB)
- 📝 Speech-to-text transcription via OpenAI Whisper
- 🤖 Structured AI meeting analysis via GPT, with a dedicated, editable prompt file
- 📋 Key point, decision, and action-item extraction (no hallucinated names/deadlines)
- 🗂️ Meeting history with search, status filtering, and delete
- 📊 Dashboard with live stats (total, completed, processing, action items)
- 💾 MongoDB persistence with meeting status tracking (`uploaded → transcribing → summarizing → completed / failed`)
- 🎨 Polished, responsive UI with loading states, toasts, empty states, and a live processing pipeline tracker

## Architecture

```
React (Vite) → Express (Node.js) → MongoDB
                     ↓
              OpenAI Whisper (ASR)
                     ↓
               OpenAI GPT (LLM)
```

- The **frontend** never talks to OpenAI directly — all AI calls happen server-side, so API keys are never exposed to the browser.
- The **backend** keeps ASR and LLM logic in isolated service files (`transcriptionService.js`, `summarizationService.js`) so either provider can be swapped later without touching routes or controllers.
- The **prompt** used for summarization lives in its own file (`summarizationPrompt.js`) for easy iteration.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Axios, React Router, Lucide Icons, react-hot-toast
**Backend:** Node.js, Express, MongoDB, Mongoose, Multer, JWT (jsonwebtoken), bcryptjs
**AI:** OpenAI Whisper (transcription), OpenAI GPT (summarization) — called directly over HTTPS via axios rather than the `openai` SDK, to avoid Node's native `fetch`/`undici` connection issues seen on some Windows/antivirus setups

## Project Structure

```
meeting-summarizer/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Navbar, AudioDropzone, PipelineTracker, StatusBadge, etc.
│       ├── pages/            # Dashboard, UploadMeeting, MeetingHistory, MeetingDetails
│       ├── services/api.js   # All backend API calls
│       └── utils/format.js   # File validation, date/size formatting
│
├── server/                  # Express backend
│   └── src/
│       ├── config/db.js               # MongoDB connection
│       ├── controllers/               # Thin route handlers
│       ├── models/Meeting.js          # Mongoose schema
│       ├── routes/meetingRoutes.js    # REST endpoints
│       ├── services/                  # ASR, LLM, and prompt logic
│       ├── middleware/                # Multer upload + error handling
│       └── server.js                  # App entry point
│
├── .gitignore
└── README.md
```

## Installation

```bash
git clone <your-repo-url>
cd meeting-summarizer
npm run install:all
```

This installs dependencies for both `client/` and `server/`. (You can also `cd` into each folder and run `npm install` individually.)

## Running the Project

Make sure MongoDB is running locally (or point `MONGODB_URI` at an Atlas cluster), then:

```bash
# from the project root, runs both client and server together
npm run install:all
npm run dev
```

Or run them separately:

```bash
# Terminal 1
cd server
npm install
npm run dev        # starts on http://localhost:5000

# Terminal 2
cd client
npm install
npm run dev         # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint            | Auth required | Description                                              |
|--------|----------------------|:---:|------------------------------------------------------------|
| POST   | `/auth/signup`       | No | Create an account. Body: `{ name, email, password }`. Returns a JWT + user. |
| POST   | `/auth/login`        | No | Log in. Body: `{ email, password }`. Returns a JWT + user. |
| GET    | `/auth/me`           | Yes | Get the current logged-in user. |
| POST   | `/meetings`          | Yes | Upload an audio file (`multipart/form-data`, field: `audio`). Transcribes, summarizes, and saves the meeting. |
| GET    | `/meetings`          | Yes | List the current user's meetings (summary fields only). |
| GET    | `/meetings/:id`      | Yes | Get full details for one of the current user's meetings. |
| DELETE | `/meetings/:id`      | Yes | Delete one of the current user's meetings and its audio file. |
| GET    | `/health`            | No | Health check. |

Authenticated requests must include `Authorization: Bearer <token>`. The frontend handles this automatically once you're logged in.

**Response shape (success):**
```json
{ "success": true, "message": "Meeting processed successfully", "data": { /* meeting object */ } }
```

**Response shape (error):**
```json
{ "success": false, "message": "Unable to process meeting" }
```

## AI Approach

- **ASR:** Audio is streamed to OpenAI's Whisper API (`whisper-1`) and the plain-text transcript is stored on the meeting record.
- **LLM:** The transcript is sent to GPT (`gpt-4o-mini`) with `response_format: json_object` so the model is constrained to return valid JSON matching a fixed schema (title, overview, summary, keyPoints, decisions, actionItems).
- **Prompt engineering:** The system prompt (in `summarizationPrompt.js`) explicitly instructs the model to distinguish decisions from suggestions, only fill in assignee/deadline/priority when explicitly stated, and never invent information — unknowns are returned as `"Not specified"` rather than guessed.
- **Structured output validation:** The backend checks that the parsed JSON contains every required field and that array fields are actually arrays before saving. If parsing or validation fails, the meeting is marked `failed` with a stored error message instead of crashing the server.
- **Error handling:** ASR failures, LLM failures, malformed JSON, and empty transcripts are all caught, logged server-side, and surfaced to the user as a clear message — never as a raw stack trace or exposed API key.

## Screenshots

_Add screenshots here after running the app locally, e.g.:_

- `docs/screenshot-dashboard.png`
- `docs/screenshot-upload.png`
- `docs/screenshot-meeting-details.png`

## Demo

_Add a link to your demo video here._

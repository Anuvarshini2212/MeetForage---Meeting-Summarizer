# MeetForage — Meeting Summarizer

Turn a raw meeting recording into a clean transcript, an AI-generated summary, key discussion points, decisions, and a structured action-item list — automatically.

## Description

MeetForage is a full-stack web application that takes a meeting audio file, transcribes it with a speech-to-text (ASR) model, and runs the transcript through an LLM to extract:

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

## AI Approach

- **ASR:** Audio is streamed to OpenAI's Whisper API (`whisper-1`) and the plain-text transcript is stored on the meeting record.
- **LLM:** The transcript is sent to GPT (`gpt-4o-mini`) with `response_format: json_object` so the model is constrained to return valid JSON matching a fixed schema (title, overview, summary, keyPoints, decisions, actionItems).
- **Prompt engineering:** The system prompt (in `summarizationPrompt.js`) explicitly instructs the model to distinguish decisions from suggestions, only fill in assignee/deadline/priority when explicitly stated, and never invent information — unknowns are returned as `"Not specified"` rather than guessed.
- **Structured output validation:** The backend checks that the parsed JSON contains every required field and that array fields are actually arrays before saving. If parsing or validation fails, the meeting is marked `failed` with a stored error message instead of crashing the server.
- **Error handling:** ASR failures, LLM failures, malformed JSON, and empty transcripts are all caught, logged server-side, and surfaced to the user as a clear message — never as a raw stack trace or exposed API key.

## Screenshots

_Add screenshots here after running the app locally, e.g.:_

- <img width="1906" height="832" alt="image" src="https://github.com/user-attachments/assets/6bc05ca5-03c9-48b9-8e52-9854aeed2ee4" />
- <img width="1862" height="857" alt="image" src="https://github.com/user-attachments/assets/83e470e0-a34e-46ab-8670-0e5f80fca67a" />
- <img width="1886" height="857" alt="image" src="https://github.com/user-attachments/assets/350677d2-8403-4b6a-afd6-2f9cf8619fab" />


## Demo

_[Demo Video - MeetForage](https://drive.google.com/file/d/1riv4hriziYDwEr1LSu8fhoUB7IH1NO--/view)._

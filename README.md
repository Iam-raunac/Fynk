# Fynk

A social platform built from scratch — posts, profiles, connections, and an AI chat assistant baked right in.

---

## What it is

Fynk is a full-stack social media app where users can share posts, build a profile, connect with others, and talk to an AI assistant that actually knows who you are. No templates, no starters — built piece by piece with Next.js on the front and Express + MongoDB on the back.

---

## Features

- **Auth** — register, login, JWT-protected routes
- **Posts** — create with media (images), like, comment, delete
- **Profiles** — custom profile picture, bio, update your info, view others by username
- **Connections** — send, accept, and view connection requests
- **AI Chat** — personal assistant powered by Gemini, aware of your name and username, supports Hinglish naturally
- **Profile PDF** — download your profile as a PDF
- **Media uploads** — handled via Cloudinary (no disk storage on server)

---

## Tech stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- Redux Toolkit
- Axios

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT + bcrypt for auth
- Multer (memory storage) + Cloudinary for media
- Google Gemini API for the AI assistant

**Deployment**
- Frontend → Vercel
- Backend → Render

---

## Project structure

```
Fynk/
├── frontend/          # Next.js app
│   └── src/app/       # Pages and components
└── backend/
    ├── controllers/   # Business logic
    ├── routes/        # posts, users, chat
    ├── models/        # Mongoose schemas
    ├── middleware/     # JWT auth
    └── config/        # Env helpers
```

---

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB connection string, Cloudinary account, Gemini API key

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=9090
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:9090
```

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | backend | MongoDB connection |
| `JWT_SECRET` | backend | Token signing |
| `CLOUDINARY_*` | backend | Media uploads |
| `GEMINI_API_KEY` | backend | AI chat |
| `NEXT_PUBLIC_API_URL` | frontend | Points to backend |

---

## API routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login |
| POST | `/post` | Create post (with media) |
| GET | `/posts` | All posts feed |
| GET | `/posts/user/:username` | Posts by a user |
| POST | `/increment_post_like` | Like a post |
| POST | `/comment` | Comment on a post |
| GET | `/profile/:username` | Get profile by username |
| POST | `/update_profile_picture` | Upload profile picture |
| POST | `/api/chat/message` | Send message to AI |
| GET | `/api/chat/history` | Get chat history |

---

## Notes

- Media is stored using Cloudinary. Multer is configured with memory storage so nothing touches the server's filesystem — important for platforms like Render where the disk is ephemeral.
- The AI chat assistant uses a system prompt that injects the user's name and username, making conversations feel personal rather than generic.
- The connection system supports one-way requests with explicit accept — similar to LinkedIn's model.

---

## Author

Built by [Raunak](https://github.com/Iam-raunac)

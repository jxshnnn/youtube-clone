# JTube — YouTube Clone

A full-stack YouTube clone I built to learn backend development with Node.js. The backend handles everything — auth, video uploads, comments, likes, subscriptions, playlists, and a community post feature. The frontend is built with React and connects to the backend through REST APIs.

---

## What it does

- Register and log in with JWT-based auth (access + refresh tokens)
- Upload videos with a thumbnail (stored via Cloudinary)
- Browse a video feed, search by title or description
- Like videos and comments
- Subscribe to channels
- Leave comments on videos
- Create playlists and manage them
- Post community tweets/updates
- Dashboard for your channel stats (views, likes, subscribers)
- Profile settings — update name, email, avatar, cover image, password

---

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB with Mongoose
- JWT for auth (httpOnly cookies)
- Multer for file handling
- Cloudinary for image/video storage
- bcrypt for passwords

**Frontend**
- React 19 + Vite
- Redux Toolkit for state management
- React Router v7 for routing
- Axios for API calls (with interceptors)

---

## Project Structure

```
jas-backend/
├── public/                  # backend
│   ├── src/
│   │   ├── controllers/     # user, video, comment, like, playlist, tweet, subscription, dashboard
│   │   ├── models/          # mongoose schemas
│   │   ├── routes/          # express routers
│   │   ├── middlewares/     # auth (JWT verify), multer
│   │   └── utils/           # ApiError, ApiResponse, asyncHandler, cloudinary
│   └── temp/                # local upload staging (gitignored)
│
└── public/youtube-clone-frontend/   # frontend
    └── src/
        ├── pages/           # 14 pages
        ├── components/      # navbar, sidebar, cards, modals, etc.
        ├── store/           # redux slices
        └── services/        # axios api.js
```

---

## Running locally

**Backend**

```bash
cd public
npm install
```

create a `.env` file in `public/`:

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=some_random_string
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=another_random_string
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
# starts on http://localhost:8000
```

**Frontend**

```bash
cd public/youtube-clone-frontend
npm install
npm run dev
# starts on http://localhost:5173
```

---

## API Routes

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | `/api/v1/users/register` | register (multipart — avatar required) |
| POST | `/api/v1/users/login` | login |
| POST | `/api/v1/users/logout` | logout |
| GET | `/api/v1/users/current-user` | get logged in user |
| GET | `/api/v1/users/c/:username` | get channel profile |
| GET | `/api/v1/users/history` | watch history |
| GET | `/api/v1/videos` | list/search videos |
| POST | `/api/v1/videos` | upload video |
| GET | `/api/v1/videos/:id` | get video (increments views) |
| DELETE | `/api/v1/videos/:id` | delete video |
| POST | `/api/v1/subscriptions/c/:channelId` | toggle subscription |
| POST | `/api/v1/likes/toggle/v/:videoId` | toggle like on video |
| GET | `/api/v1/likes/videos` | get liked videos |
| GET | `/api/v1/comments/:videoId` | get comments |
| POST | `/api/v1/comments/:videoId` | add comment |
| GET | `/api/v1/playlists/user/:userId` | get user playlists |
| GET | `/api/v1/dashboard/stats` | channel stats |
| GET | `/api/v1/dashboard/videos` | channel videos |

---

## Notes

- avatar is required at registration, cover image is optional
- all video/subscription/like/comment routes need auth (JWT)
- tokens are stored in httpOnly cookies + localStorage for the Authorization header
- the `temp/` folder is local only — files get uploaded to cloudinary then cleaned up

---

made by jashan

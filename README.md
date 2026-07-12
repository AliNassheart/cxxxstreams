# StreamHub

A private live streaming platform for authorized broadcasters. Streamers publish
from their own encoder (e.g. OBS Studio) using a StreamHub-issued stream key;
the platform transcodes that ingest to HLS and serves it to viewers with live
chat and real-time viewer counts.

**Scope note:** StreamHub only plays back streams that its own owner/streamers
publish through their own RTMP ingest with a key issued by this platform.
There is no code here for discovering, pulling, proxying, or redistributing
someone else's broadcast — the RTMP `on_publish` webhook rejects any stream
key that isn't registered in the StreamHub database.

## Architecture

```
OBS Studio ──RTMP──▶ Nginx-RTMP ──on_publish webhook──▶ Express backend (auth check)
                         │
                         ▼ (ffmpeg exec)
                     HLS segments (.m3u8/.ts)
                         │
                         ▼
                  Frontend player (hls.js) ◀──REST + Socket.io──▶ Express + PostgreSQL
```

- **frontend/** — React + TypeScript + Vite + Tailwind CSS. hls.js video player,
  Socket.io client for chat/viewer counts, protected routes, role-aware UI.
- **backend/** — Node.js + Express + TypeScript + Socket.io + JWT + PostgreSQL.
  REST API for auth/streams/users, RTMP auth webhooks, S3-compatible presigned
  uploads for thumbnails.
- **backend/nginx-rtmp/** — Nginx + nginx-rtmp-module config for RTMP ingest →
  HLS packaging, gated by the backend's auth webhook.

## Local development

### 1. Database

```bash
docker compose up -d postgres
cd backend
cp .env.example .env   # fill in secrets
npm install
npm run migrate
npm run seed            # creates an initial admin login
```

### 2. Backend

```bash
cd backend
npm run dev              # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

### 4. RTMP ingest (optional, for testing live streaming end-to-end)

```bash
docker compose up -d rtmp
```

In OBS Studio: **Settings → Stream → Service: Custom**
- Server: `rtmp://localhost/live`
- Stream Key: the key shown in **Studio** after creating a stream in the app

Start streaming in OBS — the backend authorizes the key via the `on_publish`
webhook, FFmpeg (invoked by Nginx-RTMP) packages the feed into HLS, and the
stream appears live on the Browse page within a few seconds.

## Roles

- **viewer** (default on sign-up) — watch streams, chat.
- **streamer** — everything a viewer can do, plus create/manage their own
  streams and stream keys.
- **admin** — everything, plus promote/demote user roles and manage all
  streams platform-wide.

Only an admin can grant `streamer` or `admin` access (via the Admin panel or
the `PATCH /api/users/:userId/role` endpoint), keeping ingest limited to
people the platform owner has explicitly authorized.

## Deployment notes

- **Database:** point `DATABASE_URL` at a managed PostgreSQL instance (RDS,
  Cloud SQL, Supabase, etc.) and run `npm run migrate` once against it.
- **Object storage:** thumbnails upload directly to any S3-compatible bucket
  (AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO) via presigned URLs —
  set the `S3_*` variables in `backend/.env`.
- **RTMP/HLS:** run `backend/nginx-rtmp/nginx.conf` on a host with public RTMP
  (1935) and HLS (8080, or behind your CDN/reverse proxy) ports open. For
  production, front the HLS output with a CDN and consider a dedicated
  transcoding pipeline instead of the inline `ffmpeg exec` for scale.
- **Socket.io at scale:** the in-memory viewer registry in
  `backend/src/socket/index.ts` works for a single backend instance. For
  multiple instances, add the Socket.io Redis adapter and move viewer
  presence into Redis.
- **Secrets:** set strong, unique values for `JWT_ACCESS_SECRET` and
  `JWT_REFRESH_SECRET` in production; never reuse the defaults from
  `.env.example`.
- **Containers:** `docker-compose.yml` provides a local reference stack
  (Postgres, backend, Nginx-RTMP, frontend). Build and push the `backend/`
  and `frontend/` Dockerfiles to your registry for cloud deployment (ECS,
  Cloud Run, Fly.io, a Kubernetes cluster, etc.).

## Project structure

```
streamhub/
├── backend/
│   ├── src/
│   │   ├── config/        # db pool, migrations, seed
│   │   ├── controllers/   # auth, streams
│   │   ├── middleware/    # JWT auth, role guards
│   │   ├── models/        # User, Stream (raw SQL via pg)
│   │   ├── routes/        # auth, streams, users, media
│   │   ├── socket/        # Socket.io gateway (chat, viewer counts)
│   │   └── server.ts
│   └── nginx-rtmp/nginx.conf
├── frontend/
│   └── src/
│       ├── components/    # Navbar, VideoPlayer, LiveChat, StreamCard, ...
│       ├── context/        # AuthContext
│       ├── pages/          # Browse, Login, Register, Dashboard, Watch, Studio, Admin
│       ├── services/        # api.ts (axios), socket.ts
│       └── types/
└── docker-compose.yml
```

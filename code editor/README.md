# CodeForge — Online Code Editor Platform

> A professional, enterprise-grade online code editor supporting 11+ languages, real-time collaboration, AI assistance, and Docker-based secure code execution.

![CodeForge](https://img.shields.io/badge/CodeForge-v1.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-required-blue?style=flat-square)

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + Monaco Editor |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Auth | JWT (access + refresh) + Google OAuth |
| Execution | Docker sandbox containers |
| Real-time | Socket.IO |
| AI | OpenAI GPT API |
| Storage | Local filesystem (S3 compatible) |

---

## 📋 Prerequisites

- **Node.js** 20+
- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **PostgreSQL** (or use Docker Compose)
- **Redis** (or use Docker Compose)

---

## ⚡ Quick Start

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd code-editor

# Copy environment file
cp .env.example .env
# Edit .env with your values (JWT secrets, Google OAuth, OpenAI key)
```

### 2. Build Docker sandbox images (required for code execution)

```bash
# From the project root
bash backend/scripts/build-sandbox-images.sh
```

### 3. Start all services with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 4000
- Frontend dev server on port 5173

### 4. Run database migrations

```bash
docker exec -it codeforge_backend npx prisma migrate deploy
```

### 5. Open the app

Visit **http://localhost:5173** 🎉

---

## 🛠️ Local Development (without Docker)

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
code-editor/
├── frontend/           # React + TypeScript + Tailwind + Monaco
│   ├── src/
│   │   ├── pages/      # Route pages (Editor, Dashboard, etc.)
│   │   ├── components/ # Reusable UI components
│   │   ├── store/      # Zustand state management
│   │   ├── services/   # API client + Socket.IO client
│   │   └── utils/      # Helper functions
│   └── package.json
│
├── backend/            # Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Auth, rate limiting, error handling
│   │   ├── socket/     # Socket.IO collaboration
│   │   └── db/         # Prisma client + Redis client
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
│
├── docker/
│   └── sandbox/        # Per-language sandbox Dockerfiles
│       ├── Dockerfile.python
│       ├── Dockerfile.node
│       ├── Dockerfile.java
│       └── ...
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🌐 API Reference

Base URL: `http://localhost:4000/api/v1`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/google` | Google OAuth login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout (blacklists token) |
| GET  | `/auth/me` | Get current user |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset password |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | List user's projects |
| GET | `/projects/public` | Browse public projects |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get project + files |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| POST | `/projects/:id/fork` | Fork a project |
| GET | `/projects/:id/download` | Download as ZIP |

### Code Execution
| Method | Endpoint | Description |
|---|---|---|
| POST | `/execute` | Run code (Docker sandbox) |
| GET  | `/execute/history` | Execution history |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/explain` | Explain code |
| POST | `/ai/debug` | Find bugs |
| POST | `/ai/refactor` | Refactor code |
| POST | `/ai/optimize` | Optimize performance |
| POST | `/ai/generate` | Generate from description |
| POST | `/ai/complete` | Inline completion |
| POST | `/ai/chat` | Conversational assistant |

### Challenges
| Method | Endpoint | Description |
|---|---|---|
| GET | `/challenges` | List challenges |
| GET | `/challenges/:slug` | Get challenge |
| POST | `/submissions` | Submit solution |

---

## 🐳 Docker Sandbox Security

Each code execution runs in an isolated Docker container with:

- `--network none` — No network access
- `--memory 256m` — Memory limit
- `--cpus 0.5` — CPU limit
- `--pids-limit 64` — Process limit
- `--cap-drop ALL` — No Linux capabilities
- `--security-opt no-new-privileges` — No privilege escalation
- **15 second timeout** — Kills hanging processes

---

## 🔐 Environment Variables

See [`.env.example`](.env.example) for all variables. Required ones:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
```

Optional (features degrade gracefully if absent):

```env
GOOGLE_CLIENT_ID=...     # Google OAuth
OPENAI_API_KEY=...       # AI features
SMTP_HOST=...            # Password reset emails
```

---

## 📦 Supported Languages

| Language | Extension | Runtime |
|---|---|---|
| JavaScript | .js | Node 20 |
| TypeScript | .ts | ts-node |
| Python | .py | Python 3.12 |
| Java | .java | JDK 21 |
| C | .c | GCC 13 |
| C++ | .cpp | G++ 13 |
| Go | .go | Go 1.22 |
| Rust | .rs | Rust 1.78 |
| PHP | .php | PHP 8.3 |
| Ruby | .rb | Ruby 3.3 |
| C# | .cs | .NET 8 |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

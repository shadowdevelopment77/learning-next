# 📝 Todo List App
 
A full-stack Todo List application built with **Next.js 16**, **PostgreSQL**, and **TypeScript**. Features a complete authentication system built from scratch — no third-party auth libraries — with session-based login, secure password hashing, and per-user task isolation. The main goal build this app is for learning!
 
---
 
## ✨ Features
 
- **Authentication** — Register, login, and logout with session-based auth (no JWT library, built from scratch)
- **Per-user todos** — Each user only sees their own tasks
- **Create, edit, complete, delete** — Full CRUD with soft delete pattern
- **Password security** — Bcrypt hashing with salt rounds 12
- **Session security** — HttpOnly cookies, server-side session validation, 7-day expiry
- **Soft delete** — Records are never hard-deleted; supports data recovery and audit trails
- **Consistent API responses** — Unified `{ data, message, success }` structure across all endpoints
- **TypeScript** — Fully typed with generic `ApiResponse<T>` interface
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| DB Driver | node-postgres (`pg`) |
| Styling | Tailwind CSS v4 |
| Auth | Custom session-based (bcryptjs) |
 
---
 
## 📁 Project Structure
 
```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/        # POST - login user
│   │   │   ├── logout/       # POST - destroy session
│   │   │   ├── me/           # GET  - current user info
│   │   │   └── register/     # POST - create account
│   │   └── todos/
│   │       ├── route.ts      # GET (list), POST (create)
│   │       └── [id]/route.ts # PUT (edit/toggle), DELETE (soft delete)
│   ├── login/                # Login page
│   ├── register/             # Register page
│   └── page.tsx              # Main todo page
├── components/
│   ├── TodoForm.tsx          # Add new todo input
│   └── TodoItem.tsx          # Single todo with edit/delete/toggle
├── lib/
│   ├── db.ts                 # PostgreSQL connection pool
│   └── session.ts            # Session create, get, delete
└── types/
    └── index.ts              # Shared TypeScript interfaces
```
 
---
 
## 🗃️ Database Schema
 
Run the following SQL to set up your database:
 
```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   TEXT                NOT NULL,
  role       VARCHAR(50)         NOT NULL DEFAULT 'staff',
  is_active  BOOLEAN             NOT NULL DEFAULT true,
  is_deleted BOOLEAN             NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP           NOT NULL DEFAULT NOW()
);
 
CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
 
CREATE TABLE todos (
  id           SERIAL PRIMARY KEY,
  title        TEXT    NOT NULL,
  user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_complete  BOOLEAN   NOT NULL DEFAULT false,
  is_deleted   BOOLEAN   NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  deleted_at   TIMESTAMP,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
```
 
---
 
## 🚀 Getting Started
 
### Prerequisites
 
- Node.js 18+
- PostgreSQL 14+
### 1. Clone the repository
 
```bash
git clone https://github.com/your-username/todo-list.git
cd todo-list
```
 
### 2. Install dependencies
 
```bash
npm install
```
 
### 3. Configure environment variables
 
Create a `.env.local` file in the root directory:
 
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/todo_practice
```
 
### 4. Set up the database
 
Create the database and run the schema above:
 
```bash
psql -U postgres -c "CREATE DATABASE todo_practice;"
psql -U postgres -d todo_practice -f schema.sql
```
 
### 5. Run the development server
 
```bash
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000) in your browser.
 
---
 
## 🔐 Authentication Flow
 
```
Register → bcrypt hash password → insert user → create session → set HttpOnly cookie
Login    → fetch user → bcrypt compare → create session → set HttpOnly cookie
Request  → read cookie → validate session in DB → return user or 401
Logout   → delete session from DB → clear cookie
```
 
Sessions are stored server-side in the database. The browser only holds a session ID in an HttpOnly cookie — the actual user data never touches the client.
 
---
 
## 📡 API Endpoints
 
### Auth
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Login and create session |
| `POST` | `/api/auth/logout` | Destroy session |
| `GET` | `/api/auth/me` | Get current logged-in user |
 
### Todos
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/todos` | Get all todos for current user |
| `POST` | `/api/todos` | Create a new todo |
| `PUT` | `/api/todos/:id` | Edit title or toggle complete |
| `DELETE` | `/api/todos/:id` | Soft delete a todo |
 
### Response Format
 
All endpoints return a consistent response shape:
 
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": { ... }
}
```
 
---
 
## 🧠 Key Design Decisions
 
**Why session-based auth instead of JWT?**
Server-side sessions allow immediate invalidation — if a user is deactivated or logs out, the session is gone from the database instantly. JWTs are stateless and cannot be revoked before expiry without additional infrastructure.
 
**Why soft delete?**
Hard deletes are irreversible. Soft delete (`is_deleted = true`, `deleted_at = NOW()`) preserves data for audit trails and makes account recovery possible. Active queries always filter `WHERE is_deleted = false`.
 
**Why no ORM?**
Raw SQL with `node-postgres` keeps the queries explicit and easy to debug. For a project of this scope, an ORM adds abstraction without much benefit.
 
---

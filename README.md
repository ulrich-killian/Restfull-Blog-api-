#  RESTful Blog API

> A full-featured backend for a blogging platform with commenting system, JWT authentication, profile picture uploads, and search functionality.  
> Built with Node.js, Express, and PostgreSQL.

---

##  Tech Stack

| Layer | Technology |
| :--- | :--- |
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + Bcrypt.js |
| Security | Helmet, Express-Rate-Limit, CORS |
| Validation | express-validator |
| File Upload | Multer |
| Testing | Jest + Supertest |

---

##  Architecture & Design

- **Layered Architecture** — Routes → Controllers → Services → Repositories → Database.
- **JWT Authentication** — Stateless auth via `Authorization: Bearer <token>` header.
- **Ownership Checks** — Users can only update or delete their own posts and comments.
- **Cascading Deletes** — Deleting a post automatically removes all its comments.
- **Rate Limiting** — Auth endpoints: 5 requests per 15 min. Global: 100 requests per 15 min.
- **Pagination** — All list endpoints support `?limit=10&offset=0`.
- **Search** — Full text search on post titles and content using SQL `ILIKE`.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL (or a free [Supabase](https://supabase.com) account)

### Installation

```bash
git clone https://github.com/ulrich-killian/Restfull-Blog-api-
cd restfulblogapi
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres.yourproject:yourpassword@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=24h
PORT=3000
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000`.  
Tables and seed data are created automatically on first run.

### Running Tests

```bash
npm test
```

---

##  Database Schema

Three relational tables with cascading deletes:

```
users
  id, username, email, password_hash, profile_picture, created_at

posts
  id, title, content, author_id → users(id), created_at, updated_at

comments
  id, content, post_id → posts(id), author_id → users(id), created_at
```

---

## API Endpoints

Base URL: `https://restfull-blog-api.onrender.com`

>  Protected routes require: `Authorization: Bearer <token>`

---

###  Authentication

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register a new user. Returns `201` with JWT. |
| `POST` | `/auth/login` | Public | Authenticate user. Returns JWT or `401`. |
| `GET` | `/auth/me` |  Required | Get logged in user info. |
| `POST` | `/auth/profile_upload` |  Required | Upload a profile picture. |

#### Register
```
POST /auth/register
```
```json
{
  "username": "alice",
  "email": "alice@blog.com",
  "password": "securepass123"
}
```
**Success `201`:***
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@blog.com",
    "created_at": "2026-05-05T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
| Status | Reason |
| :--- | :--- |
| `400` | Missing or invalid fields |
| `409` | Email or username already exists |
| `429` | Too many requests |

---

#### Login
```
POST /auth/login
```
```json
{
  "email": "alice@blog.com",
  "password": "securepass123"
}
```
**Success `200`:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@blog.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Get logged in user
```
GET /auth/me
Authorization: Bearer <token>
```
**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "alice",
    "email": "alice@blog.com",
    "profile_picture": "/uploads/1-1778026188417.jpg",
    "created_at": "2026-05-05T10:00:00.000Z"
  }
}
```

---

#### Upload profile picture
```
POST /auth/profile_upload
Authorization: Bearer <token>
Body: multipart/form-data
  key: profile_picture
  value: (image file — JPEG, PNG or WEBP, max 2MB)
```
**Success `200`:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "profile_picture": "/uploads/1-1778026188417.jpg"
}
```

---

###  Posts

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts` | Public | List all posts with pagination and search. |
| `GET` | `/posts/:id` | Public | Fetch a single post with its comments. |
| `POST` | `/posts` |  Required | Create a new post. |
| `PUT` | `/posts/:id` |  Author only | Update a post. |
| `DELETE` | `/posts/:id` |  Author only | Delete a post and all its comments. |

#### Get all posts
```
GET /posts
GET /posts?limit=5&offset=0
GET /posts?q=Node
```
**Success `200`:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "title": "Getting Started with Node.js",
      "content": "Node.js is a JavaScript runtime...",
      "author_username": "alice",
      "comment_count": "3",
      "created_at": "2026-05-05T10:00:00.000Z"
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

---

#### Get post by ID
```
GET /posts/1
```
**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Getting Started with Node.js",
    "content": "Node.js is a JavaScript runtime...",
    "author_username": "alice",
    "comments": [
      {
        "id": 1,
        "content": "Great post!",
        "author_username": "bob",
        "created_at": "2026-05-05T11:00:00.000Z"
      }
    ]
  }
}
```

---

#### Create a post
```
POST /posts
Authorization: Bearer <token>
```
```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post on this platform."
}
```
**Success `201`:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post on this platform.",
    "author_id": 1,
    "created_at": "2026-05-05T10:00:00.000Z"
  }
}
```

**Errors:**
| Status | Reason |
| :--- | :--- |
| `400` | Missing title or content |
| `401` | Not authenticated |

---

#### Update a post
```
PUT /posts/6
Authorization: Bearer <token>
```
```json
{
  "title": "My Updated Blog Post Title"
}
```
> All fields are optional — only include what you want to change.

**Errors:**
| Status | Reason |
| :--- | :--- |
| `403` | You are not the author |
| `404` | Post not found |

---

#### Delete a post
```
DELETE /posts/6
Authorization: Bearer <token>
```
**Success `200`:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

###  Comments

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts/:id/comments` | Public | List all comments for a post. |
| `POST` | `/posts/:id/comments` | 🔒 Required | Add a comment to a post. |
| `DELETE` | `/posts/:id/comments/:commentId` | 🔒 Author only | Delete a comment. |

#### Get comments
```
GET /posts/1/comments
```
**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "Great introduction to Node.js!",
      "author_username": "bob",
      "created_at": "2026-05-05T11:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### Add a comment
```
POST /posts/1/comments
Authorization: Bearer <token>
```
```json
{
  "content": "This is a really helpful post, thanks!"
}
```
**Success `201`:**
```json
{
  "success": true,
  "data": {
    "id": 11,
    "content": "This is a really helpful post, thanks!",
    "post_id": 1,
    "author_id": 1,
    "created_at": "2026-05-05T12:00:00.000Z"
  }
}
```

---

#### Delete a comment
```
DELETE /posts/1/comments/11
Authorization: Bearer <token>
```
**Success `200`:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### Search

```
GET /posts?q=Node
GET /posts?q=PostgreSQL&limit=5&offset=0
```

Searches across post titles and content using case-insensitive matching.

---

## Real World Test Flow

### Step 1 — Register
```
POST /auth/register
{ "username": "alice", "email": "alice@blog.com", "password": "pass123" }
```

### Step 2 — Login and save token
```
POST /auth/login
{ "email": "alice@blog.com", "password": "pass123" }
```

### Step 3 — Upload profile picture
```
POST /auth/profile_upload
Authorization: Bearer <token>
Body: form-data → profile_picture: (image file)
```

### Step 4 — Create a post
```
POST /posts
Authorization: Bearer <token>
{ "title": "My First Post", "content": "This is my first post on this platform." }
```

### Step 5 — Add a comment
```
POST /posts/1/comments
Authorization: Bearer <token>
{ "content": "Great post Alice!" }
```

### Step 6 — Search posts
```
GET /posts?q=First
```

### Step 7 — Delete your comment
```
DELETE /posts/1/comments/1
Authorization: Bearer <token>
```

---

## Tests

22 tests covering all endpoints:

- Auth: register, login, getMe, duplicate email, invalid token
- Posts: list, pagination, search, create, update, delete, 404
- Comments: list, create, delete, auth failures, empty content

```bash
npm test
```

---

## Roadmap

- [ ] Post categories and tags
- [ ] Like/reaction system
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Swagger API documentation


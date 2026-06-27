# URL Shortener

A full-stack URL Shortener built with Node.js, Express, PostgreSQL, Drizzle ORM, JWT Authentication, and Zod validation. Includes a vanilla HTML/CSS/JS frontend.

## Features

- User Signup & Login
- JWT-based Authentication
- Create Short URLs
- Custom Short Codes Support
- Redirect to Original URL
- List User URLs
- Update Existing URLs
- Delete URLs
- Click Tracking & Analytics
- URL Expiration
- Rate Limiting
- PostgreSQL Database
- Drizzle ORM
- Zod Validation

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Drizzle ORM
- JWT
- Zod
- NanoID
- express-rate-limit
- PNPM

---

## Installation

### Clone Repository

```bash
git clone https://github.com/itsgintoki/url-shortener.git
cd url-shortener
```

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
JWT_SECRET=your-secret-key
PORT=8000
```

---

## Database Setup

Push schema:

```bash
pnpm db:push
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

---

## Running the Project

```bash
pnpm dev
```

Server runs at:

```
http://localhost:8000
```

Open `index.html` in your browser to use the frontend.

---

# API Endpoints

## Authentication

### Signup

```http
POST /user/signup
```

Request:

```json
{
  "firstName": "Gintoki",
  "lastName": "Sakata",
  "email": "ginsaka@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "data": {
    "userId": "uuid"
  }
}
```

---

### Login

```http
POST /user/login
```

Request:

```json
{
  "email": "gin@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "jwt_token"
}
```

---

## Authentication Header

Protected routes require:

```http
Authorization: Bearer <jwt_token>
```

---

## Create Short URL

```http
POST /shorten
```

Basic request:

```json
{
  "url": "https://google.com"
}
```

With custom code and expiry:

```json
{
  "url": "https://google.com",
  "code": "google",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

Response:

```json
{
  "id": "uuid",
  "shortCode": "google",
  "targetURL": "https://google.com",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

---

## Get User URLs

```http
GET /codes
```

Response:

```json
{
  "codes": [
    {
      "id": "uuid",
      "shortCode": "abc123",
      "targetURL": "https://example.com",
      "clicks": 42,
      "expiresAt": null
    }
  ]
}
```

---

## Update URL

```http
PATCH /:id
```

Request:

```json
{
  "targetURL": "https://new-site.com"
}
```

Response:

```json
{
  "id": "uuid",
  "shortCode": "abc123",
  "targetURL": "https://new-site.com"
}
```

---

## Delete URL

```http
DELETE /:id
```

Response:

```json
{
  "deleted": true
}
```

---

## Analytics

### All links

```http
GET /analytics
```

Response:

```json
{
  "analytics": [
    {
      "shortCode": "abc123",
      "targetURL": "https://example.com",
      "clicks": 42
    }
  ]
}
```

### Single link

```http
GET /analytics/:shortCode
```

Response:

```json
{
  "analytics": {
    "shortCode": "abc123",
    "targetURL": "https://example.com",
    "totalClicks": 42,
    "lastClickAt": "2025-06-01T10:30:00.000Z"
  }
}
```

---

## Redirect

```http
GET /:shortCode
```

Redirects to the original URL. Returns `410 Gone` if the link has expired.

---

## Rate Limiting

- General: 100 requests per 15 minutes per IP
- `/shorten`: 10 requests per 15 minutes per IP

---

## Available Scripts

```bash
pnpm dev        # Start development server
pnpm db:push    # Push schema changes to PostgreSQL
pnpm db:studio  # Open Drizzle Studio
```

---

## Security

- Passwords are salted and hashed
- JWT-based authentication
- Zod request validation
- User-owned URL management
- Protected CRUD operations
- Rate limiting on all routes

---


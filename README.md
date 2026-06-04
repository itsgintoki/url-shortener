# URL Shortener

A RESTful URL Shortener API built with Node.js, Express, PostgreSQL, Drizzle ORM, JWT Authentication, and Zod validation.

## Features

- User Signup & Login
- JWT-based Authentication
- Create Short URLs
- Custom Short Codes Support
- Redirect to Original URL
- List User URLs
- Update Existing URLs
- Delete URLs
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

Server:

```text
http://localhost:8000
```

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

Request:

```json
{
  "url": "https://google.com"
}
```

Custom code:

```json
{
  "url": "https://google.com",
  "code": "google"
}
```

Response:

```json
{
  "id": "uuid",
  "shortCode": "google",
  "targetURL": "https://google.com"
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
      "targetURL": "https://example.com"
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

## Redirect

```http
GET /:shortCode
```

Example:

```http
GET /google
```

Redirects to:

```text
https://google.com
```

---

## Available Scripts

```bash
pnpm dev
```

Start development server.

```bash
pnpm db:push
```

Push schema changes to PostgreSQL.

```bash
pnpm db:studio
```

Open Drizzle Studio.

---

## Security

- Passwords are salted and hashed
- JWT-based authentication
- Zod request validation
- User-owned URL management
- Protected CRUD operations

---

## Future Improvements

- Analytics Dashboard
- Click Tracking
- URL Expiration
- QR Code Generation
- Rate Limiting
- Swagger/OpenAPI Docs
- Docker Support
- Custom Domains

---

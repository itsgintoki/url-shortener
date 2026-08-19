# URL Shortener

A high-performance, full-stack URL Shortener REST API built with Node.js (ES Modules), Express, PostgreSQL, Drizzle ORM, JWT Authentication, and Zod validation. Includes a responsive dark-themed dashboard frontend.

---

## 🚀 Features

- **User Authentication**: Secure signup and login with salted password hashing and signed JWT tokens (7-day expiry).
- **URL Shortening**: Generate automated NanoID short links or provide custom codes.
- **Reserved Slug Protection**: Blocks system route collisions (`codes`, `analytics`, `shorten`, `user`, etc.).
- **URL Expiration**: Automatic expiration handling returning `410 Gone` on expired links.
- **Fast Non-Blocking Redirections**: Immediate HTTP 302 redirects with asynchronous, concurrent click logging.
- **Analytics & Tracking**: Real-time click counter, detailed click timestamps, and user analytics overview.
- **User Dashboard & URL Management**: Paginated link listing, update destination URLs, and delete links.
- **Input & Parameter Validation**: Robust Zod schemas validating request bodies and UUID URL parameters.
- **Rate Limiting**: Built-in IP rate limiters to protect endpoints against brute-force and abuse.
- **Database & ORM**: PostgreSQL database managed with Drizzle ORM with schema migrations and Drizzle Studio support.

---

## 🛠️ Tech Stack

- **Runtime & Framework**: Node.js, Express.js (ES Modules)
- **Database & ORM**: PostgreSQL, Drizzle ORM, `pg` driver
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken`), Node.js `crypto` (Salted HMAC-SHA256)
- **Validation**: Zod
- **Utilities**: NanoID, CORS, `express-rate-limit`, `dotenv`
- **Containerization**: Docker Compose

---

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/itsgintoki/url-shortener.git
cd url-shortener
```

### 2. Install Dependencies
```bash
pnpm install
# or npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:

```env
PORT=8000
DATABASE_URL=postgresql://postgres:admin@localhost:5432/postgres
JWT_SECRET=your-secure-jwt-secret-key
```

### 4. Database Setup

#### Option A: Using Docker Compose (Recommended)
Start the PostgreSQL container:
```bash
docker compose up -d
```

#### Option B: Local PostgreSQL
Ensure PostgreSQL is running and matches the `DATABASE_URL` in your `.env` file.

#### Push Schema to Database:
```bash
pnpm db:push
```

#### Optional: Open Drizzle Studio UI:
```bash
pnpm db:studio
```

---

## 🏃 Running the Application

### Development Mode (with auto-reload):
```bash
pnpm dev
```

The API server runs at:
```
http://localhost:8000
```

Open `index.html` in your browser to interact with the frontend UI.

---

## 📂 Project Structure

```
url-shortener/
├── db/
│   └── index.js               # Drizzle database client initialization
├── drizzle/                   # Drizzle migration artifacts
├── middlewares/
│   └── auth.middleware.js     # Global JWT parser & ensureAuthenticated guard
├── models/
│   ├── index.js               # Model exports
│   ├── url.model.js           # 'urls' and 'url_clicks' table schemas
│   └── user.model.js          # 'users' table schema
├── routes/
│   ├── url.routes.js          # URL shortening, redirection, and analytics routes
│   └── user.routes.js         # Authentication routes (/user/signup, /user/login)
├── services/
│   └── user.services.js       # User database query services
├── utils/
│   ├── hash.js                # Password hashing with crypto.createHmac
│   └── token.js               # JWT creation & verification utilities
├── validations/
│   ├── request.validation.js  # Request body & UUID parameter Zod schemas
│   └── token.validations.js   # JWT payload validation schema
├── docker-compose.yml         # PostgreSQL container definition
├── drizzle.config.js          # Drizzle Kit configuration
├── index.html                 # Frontend dashboard interface
├── index.js                   # Application entry point & middleware pipeline
└── package.json
```

---

## 📖 API Reference

### 🔐 Authentication Endpoints

#### 1. User Signup
```http
POST /user/signup
```
* **Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "strongPassword123"
}
```
* **Response (`201 Created`):**
```json
{
  "data": {
    "userId": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
  }
}
```
* **Errors**: `400 Bad Request` (validation failure or email already in use).

---

#### 2. User Login
```http
POST /user/login
```
* **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "strongPassword123"
}
```
* **Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Errors**: `401 Unauthorized` (`"Invalid email or password"`).

---

### 🔗 URL Endpoints (Protected)

> **Authentication Header:** All protected endpoints require a valid JWT Bearer token:
> ```http
> Authorization: Bearer <your_jwt_token>
> ```

#### 3. Create Short URL
```http
POST /shorten
```
* **Request Body (Basic):**
```json
{
  "url": "https://github.com"
}
```
* **Request Body (Custom Code & Expiration):**
```json
{
  "url": "https://github.com",
  "code": "my-github",
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```
* **Custom Code Rules**: 3–30 characters, alphanumeric with hyphens/underscores. Cannot be a reserved keyword (`codes`, `analytics`, `shorten`, `user`, `login`, `signup`, `api`, `health`, `favicon.ico`).
* **Response (`201 Created`):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "shortCode": "my-github",
  "targetURL": "https://github.com",
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```
* **Errors**:
  * `400 Bad Request` (invalid URL format or reserved custom code)
  * `409 Conflict` (`"This custom short code is already in use."`)

---

#### 4. List User URLs (Paginated)
```http
GET /codes?page=1
```
* **Query Parameters**:
  * `page` (optional, default: `1`) - 20 items per page.
* **Response (`200 OK`):**
```json
{
  "codes": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "shortCode": "my-github",
      "targetURL": "https://github.com",
      "clicks": 42,
      "expiresAt": "2026-12-31T23:59:59.000Z"
    }
  ],
  "page": 1,
  "limit": 20
}
```

---

#### 5. Update Target URL
```http
PATCH /:id
```
* **URL Parameter**: `:id` (must be a valid UUID)
* **Request Body:**
```json
{
  "targetURL": "https://github.com/new-destination"
}
```
* **Response (`200 OK`):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "shortCode": "my-github",
  "targetURL": "https://github.com/new-destination"
}
```
* **Errors**: `400 Bad Request` (invalid UUID format or invalid URL), `404 Not Found`.

---

#### 6. Delete Short URL
```http
DELETE /:id
```
* **URL Parameter**: `:id` (must be a valid UUID)
* **Response (`200 OK`):**
```json
{
  "deleted": true
}
```
* **Errors**: `400 Bad Request` (invalid UUID format), `404 Not Found`.

---

### 📊 Analytics Endpoints (Protected)

#### 7. Overall Analytics
```http
GET /analytics
```
* **Response (`200 OK`):**
```json
{
  "analytics": [
    {
      "shortCode": "my-github",
      "targetURL": "https://github.com",
      "clicks": 42,
      "expiresAt": "2026-12-31T23:59:59.000Z"
    }
  ]
}
```

---

#### 8. Single Link Analytics
```http
GET /analytics/:shortcode
```
* **Response (`200 OK`):**
```json
{
  "analytics": {
    "shortCode": "my-github",
    "targetURL": "https://github.com",
    "totalClicks": 42,
    "lastClickAt": "2026-08-19T17:40:00.000Z"
  }
}
```

---

### 🌍 Redirection Endpoint (Public)

#### 9. Visit Short URL
```http
GET /:shortCode
```
* **Response**: `302 Found` (Redirects to original `targetURL`).
* **Errors**:
  * `404 Not Found` (invalid or non-existent short code)
  * `410 Gone` (`"This link has expired"`)

---

## 🛡️ Security Features

- **Salted Hashing**: Each user password is independently salted using `crypto.randomBytes(256)` and hashed via HMAC-SHA256.
- **Enumeration Defense**: Unified `401 Unauthorized` responses on login prevent account enumeration.
- **JWT Lifespan**: Signed JWT payloads with strict 7-day expiration.
- **UUID Sanitization**: All path parameters are validated via Zod schemas before querying the database, preventing Postgres UUID formatting exceptions (`22P02`).
- **Route Collision Prevention**: Strict reserved slug checks protect API and frontend routing namespaces.
- **Rate Limiting**:
  * Global limiter: `100 requests / 15 minutes / IP`
  * Shorten limiter: `10 requests / 15 minutes / IP`

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the server in watch mode using `node --watch index` |
| `pnpm db:push` | Synchronizes Drizzle ORM schema with PostgreSQL |
| `pnpm db:studio` | Launches Drizzle Studio database management interface |

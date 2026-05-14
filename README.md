"# ShopEase AI E-Commerce Backend

This backend powers the ShopEase AI platform with Express, Prisma, and AI-enhanced services. It handles authentication, product management, orders, carts, reviews, notifications, admin analytics, and AI workflows.

## Features

- User authentication and authorization with role-based access
- Product, category, order, cart, wishlist, blog, and FAQ APIs
- Admin dashboard and management endpoints
- AI endpoints for search parsing, stylist suggestions, review summarization, chat support, and product description generation
- Prisma ORM with PostgreSQL
- Security middleware: helmet, cors, compression, rate limiting, and HPP

## Tech Stack

- Node.js + Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- Axios
- OpenRouter AI / Gemini support
- Zod validation
- Winston logging

## Setup

### Install dependencies

```bash
cd server
npm install
```

### Environment

Create a `server/.env` file with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/shopease
OPENROUTER_API_KEY=your_openrouter_api_key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Run locally

```bash
npm run dev
```

The backend listens on `http://localhost:5000` by default.

## Database

If you are using Prisma with PostgreSQL:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Important Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/ai/search`
- `POST /api/ai/stylist`
- `GET /api/ai/reviews/:productId/summary`
- `POST /api/ai/chat`
- `POST /api/ai/generate-description` (ADMIN/VENDOR only)

## Notes

- AI service calls require a valid `OPENROUTER_API_KEY`.
- The AI backend uses OpenRouter chat completions for search intent, review summaries, stylist recommendations, support chat, and description generation.
- For production, set `FRONTEND_URL` and update allowed CORS values in the backend.
" 

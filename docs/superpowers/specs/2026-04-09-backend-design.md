# Backend — Sub-project 1 Design Spec
**Date:** 2026-04-09
**Status:** Approved

---

## Overview

Add a Node.js/Express backend to the Ford Tool Search app. The backend runs as a single AWS Lambda function (via `@vendia/serverless-express`) behind API Gateway, stores checkout records in DynamoDB, and serves the tool catalog as static JSON. A single shared JWT credential protects all non-auth routes.

This is Sub-project 1 of 3:
1. **Backend** (this spec) — Express app, DynamoDB, auth, local dev
2. **AWS Infrastructure** — Lambda deploy, API Gateway, S3 + CloudFront
3. **Frontend migration** — replace localStorage with API calls, add login screen

---

## Repository Structure

The backend lives at `backend/` inside the existing repo, as an independent Node package.

```
backend/
├── package.json
├── .env                    # local secrets — not committed
├── .env.example            # committed template, no secrets
├── src/
│   ├── app.js              # Express app: middleware + routers, exported for Lambda and server.js
│   ├── lambda.js           # Lambda handler — wraps app.js with @vendia/serverless-express
│   ├── server.js           # Local dev entry point — app.listen()
│   ├── middleware/
│   │   └── auth.js         # JWT verify middleware, attaches decoded payload to req.user
│   ├── routes/
│   │   ├── auth.js         # POST /auth/login
│   │   ├── tools.js        # GET /tools
│   │   └── checkouts.js    # GET|POST /tools/:id/checkouts, PUT /tools/:id/checkouts/checkin
│   ├── db/
│   │   └── dynamo.js       # DynamoDB DocumentClient + helper functions
│   └── data/
│       └── tools.json      # Full tool catalog (moved from frontend src/db/data.js)
```

---

## Dependencies

```json
{
  "dependencies": {
    "express": "^4",
    "@vendia/serverless-express": "^4",
    "jsonwebtoken": "^9",
    "@aws-sdk/client-dynamodb": "^3",
    "@aws-sdk/lib-dynamodb": "^3",
    "cors": "^2",
    "dotenv": "^16"
  },
  "devDependencies": {
    "nodemon": "^3"
  }
}
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Local dev port | `3001` |
| `JWT_SECRET` | Secret for signing/verifying JWTs | random 32-char string |
| `SHOP_USERNAME` | Shared login username | `parts` |
| `SHOP_PASSWORD` | Shared login password | `secure-password` |
| `DYNAMODB_TABLE` | DynamoDB table name | `tool-checkouts` or `tool-checkouts-dev` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `ALLOWED_ORIGIN` | CORS allowed origin | `http://localhost:5173` or CloudFront URL |

`.env.example` commits all variable names with placeholder values. `.env` is gitignored.

---

## DynamoDB Data Model

**Table name:** `tool-checkouts` (prod) / `tool-checkouts-dev` (local dev)

**Primary key:**
- Partition key: `toolId` (String)
- Sort key: `checkoutDate` (String, ISO 8601)

**Item shape:**
```json
{
  "toolId":       "100-001",
  "checkoutDate": "2026-04-08T14:32:00.000Z",
  "roNumber":     "RO-48291",
  "techName":     "J. Rivera",
  "returnDate":   "2026-04-08T16:00:00.000Z"
}
```

`returnDate` is absent (not set to null) when a tool is currently checked out. A tool is considered checked out if its most recent item (highest `checkoutDate`) has no `returnDate` attribute.

**Access patterns — no GSIs required:**
- History for a tool: `Query` on `toolId`, `ScanIndexForward: false` (newest first)
- Check out: `PutItem` — `checkoutDate` = current ISO timestamp, no `returnDate`
- Check in: Query with `ScanIndexForward: false, Limit: 1` to get the latest record's `checkoutDate`, then `UpdateItem` on that exact `toolId` + `checkoutDate` key, setting `returnDate = now`, with a condition that `returnDate` does not exist
- Is checked out: Query limit 1, `ScanIndexForward: false` — check if `returnDate` is absent

---

## API Routes

Base path: `/api` (API Gateway stage prefix, stripped by the Lambda handler)

### `POST /auth/login`
- **Auth:** none
- **Body:** `{ "username": "...", "password": "..." }`
- **Success 200:** `{ "token": "<JWT>" }` — JWT signed with `JWT_SECRET`, expires `8h`
- **Error 401:** credentials do not match `SHOP_USERNAME` / `SHOP_PASSWORD`

### `GET /tools`
- **Auth:** Bearer JWT required
- **Success 200:** Array of tool objects from `tools.json`
- **Source:** Static JSON file (`tools.json`) — plain JSON array, no DynamoDB hit

### `GET /tools/:id/checkouts`
- **Auth:** Bearer JWT required
- **Success 200:** Array of checkout records for the tool, newest first. Empty array if none.
- **Source:** DynamoDB Query on `toolId = :id`

### `POST /tools/:id/checkouts`
- **Auth:** Bearer JWT required
- **Body:** `{ "roNumber": "...", "techName": "..." }`
- **Action:** Writes a new DynamoDB item with `checkoutDate = now`, no `returnDate`
- **Success 201:** The new checkout record
- **Error 409:** Tool is already checked out (latest record has no `returnDate`)
- **Error 400:** Missing or empty `roNumber` or `techName`

### `PUT /tools/:id/checkouts/checkin`
- **Auth:** Bearer JWT required
- **Action:** Updates the open record for `toolId` — sets `returnDate = now`
- **Success 200:** The updated checkout record
- **Error 409:** Tool is not currently checked out

---

## Auth Middleware (`middleware/auth.js`)

- Reads `Authorization` header, expects `Bearer <token>`
- Verifies with `jsonwebtoken.verify(token, process.env.JWT_SECRET)`
- On success: calls `next()`
- On failure (missing, malformed, expired): responds `401 { error: "Unauthorized" }`
- Applied to all routes except `POST /auth/login`

---

## `db/dynamo.js` — Helper Functions

```js
getHistory(toolId)          // → array of records, newest first
getCurrentCheckout(toolId)  // → record object if checked out, null otherwise
checkOut(toolId, { roNumber, techName })  // → new record
checkIn(toolId)             // → updated record, throws if not checked out
```

All functions use `DynamoDBDocumentClient` from `@aws-sdk/lib-dynamodb`. The client is initialized once at module load with `AWS_REGION` from env.

---

## CORS

Configured in `app.js` using the `cors` package:
- `origin`: value of `ALLOWED_ORIGIN` env var
- `methods`: `GET, POST, PUT`
- `allowedHeaders`: `Content-Type, Authorization`

Locally: `ALLOWED_ORIGIN=http://localhost:5173`
Production: `ALLOWED_ORIGIN=https://<cloudfront-id>.cloudfront.net`

---

## Local Dev

```bash
cd backend
cp .env.example .env    # fill in values
npm install
npm run dev             # nodemon src/server.js — restarts on change
```

The Vite frontend proxies `/api` → `http://localhost:3001/api` to avoid CORS during local development. This proxy config is added to `vite.config.js`.

AWS credentials for DynamoDB come from `~/.aws/credentials` (default profile). A `tool-checkouts-dev` DynamoDB table must exist in the AWS account before local dev.

---

## Error Handling

All routes return JSON errors in the shape `{ "error": "<message>" }`.

| Status | Meaning |
|---|---|
| 400 | Missing or invalid request body |
| 401 | Missing, invalid, or expired JWT |
| 404 | Tool ID not found (future use) |
| 409 | Checkout conflict (already out / not out) |
| 500 | Unexpected server error |

---

## Out of Scope (this sub-project)

- AWS Lambda packaging and deployment
- API Gateway configuration
- DynamoDB table provisioning in AWS
- S3 / CloudFront setup
- Frontend changes (login screen, API calls, removing localStorage)

These are covered in Sub-projects 2 and 3.

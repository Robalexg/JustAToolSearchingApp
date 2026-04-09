# AWS Infrastructure — Sub-project 2 Design Spec

**Date:** 2026-04-09
**Status:** Approved

---

## Overview

Deploy the Node.js/Express backend as an AWS Lambda function behind API Gateway, host the React frontend on S3 + CloudFront, and automate both deployments via GitHub Actions on push to `main`. No custom domain for now.

This is Sub-project 2 of 3:
1. **Backend** — Express app, DynamoDB, auth, local dev ✅
2. **AWS Infrastructure** (this spec) — Lambda deploy, API Gateway, S3 + CloudFront, CI/CD
3. **Frontend migration** — replace localStorage with API calls, add login screen

---

## Architecture

```
GitHub (main branch)
    └─► GitHub Actions (OIDC → AWS IAM role)
            ├── deploy-backend job → zip → aws lambda update-function-code
            └── deploy-frontend job → npm run build → s3 sync → CloudFront invalidation

Browser
    ├── https://<cloudfront-url>  → CloudFront → S3 (React app)
    └── https://<apigw-url>/api   → API Gateway HTTP API → Lambda → DynamoDB
```

---

## Approach

Shell scripts + AWS CLI. No IaC framework (CDK, SAM, Terraform) — the infrastructure is simple enough that transparent shell scripts are the right call. All AWS resources are created once manually; ongoing deploys are fully automated.

GitHub Actions uses OIDC to authenticate with AWS — no long-lived credentials stored as secrets.

---

## One-Time AWS Setup (Manual)

These steps are performed once by the developer. After this, all deploys are automatic.

### 1. Lambda Function

- **Name:** `toolsearch-backend`
- **Runtime:** Node.js 20.x
- **Handler:** `backend/src/lambda.handler` (zip includes `backend/` prefix)
- **Execution role:** New role with `AmazonDynamoDBFullAccess` (or scoped inline policy limited to the checkout table)
- **Environment variables:**

| Variable | Value |
|---|---|
| `JWT_SECRET` | Random 32+ char string |
| `SHOP_USERNAME` | `parts` (or your username) |
| `SHOP_PASSWORD` | Secure password |
| `DYNAMODB_TABLE` | Your table name (e.g. `tool-checkouts`) |
| `AWS_REGION` | e.g. `us-east-1` |
| `ALLOWED_ORIGIN` | CloudFront URL (set after CloudFront is created) |

### 2. API Gateway

- **Type:** HTTP API (v2)
- **Integration:** Lambda proxy integration → `toolsearch-backend`
- **Route:** `$default` (catches all paths and methods)
- Result: URL like `https://abc123.execute-api.us-east-1.amazonaws.com`

### 3. S3 Bucket

- **Access:** Private — block all public access
- CloudFront serves the content via OAC; S3 is never accessed directly by browsers

### 4. CloudFront Distribution

- **Origin:** S3 bucket via Origin Access Control (OAC)
- **Default root object:** `index.html`
- **Custom error response:** 404 → `/index.html`, HTTP 200 — required for React SPA client-side routing
- Result: URL like `https://xyz.cloudfront.net`

After creating CloudFront, update the Lambda `ALLOWED_ORIGIN` env var to this URL.

### 5. OIDC Identity Provider (GitHub)

In IAM → Identity providers, add:
- **Provider URL:** `https://token.actions.githubusercontent.com`
- **Audience:** `sts.amazonaws.com`

### 6. GitHub Actions IAM Role

- **Trust policy:** GitHub OIDC provider, scoped to `repo:robalexg/JustAToolSearchingApp:ref:refs/heads/main`
- **Permissions (inline policy):**
  - `lambda:UpdateFunctionCode`
  - `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`
  - `cloudfront:CreateInvalidation`

### 7. GitHub Secrets

Set in repo Settings → Secrets → Actions:

| Secret | Description |
|---|---|
| `AWS_ROLE_ARN` | ARN of the GitHub Actions IAM role |
| `AWS_REGION` | e.g. `us-east-1` |
| `LAMBDA_FUNCTION_NAME` | `toolsearch-backend` |
| `S3_BUCKET_NAME` | Name of the S3 bucket |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |

Lambda env vars (`JWT_SECRET`, `SHOP_PASSWORD`, etc.) are set directly on the Lambda function in the console — not needed as GitHub secrets since the deploy scripts only call `update-function-code`, not `update-function-configuration`.

---

## Files

| Action | Path | Purpose |
|---|---|---|
| Create | `scripts/deploy-backend.sh` | Zip and deploy Lambda |
| Create | `scripts/deploy-frontend.sh` | Build and sync frontend to S3 |
| Create | `.github/workflows/deploy.yml` | GitHub Actions CI/CD workflow |

---

## Deploy Scripts

### `scripts/deploy-backend.sh`

1. `cd backend && npm ci --omit=dev` — production deps only
2. Zip `backend/src`, `backend/package.json`, `backend/node_modules` (exclude `.env`, `.gitignore`, `*.md`)
3. `aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --zip-file fileb://lambda.zip`
4. Remove zip

Both scripts read env vars (`LAMBDA_FUNCTION_NAME`, `S3_BUCKET_NAME`, etc.) so they work locally and in CI.

### `scripts/deploy-frontend.sh`

1. `npm install && npm run build` — Vite builds to `dist/`
2. `aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete`
3. `aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"`

---

## GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

- **Trigger:** push to `main`
- **Permissions:** `id-token: write`, `contents: read` (OIDC requirement)
- **Jobs:** `deploy-backend` and `deploy-frontend` run in parallel
- **Auth:** `aws-actions/configure-aws-credentials@v4` with `role-to-assume: ${{ secrets.AWS_ROLE_ARN }}`
- **Node:** `actions/setup-node@v4` with Node.js 20

---

## Verification

After the one-time setup and a push to `main`:

1. GitHub Actions → both jobs green
2. Lambda console → "Last modified" timestamp updated
3. CloudFront URL → React app loads in browser
4. `curl https://<apigw-url>/api/auth/login` with credentials → returns JWT
5. `curl https://<apigw-url>/api/tools` (no token) → HTTP 401

---

## Out of Scope (this sub-project)

- Custom domain / SSL certificate (add later via CloudFront + Route 53)
- `VITE_API_BASE_URL` in frontend build (covered in Sub-project 3)
- Lambda memory/timeout tuning
- CloudWatch alarms / monitoring

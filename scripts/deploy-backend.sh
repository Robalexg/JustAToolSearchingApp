#!/usr/bin/env bash
set -euo pipefail

echo "Installing production dependencies..."
cd backend
npm ci --omit=dev
cd ..

echo "Packaging Lambda..."
zip -r lambda.zip backend/src backend/package.json backend/node_modules \
  --exclude "*/.env" \
  --exclude "*/.gitignore" \
  --exclude "*.md"

echo "Deploying Lambda..."
aws lambda update-function-code \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --zip-file fileb://lambda.zip \
  --region "$AWS_REGION"

rm lambda.zip
echo "Backend deployed."

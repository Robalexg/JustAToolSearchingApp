#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Syncing to S3..."
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" --delete --region "$AWS_REGION"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"

echo "Frontend deployed."

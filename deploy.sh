#!/bin/bash
set -e

# Terraform output에서 값 읽기
BUCKET_NAME=$(terraform -chdir=terraform output -raw s3_bucket_name)
DISTRIBUTION_ID=$(terraform -chdir=terraform output -raw cloudfront_distribution_id)

echo "==> Building..."
npm run build

echo "==> Uploading to S3: $BUCKET_NAME"
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "==> Invalidating CloudFront cache: $DISTRIBUTION_ID"
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "==> Done!"

#!/bin/bash
set -e

if [ -f .env.production ]; then
  set -a
  . ./.env.production
  set +a
fi

# Terraform output에서 값 읽기
BUCKET_NAME=$(terraform -chdir=terraform output -raw s3_bucket_name)
DISTRIBUTION_ID=$(terraform -chdir=terraform output -raw cloudfront_distribution_id)

echo "==> Building..."
echo "    VITE_API_URL=${VITE_API_URL:-/api}"
echo "    VITE_AUTH_LOGIN_PATH=${VITE_AUTH_LOGIN_PATH:-/oauth2/authorization/keycloak}"
echo "    VITE_AUTH_LOGOUT_PATH=${VITE_AUTH_LOGOUT_PATH:-/logout}"
npm run build

echo "==> Uploading to S3: $BUCKET_NAME"
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "==> Invalidating CloudFront cache: $DISTRIBUTION_ID"
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "==> Done!"

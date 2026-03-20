output "s3_bucket_name" {
  description = "S3 버킷 이름"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront 배포 ID (캐시 무효화 시 사용)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront 도메인 주소"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "프로젝트 이름 (S3 버킷 이름에 사용)"
  type        = string
  default     = "donmoa-frontend-business"
}

variable "environment" {
  description = "배포 환경 (dev, prod 등)"
  type        = string
  default     = "dev"
}

variable "gateway_origin_domain_name" {
  description = "Business gateway ALB domain name used by CloudFront for API and auth proxy paths"
  type        = string
  default     = "k8s-donmoadevbusiness-67ac2b4a2a-1835686106.ap-northeast-2.elb.amazonaws.com"
}

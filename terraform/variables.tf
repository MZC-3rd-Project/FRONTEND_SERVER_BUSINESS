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

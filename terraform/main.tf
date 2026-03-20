terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront는 us-east-1의 ACM 인증서만 지원
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

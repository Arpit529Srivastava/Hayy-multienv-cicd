output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.hayy_cluster.name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.hayy_cluster.endpoint
}

output "cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = aws_eks_cluster.hayy_cluster.vpc_config[0].cluster_security_group_id
}

output "cluster_oidc_issuer_url" {
  description = "EKS cluster OIDC issuer URL"
  value       = aws_eks_cluster.hayy_cluster.identity[0].oidc[0].issuer
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.hayy_vpc.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "fargate_profile_arns" {
  description = "Fargate profile ARNs"
  value = {
    staging    = aws_eks_fargate_profile.staging.arn
    production = aws_eks_fargate_profile.production.arn
  }
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.hayy_cluster.certificate_authority[0].data
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = aws_eks_cluster.hayy_cluster.arn
}

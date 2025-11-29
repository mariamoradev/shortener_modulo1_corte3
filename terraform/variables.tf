variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "dynamodb_table_name" {
  type = string
  description = "Nombre de la tabla DynamoDB compartida (p.ej. urls-table)"
}

variable "short_base_url" {
  type = string
  description = "URL base para links cortos, ej: https://miweb.com"
}

variable "lambda_function_name" {
  type = string
  default = "shortener-lambda"
}

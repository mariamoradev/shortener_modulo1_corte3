output "lambda_function_name" {
  value = aws_lambda_function.shortener_lambda.function_name
}

output "api_invoke_url" {
  description = "URL base de la API"
  value       = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/prod"
}

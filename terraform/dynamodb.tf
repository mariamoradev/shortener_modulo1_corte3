resource "aws_dynamodb_table" "urls_table" {
  name         = var.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "code"

  attribute {
    name = "code"
    type = "S"
  }

  tags = {
    Name        = var.dynamodb_table_name
    Environment = "prod"
    Project     = "url-shortener"
  }
}

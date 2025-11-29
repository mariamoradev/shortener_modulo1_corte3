const crypto = require("crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const TABLE = process.env.DYNAMODB_TABLE;
const SHORT_BASE = process.env.SHORT_BASE_URL;

const CODE_LENGTH = 6;
const MAX_RETRIES = 10;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json",
};

function base62Encode(buffer) {
  const ALPH = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let num = BigInt("0x" + buffer.toString("hex"));
  let s = "";
  while (s.length < CODE_LENGTH) {
    s += ALPH[Number(num % BigInt(ALPH.length))];
    num = num / BigInt(ALPH.length);
  }
  return s.slice(0, CODE_LENGTH);
}

function isValidHttpUrl(string) {
  try {
    let u = new URL(string);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_) {
    return false;
  }
}

exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight OK" }),
    };
  }

  if (event.httpMethod === "GET" && event.pathParameters?.code) {
    const code = event.pathParameters.code;

    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLE,
        Key: { code },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Short code not found" }),
      };
    }

    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { code },
        UpdateExpression: "SET hits = hits + :inc",
        ExpressionAttributeValues: { ":inc": 1 },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        code,
        long_url: result.Item.long_url,
        hits: result.Item.hits + 1,
      }),
    };
  }

  if (event.httpMethod === "POST") {
    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch (_) {}

    const longUrl = body.url || body.long_url;

    if (!longUrl || !isValidHttpUrl(longUrl)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Invalid or missing url. Send JSON { "url": "https://..." }',
        }),
      };
    }

    let attempt = 0;
    let code;

    while (attempt < MAX_RETRIES) {
      const randomBytes = crypto.randomBytes(6);
      code = base62Encode(randomBytes);

      const getResp = await dynamo.send(
        new GetCommand({
          TableName: TABLE,
          Key: { code },
        })
      );

      if (!getResp.Item) break;
      attempt++;
    }

    if (attempt >= MAX_RETRIES) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: "Could not generate a unique code, try again.",
        }),
      };
    }

    const item = {
      code,
      long_url: longUrl,
      created_at: new Date().toISOString(),
      hits: 0,
    };

    await dynamo.send(
      new PutCommand({
        TableName: TABLE,
        Item: item,
        ConditionExpression: "attribute_not_exists(code)",
      })
    );

    const baseClean = SHORT_BASE.replace(/\/+$/, "");
    const shortUrl = `${baseClean}/${code}`;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        code,
        short_url: shortUrl,
        long_url: longUrl,
      }),
    };
  }

  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ message: "Unsupported method" }),
  };
};

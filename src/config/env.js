import dotenv from "dotenv";

dotenv.config();

function required(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}`
    );
  }

  return value;
}

export const env = {
  NODE_ENV:
    process.env.NODE_ENV || "development",

  PORT:
    Number(process.env.PORT) || 5000,

  RATE_LIMIT_MAX:
    Number(process.env.RATE_LIMIT_MAX) || 100,

  API_PREFIX:
    process.env.API_PREFIX || "/api",

  LOG_LEVEL:
    process.env.LOG_LEVEL || "info",

  MONGO_URI:
    required("MONGO_URI"),

  MONGO_DB_NAME:
    process.env.MONGO_DB_NAME ||
    "vehicle_intelligence",

  REDIS_URL:
    required("REDIS_URL"),

  AI_API_KEY:
    required("AI_API_KEY"),

  AI_PROVIDER:
    process.env.AI_PROVIDER || "mistral",

  AI_MODEL:
    process.env.AI_MODEL || "claude-opus-4-5",
  
};
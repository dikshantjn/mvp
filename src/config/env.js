const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

let cachedConfig = null;

function loadEnv() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config();
  }

  const required = [
    "PORT",
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "REFRESH_TOKEN_TTL",
    "STORAGE_PROVIDER",
    "UPLOAD_DIR"
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  cachedConfig = {
    PORT: Number(process.env.PORT),
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    UPLOAD_DIR: process.env.UPLOAD_DIR
  };

  return cachedConfig;
}

module.exports = {
  loadEnv,
  get PORT() {
    return loadEnv().PORT;
  },
  get DATABASE_URL() {
    return loadEnv().DATABASE_URL;
  },
  get JWT_ACCESS_SECRET() {
    return loadEnv().JWT_ACCESS_SECRET;
  },
  get REFRESH_TOKEN_TTL() {
    return loadEnv().REFRESH_TOKEN_TTL;
  },
  get STORAGE_PROVIDER() {
    return loadEnv().STORAGE_PROVIDER;
  },
  get UPLOAD_DIR() {
    return loadEnv().UPLOAD_DIR;
  }
};

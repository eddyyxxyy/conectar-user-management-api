import { registerAs } from "@nestjs/config";
import { DataSourceOptions } from "typeorm";

export default registerAs("database", (): DataSourceOptions => ({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  uuidExtension: "pgcrypto",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development" ? ["query", "error"] : false,
}));
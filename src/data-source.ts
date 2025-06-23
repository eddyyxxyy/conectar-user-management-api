import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { join } from "path";

dotenv.config();

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [join(process.cwd(), "src", "**", "*.entity.{ts,js}")],
  migrations: [join(process.cwd(), "src", "migrations", "*.{ts,js}")],
  uuidExtension: "pgcrypto",
  synchronize: false,
});
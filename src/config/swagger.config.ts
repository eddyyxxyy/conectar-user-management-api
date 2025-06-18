import { registerAs } from "@nestjs/config";

export default registerAs("swagger", () => ({
  title: process.env.SWAGGER_TITLE ?? "Conéctar - User Management API",
  description: process.env.SWAGGER_DESCRIPTION ?? "API for managing user accounts in Conéctar",
  version: process.env.SWAGGER_VERSION ?? "0.0.1",
}));
import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService, ConfigType } from "@nestjs/config";
import swaggerConfig from "./swagger.config";
import expressBasicAuth from "express-basic-auth";

const SWAGGER_PATH = "/api";

const setupSwagger = (app: INestApplication ): void => {
  const configService = app.get<ConfigService>(ConfigService);

  const swaggerPassword = configService.get<string>("SWAGGER_PASSWORD");

  if (configService.get("NODE_ENV") === "production") {
    app.use(
      [SWAGGER_PATH, `/${SWAGGER_PATH}-json`],
      expressBasicAuth({
        challenge: true,
        users: {
          admin: swaggerPassword!,
        },
      }),
    );
  }

  const swagger = app.get<ConfigType<typeof swaggerConfig>>(swaggerConfig.KEY);

  const config = new DocumentBuilder()
    .setTitle(swagger.title)
    .setDescription(swagger.description)
    .setVersion(swagger.version)
    .build();

  SwaggerModule.setup("api", app, SwaggerModule.createDocument(app, config));
};

export { setupSwagger };
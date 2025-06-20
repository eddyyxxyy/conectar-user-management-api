import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigType } from "@nestjs/config";
import swaggerConfig from "./swagger.config";

const setupSwagger = (app: INestApplication ): void => {
  const swagger = app.get<ConfigType<typeof swaggerConfig>>(swaggerConfig.KEY);

  const config = new DocumentBuilder()
    .setTitle(swagger.title)
    .setDescription(swagger.description)
    .setVersion(swagger.version)
    .build();

  SwaggerModule.setup("api", app, SwaggerModule.createDocument(app, config));
};

export { setupSwagger };
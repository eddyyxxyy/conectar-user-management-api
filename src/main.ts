import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app/app.module";
import swaggerConfig from "./config/swagger.config";
import { ConfigService, ConfigType } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swagger = app.get<ConfigType<typeof swaggerConfig>>(swaggerConfig.KEY);

  const config = new DocumentBuilder()
    .setTitle(swagger.title)
    .setDescription(swagger.description)
    .setVersion(swagger.version)
    .build();

  SwaggerModule.setup("api", app, SwaggerModule.createDocument(app, config));

  const configService = app.get(ConfigService);

  await app.listen(configService.get<number>("APP_PORT", 3000));
}

void bootstrap();

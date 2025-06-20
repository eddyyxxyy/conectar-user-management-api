import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app/app.module";
import { setupSwagger } from "./config/setup-swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  const configService = app.get(ConfigService);

  await app.listen(configService.get<number>("APP_PORT", 3000));
}

void bootstrap();

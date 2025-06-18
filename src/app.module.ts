import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import swaggerConfig from "./config/swagger.config";
import { envValidationOptions, envValidationSchema } from "./config/env.validation";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [swaggerConfig],
      validationSchema: envValidationSchema,
      validationOptions: envValidationOptions,
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
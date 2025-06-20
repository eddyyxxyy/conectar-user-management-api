import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "../core/core.module";
import swaggerConfig from "../config/swagger.config";
import databaseConfig from "../config/database.config";
import { envValidationOptions, envValidationSchema } from "../config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [swaggerConfig, databaseConfig],
      validationSchema: envValidationSchema,
      validationOptions: envValidationOptions,
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env"],
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    CoreModule,
  ],
})
export class AppModule {}
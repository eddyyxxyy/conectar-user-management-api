import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "../core/core.module";
import swaggerConfig from "../config/swagger.config";
import databaseConfig from "../config/database.config";
import { envValidationOptions, envValidationSchema } from "../config/env.validation";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";

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
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
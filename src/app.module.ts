import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import swaggerConfig from "./config/swagger.config";
import databaseConfig from "./config/database.config";
import { envValidationOptions, envValidationSchema } from "./config/env.validation";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => ({
        ...dbConfig,
        autoLoadEntities: true,
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
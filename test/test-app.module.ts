import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../src/app/user/user.module";
import { User } from "../src/entities/user.entity";
import { AuthModule } from "../src/app/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: ":memory:",
      entities: [User],
      synchronize: true,
    }),
    JwtModule.register({
      secret: "test-secret",
      signOptions: { expiresIn: "1h" },
    }),
    ConfigModule.forRoot({
      envFilePath: ".env.test",
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
  ],
})
export class TestAppModule {}
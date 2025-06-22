import {
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import * as argon2 from "argon2";
import { UserService } from "../user/user.service";
import { AuthJwtPayload } from "./types/auth-jwt-payload";
import refreshJwtConfig from "../../config/refresh-jwt.config";
import { ConfigType } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";
import type { CurrentUser } from "./types/current-user";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findWithPasswordByEmail(email);

    if (!user.password) {
      throw new UnauthorizedException("Account is linked to a social login.");
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException("Invalid password.");
    }

    return { id: user.id };
  }

  async login(id: string) {
    const { accessToken, refreshToken } = await this.generateTokens(id);

    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.userRepository.update(
      { id },
      {
        lastLogin: () => "CURRENT_TIMESTAMP",
        refreshToken: hashedRefreshToken,
      },
    );

    return { id, accessToken, refreshToken };
  }

  async refreshToken(id: string) {
    const { accessToken, refreshToken } = await this.generateTokens(id);

    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.userRepository.update(
      { id },
      {
        refreshToken: hashedRefreshToken,
      },
    );

    return { id, accessToken, refreshToken };
  }

  async validateRefreshToken(id: string, refreshToken?: string) {
    const user = await this.userService.findOne(id);

    if (!user.refreshToken || !refreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken, refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return { id };
  }

  async generateTokens(id: string) {
    const payload: AuthJwtPayload = { sub: id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        payload, this.refreshTokenConfig,
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(id: string) {
    await this.userRepository.update(
      { id },
      {
        refreshToken: undefined,
      },
    );
  }

  async validateJwtUser(id: string) {
    const user = await this.userService.findOne(id);

    const currentUser: CurrentUser = { id, role: user.role };

    return currentUser;
  }
}

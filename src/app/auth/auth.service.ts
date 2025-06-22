import {
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { UserService } from "../user/user.service";
import { AuthJwtPayload } from "./types/auth-jwt-payload";
import refreshJwtConfig from "../../config/refresh-jwt.config";
import { ConfigType } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";

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
    const payload: AuthJwtPayload = { sub: id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      payload, this.refreshTokenConfig,
    );

    await this.userRepository.update({ id }, { lastLogin: () => "CURRENT_TIMESTAMP" });

    return { accessToken, refreshToken };
  }

  async refreshToken(id: string) {
    const payload: AuthJwtPayload = { sub: id };
    const accessToken = await this.jwtService.signAsync(payload);

    return { id, accessToken };
  }
}

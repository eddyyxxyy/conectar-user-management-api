import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { UserService } from "../user/user.service";
import { AuthJwtPayload } from "./types/auth-jwt-payload";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

    return await this.jwtService.signAsync(payload);
  }
}

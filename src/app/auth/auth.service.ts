import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { compare } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

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
}

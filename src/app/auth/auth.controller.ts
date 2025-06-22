import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() { email, password }: LoginDto) {
    const { id } = await this.authService.validateUser(email, password);
    const token = await this.authService.login(id);

    return { accessToken: token };
  }
}

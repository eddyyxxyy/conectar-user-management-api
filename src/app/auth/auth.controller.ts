import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { ApiBody, ApiOperation } from "@nestjs/swagger";
import { ApiAuthLoginResponses } from "../../common/decorators/api-auth-login-response.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login with user credentials (e-mail & password)",
  })
  @ApiBody({ type: LoginDto, required: true })
  @ApiAuthLoginResponses()
  async login(@Body() { email, password }: LoginDto) {
    const { id } = await this.authService.validateUser(email, password);

    return await this.authService.login(id);
  }
}

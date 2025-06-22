import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { RefreshJwtAuthGuard } from "./guards/refresh-jwt-auth/refresh-jwt-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";
import type { RequestWithUser } from "./types/request-with-user";
import { ApiAuthLoginResponses } from "../../common/decorators/api-auth-login-response.decorator";
import { ApiAuthLogoutResponses } from "../../common/decorators/api-auth-logout-response.decorator";
import { ApiAuthRefreshTokenResponses } from "../../common/decorators/api-auth-refresh-token-response.decorator";

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

  @Post("refresh")
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("JWT Refresh Token")
  @ApiOperation({
    summary: "Refreshes user access and refresh tokens",
  })
  @ApiAuthRefreshTokenResponses()
  async refreshToken(@Request() req: RequestWithUser) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("JWT Authentication")
  @ApiAuthLogoutResponses()
  async logout(@Request() req: RequestWithUser) {
    await this.authService.logout(req.user.id);
  }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Response, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { RefreshJwtAuthGuard } from "./guards/refresh-jwt-auth/refresh-jwt-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";
import type { RequestWithUser } from "./types/request-with-user";
import { ApiAuthLoginResponses } from "../../common/decorators/api-auth-login-response.decorator";
import { ApiAuthLogoutResponses } from "../../common/decorators/api-auth-logout-response.decorator";
import { ApiAuthRefreshTokenResponses } from "../../common/decorators/api-auth-refresh-token-response.decorator";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { Response as ExpressResponse } from "express";
import { UserRole } from "../../enums/user-role.enum";
import { ConfigService } from "@nestjs/config";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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

  @Get("google/login")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: "Authenticate with Google OAuth (protected by GoogleAuthGuard, cannot be tested via Swagger UI)",
    description: "This endpoint redirects to Google for authentication. It is protected by GoogleAuthGuard and cannot be tested directly via Swagger UI.",
  })
  @ApiResponse({
    status: 302,
    description: "Redirect to Google or frontend with tokens",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  googleLogin() {
    return;
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: "Authenticate with Google OAuth (protected by GoogleAuthGuard, cannot be tested via Swagger UI)",
    description: "This endpoint redirects to Google for authentication. It is protected by GoogleAuthGuard and cannot be tested directly via Swagger UI.",
  })
  @ApiResponse({
    status: 302,
    description: "Redirect to Google or frontend with tokens",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async googleCallback(
    @Request() req: RequestWithUser,
    @Response() res: ExpressResponse,
  ) {
    const response = await this.authService.login(req.user.id);
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");

    if (req.user.role === UserRole.ADMIN) {
      return res.redirect(
        302,
        `${frontendUrl}/users?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`,
      );
    }

    return res.redirect(
      302,
      `${frontendUrl}/profile?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`,
    );
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
  @ApiOperation({
    summary: "Logs out user and revokes refresh token",
  })
  @ApiAuthLogoutResponses()
  async logout(@Request() req: RequestWithUser) {
    await this.authService.logout(req.user.id);
  }
}

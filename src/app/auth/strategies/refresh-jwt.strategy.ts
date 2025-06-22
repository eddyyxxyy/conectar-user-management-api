import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJwtPayload } from "../types/auth-jwt-payload";
import { Inject, Injectable } from "@nestjs/common";
import refreshJwtConfig from "../../../config/refresh-jwt.config";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshJwtConfiguration.secret!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: AuthJwtPayload) {
    const refreshToken = request
      .get("Authorization")?.replace("Bearer", "").trim();

    const userid = payload.sub;

    return this.authService.validateRefreshToken(userid, refreshToken);
  }
}

import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { UserService } from "../../../app/user/user.service";
import googleOathConfig from "../../../config/google-oath.config";
import { CreateOrFindSocialUserDto } from "src/app/user/dtos/create-or-find-social-user.dto";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOathConfig.KEY)
    private readonly googleConfiguration: ConfigType<typeof googleOathConfig>,
    private readonly userService: UserService,
  ) {
    super({
      clientID: googleConfiguration.clientId!,
      clientSecret: googleConfiguration.clientSecret!,
      callbackURL: googleConfiguration.callbackUrl!,
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails } = profile;
    const email = emails?.[0]?.value;

    const user = await this.userService.createOrFindSocialUser({
      provider: "google",
      providerId: id,
      name: displayName,
      email,
    } as CreateOrFindSocialUserDto);

    done(null, user);
  }
}
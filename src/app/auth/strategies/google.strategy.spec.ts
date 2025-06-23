/* eslint-disable @typescript-eslint/unbound-method */
import { GoogleStrategy } from "./google.strategy";
import { UserService } from "../../user/user.service";
import { Profile } from "passport-google-oauth20";

describe("GoogleStrategy", () => {
  let strategy: GoogleStrategy;
  let userService: UserService;

  beforeEach(() => {
    const userServiceMock: Partial<UserService> = {
      createOrFindSocialUser: jest.fn().mockResolvedValue({ id: "user-id" }),
    };
    userService = userServiceMock as UserService;
    strategy = new GoogleStrategy(
      {
        clientId: "id",
        clientSecret: "secret",
        callbackUrl: "url",
        frontendUrl: "url",
      },
      userService,
    );
  });

  it("should call userService.createOrFindSocialUser and call done", async () => {
    const done = jest.fn();
    const profile: Profile = {
      id: "google-id",
      displayName: "Test User",
      emails: [{ value: "test@email.com", verified: true }],
      provider: "google",
      _json: {},
      _raw: "",
    } as Profile;
    await strategy.validate("access", "refresh", profile, done);
    expect(userService.createOrFindSocialUser).toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith(null, { id: "user-id" });
  });
});
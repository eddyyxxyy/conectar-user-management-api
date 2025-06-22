import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { ConfigType } from "@nestjs/config";
import refreshJwtConfig from "../../config/refresh-jwt.config";

describe("AuthService", () => {
  let authService: AuthService;

  // Mocks tipados
  let userService: {
    findWithPasswordByEmail: jest.Mock;
  };

  let jwtService: {
    signAsync: jest.Mock;
  };

  let userRepository: {
    update: jest.Mock;
  };

  // Você pode usar qualquer valor estático aqui
  let refreshTokenConfig: ConfigType<typeof refreshJwtConfig>;

  beforeEach(() => {
    userService = {
      findWithPasswordByEmail: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    userRepository = {
      update: jest.fn(),
    };

    refreshTokenConfig = {
      secret: "refresh-secret",
      expiresIn: "7d",
    };

    authService = new AuthService(
      userService as any,
      jwtService as any,
      userRepository as unknown as Repository<User>,
      refreshTokenConfig,
    );
  });

  it("should throw if user password is missing (social login)", async () => {
    userService.findWithPasswordByEmail.mockResolvedValue({ id: "id1", password: null });

    await expect(authService.validateUser("email", "pass")).rejects.toThrow(UnauthorizedException);
  });

  it("should throw if password does not match", async () => {
    userService.findWithPasswordByEmail.mockResolvedValue({ id: "id1", password: "hashedPass" });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

    await expect(authService.validateUser("email", "wrongpass")).rejects.toThrow(UnauthorizedException);
  });

  it("should return user id if password matches", async () => {
    userService.findWithPasswordByEmail.mockResolvedValue({ id: "id1", password: "hashedPass" });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    const result = await authService.validateUser("email", "rightpass");
    expect(result).toEqual({ id: "id1" });
  });

  it("should return JWT token on login and update lastLogin", async () => {
    jwtService.signAsync.mockResolvedValueOnce("accessToken").mockResolvedValueOnce("refreshToken");

    const result = await authService.login("id1");

    expect(result).toEqual({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });
  });

  it("should generate new access token on refreshToken", async () => {
    jwtService.signAsync.mockResolvedValue("newAccessToken");

    const result = await authService.refreshToken("id1");

    expect(result).toEqual({
      id: "id1",
      accessToken: "newAccessToken",
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: "id1" });
  });
});

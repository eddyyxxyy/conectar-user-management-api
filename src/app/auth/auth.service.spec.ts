import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let authService: AuthService;

  // Tipagem clara para os mocks
  let userService: {
    findWithPasswordByEmail: jest.Mock;
  };

  let jwtService: {
    signAsync: jest.Mock;
  };

  beforeEach(() => {
    userService = {
      findWithPasswordByEmail: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    authService = new AuthService(userService as any, jwtService as any);
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

  it("should return JWT token on login", async () => {
    jwtService.signAsync.mockResolvedValue("token");

    const token = await authService.login("id1");
    expect(token).toBe("token");
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: "id1" });
  });
});

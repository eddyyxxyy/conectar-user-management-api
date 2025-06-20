import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";
import { ConflictException } from "@nestjs/common";

describe("UserService", () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  describe("create", () => {
    it("should create a user if email does not exist", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockReturnValue({ id: 1, email: "a@a.com" });
      (userRepository.save as jest.Mock).mockResolvedValue({ id: 1, email: "a@a.com" });

      const result = await service.create({ name: "A", email: "a@a.com", password: "StrongP@ssw0rd!" });
      expect(result).toEqual({ id: 1 });
    });

    it("should throw ConflictException if email exists", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, email: "a@a.com" });
      await expect(
        service.create({ name: "A", email: "a@a.com", password: "StrongP@ssw0rd!" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("createOrFindSocialUser", () => {
    it("should return existing social user", async () => {
      (userRepository.findOne as jest.Mock)
        .mockResolvedValueOnce({ id: 2, provider: "google", providerId: "123" });
      const result = await service.createOrFindSocialUser({
        name: "B", email: "b@b.com", provider: "google", providerId: "123",
      });
      expect(result).toEqual({ id: 2 });
    });

    it("should throw ConflictException if email exists with another method", async () => {
      (userRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 3, email: "b@b.com" });
      await expect(
        service.createOrFindSocialUser({
          name: "B", email: "b@b.com", provider: "google", providerId: "123",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should create new social user if not exists", async () => {
      (userRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (userRepository.create as jest.Mock).mockReturnValue({ id: 4 });
      (userRepository.save as jest.Mock).mockResolvedValue({ id: 4 });
      const result = await service.createOrFindSocialUser({
        name: "C", email: "c@c.com", provider: "google", providerId: "456",
      });
      expect(result).toEqual({ id: 4 });
    });
  });
});

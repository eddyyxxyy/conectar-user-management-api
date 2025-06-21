/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { User } from "../../entities/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ConflictException } from "@nestjs/common";
import { FindAllUsersQueryDto } from "./dtos/find-all-users.query.dto";
import { UserRole } from "../../enums/user-role.enum";

describe("UserService", () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let queryBuilderMock: jest.Mocked<Partial<SelectQueryBuilder<User>>>;

  beforeEach(async () => {
    queryBuilderMock = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => queryBuilderMock),
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
      (userRepository.create as jest.Mock).mockReturnValue({ id: 1, email: "a@a.com" });
      (userRepository.save as jest.Mock).mockResolvedValue({ id: 1, email: "a@a.com" });
      await expect(
        service.create({ name: "A", email: "a@a.com", password: "StrongP@ssw0rd!" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("createOrFindSocialUser", () => {
    it("should return existing social user", async () => {
      (userRepository.findOne as jest.Mock)
        .mockResolvedValueOnce({ id: 2, provider: "google", providerId: "123" });
      (userRepository.create as jest.Mock).mockReturnValue({ id: 2, provider: "google", providerId: "123" });
      (userRepository.save as jest.Mock).mockResolvedValue({ id: 2, provider: "google", providerId: "123" });
      const result = await service.createOrFindSocialUser({
        name: "B", email: "b@b.com", provider: "google", providerId: "123",
      });
      expect(result).toEqual({ id: 2 });
    });

    it("should throw ConflictException if email exists with another method", async () => {
      (userRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 3, email: "b@b.com" });
      (userRepository.create as jest.Mock).mockReturnValue({ id: 3, email: "b@b.com" });
      (userRepository.save as jest.Mock).mockResolvedValue({ id: 3, email: "b@b.com" });
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

  describe("findAll", () => {
    it("should return users and its count correctly", async () => {
      const users: User[] = [
        { id: "1", name: "A", email: "a@a.com", role: UserRole.USER } as User,
        { id: "2", name: "B", email: "b@b.com", role: UserRole.ADMIN } as User,
      ];
      (queryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue([users, 2]);
      (userRepository.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilderMock);

      const query: FindAllUsersQueryDto = {
        page: 1,
        limit: 10,
        role: UserRole.USER,
        sortBy: "name",
        order: "asc",
      };
      const result = await service.findAll(query);
      expect(result).toEqual({ users, count: 2 });
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("user.role = :role", { role: UserRole.USER });
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith("user.name", "ASC");
      expect(queryBuilderMock.skip).toHaveBeenCalledWith(0);
      expect(queryBuilderMock.take).toHaveBeenCalledWith(10);
    });
  });

  describe("findOne", () => {
    it("should return user correctly", async () => {
      const user = {
        id: "4",
        email: "user@email.com",
        name: "User Test",
        role: UserRole.USER,
        lastLogin: null,
        provider: null,
        providerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "StrongP@ssw0rd!",
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne("4");
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        provider: user.provider,
        providerId: user.providerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });
  });

  describe("findAllInactive", () => {
    it("should filter inactive users when neverLogged='true'", async () => {
      (queryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue([[], 0]);
      const query: FindAllUsersQueryDto = { neverLogged: "true" };
      await service.findAllInactive(query);
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("user.lastLogin IS NULL");
    });

    it("should filter inactive users when neverLogged='false'", async () => {
      (queryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue([[], 0]);
      const query: FindAllUsersQueryDto = { neverLogged: "false" };
      await service.findAllInactive(query);
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        "user.lastLogin IS NOT NULL AND user.lastLogin < :date",
        expect.objectContaining({ date: expect.any(Date) as Date }),
      );
    });

    it(
      "should return all inactive users (never logged and 30+ login date) " +
        "when neverLogged not informed",
      async () => {
        (queryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue([[], 0]);
        const query: FindAllUsersQueryDto = {};
        await service.findAllInactive(query);
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
          "(user.lastLogin IS NULL OR user.lastLogin < :date)",
          expect.objectContaining({ date: expect.any(Date) as Date }),
        );
      },
    );
  });

  describe("remove", () => {
    it("should remove the user successfully", async () => {
      const user: User = {
        id: "4",
        email: "user@email.com",
        name: "User Test",
        role: UserRole.USER,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "StrongP@ssw0rd!",
        hashPassword: jest.fn(),
      };

      jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(user);

      jest
        .spyOn(userRepository, "remove")
        .mockResolvedValue(user);

      const result = await service.remove("4");

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: "4" } });
      expect(userRepository.remove).toHaveBeenCalledWith(user);
      expect(result).toBeUndefined();
    });
  });

});

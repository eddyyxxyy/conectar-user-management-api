/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { UserService } from "./user.service";
import { User } from "../../entities/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { FindAllUsersQueryDto } from "./dtos/find-all-users.query.dto";
import { UserRole } from "../../enums/user-role.enum";
import { UpdateUserDto } from "./dtos/update-user.dto";

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
            update: jest.fn(),
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

  describe("update", () => {
    const id = "user-id";
    const oldUser = {
      id,
      name: "Old Name",
      email: "old@email.com",
      role: UserRole.USER,
      password: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should update user name and role", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(oldUser as User);
      (userRepository.save as jest.Mock).mockResolvedValue({
        ...oldUser,
        name: "New Name",
        role: UserRole.ADMIN,
      });

      const result = await service.update(id, { name: "New Name", role: UserRole.ADMIN });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...oldUser,
        name: "New Name",
        role: UserRole.ADMIN,
      });
      expect(result.name).toBe("New Name");
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.password).toBeUndefined();
    });

    it("should throw if user not found", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const dto = { name: "New" } as UpdateUserDto;
      await expect(service.update(id, dto)).rejects.toThrow(NotFoundException);
    });

    it("should throw conflict if updating to existing email", async () => {
      (userRepository.findOne as jest.Mock).mockImplementation(({ where: { email } }) =>
        email ? { id: "other-id" } : oldUser,
      );

      const dto = { email: "already@used.com" } as UpdateUserDto;
      await expect(service.update(id, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe("resetPassword", () => {
    let service: UserService;
    let userRepository: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: getRepositoryToken(User),
            useValue: {
              findOne: jest.fn(),
              save: jest.fn(),
            },
          },
        ],
      }).compile();

      service = module.get<UserService>(UserService);
      userRepository = module.get(getRepositoryToken(User));
    });

    it("should reset password and hash it", async () => {
      const user = { id: "123", password: "oldHash", name: "User Name", email: "user@email.com", role: UserRole.USER } as User;

      userRepository.findOne.mockResolvedValue(user);

      userRepository.save.mockImplementation((user: Partial<User>) =>
        Promise.resolve({
          id: user.id ?? "123",
          name: user.name ?? "Default Name",
          email: user.email ?? "default@email.com",
          password: user.password,
          role: user.role ?? UserRole.USER,
          lastLogin: user.lastLogin ?? null,
          provider: user.provider,
          providerId: user.providerId,
          createdAt: user.createdAt ?? new Date(),
          updatedAt: user.updatedAt ?? new Date(),
          hashPassword: () => {
            return new Promise(() => {
              return;
            });
          },
        }),
      );

      jest.spyOn(bcrypt, "hash").mockResolvedValue("newHash" as never);

      await service.resetPassword("123", { newPassword: "NewStrongPass123!" });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: "123" } });
      expect(bcrypt.hash).toHaveBeenCalledWith("NewStrongPass123!", 10);
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ password: "newHash" }));
    });

    it("should throw NotFoundException if user does not exist", async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword("nonexistent", { newPassword: "AnyPass123!" }))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe("resetPassword", () => {
    it("should throw NotFoundException if user not found", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.resetPassword("user-id", { newPassword: "newPass123!" }))
        .rejects.toThrow(NotFoundException);
    });

    it("should hash new password and save user", async () => {
      const user = { id: "user-id", password: "oldHash" } as User;
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userRepository.save as jest.Mock).mockResolvedValue(user);
      const hashSpy = jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedNewPass" as never);

      await service.resetPassword("user-id", { newPassword: "newPass123!" });

      expect(hashSpy).toHaveBeenCalledWith("newPass123!", 10);
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ password: "hashedNewPass" }));

      hashSpy.mockRestore();
    });
  });

  describe("changePassword", () => {
    it("should throw NotFoundException if user not found", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.changePassword("user-id", { currentPassword: "old", newPassword: "newPass!" }))
        .rejects.toThrow(NotFoundException);
    });

    it("should set new password directly if user.password is undefined", async () => {
      const user = { id: "user-id", password: undefined } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userRepository.save as jest.Mock).mockResolvedValue(user);

      await service.changePassword("user-id", { newPassword: "newPass123!" });

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: "newPass123!" }),
      );
    });

    it("should throw UnauthorizedException if currentPassword is missing and user has password", async () => {
      const user = { id: "user-id", password: "hashedPass" } as User;
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      await expect(service.changePassword("user-id", { newPassword: "newPass123!" }))
        .rejects.toThrow();
    });

    it("should throw UnauthorizedException if currentPassword is incorrect", async () => {
      const user = { id: "user-id", password: "hashedPass" } as User;
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      await expect(
        service.changePassword("user-id", { currentPassword: "wrongPass", newPassword: "newPass123!" }),
      ).rejects.toThrow();

      (bcrypt.compare as jest.Mock).mockRestore();
    });

    it("should update password if currentPassword is correct", async () => {
      const mockUser = {
        id: "user-id",
        password: "$2b$10$oldhash",
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("$2b$10$hashedNewPass" as never);

      await service.changePassword("user-id", {
        currentPassword: "correctPass",
        newPassword: "newPass123!",
      });

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: "user-id" },
        { password: "$2b$10$hashedNewPass" },
      );

      jest.restoreAllMocks();
    });
  });
});

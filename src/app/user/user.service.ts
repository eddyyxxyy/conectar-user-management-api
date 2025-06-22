import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../../entities/user.entity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CreateUserResponseDto } from "./dtos/create-user-response.dto";
import { CreateOrFindSocialUserDto } from "./dtos/create-or-find-social-user.dto";
import { FindAllUsersQueryDto } from "./dtos/find-all-users.query.dto";
import { UserResponseDto } from "./dtos/user-response.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { ResetPasswordDto } from "./dtos/reset-user-password.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException("Email already exists.");
    }

    const newUser = this.userRepository.create(dto);

    await this.userRepository.save(newUser);

    return { id: newUser.id };
  }

  async createOrFindSocialUser(
    dto: CreateOrFindSocialUserDto,
  ): Promise<CreateUserResponseDto> {
    const existingSocial = await this.userRepository.findOne({
      where: { provider: dto.provider, providerId: dto.providerId },
    });

    if (existingSocial) {
      return { id: existingSocial.id };
    }

    if (dto.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new ConflictException(
          "Email already registered with another method.",
        );
      }
    }

    const newUser = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      provider: dto.provider,
      providerId: dto.providerId,
    });

    await this.userRepository.save(newUser);

    return { id: newUser.id };
  }

  async findAll(query?: FindAllUsersQueryDto) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const role = query?.role;
    const sortBy = query?.sortBy ?? "createdAt";
    const order = query?.order ?? "asc";

    const qb = this.userRepository.createQueryBuilder("user");

    if (role) {
      qb.andWhere("user.role = :role", { role });
    }

    qb.orderBy(`user.${sortBy}`, order.toUpperCase() as "ASC" | "DESC");
    qb.skip((page - 1) * limit).take(limit);

    const [users, count] = await qb.getManyAndCount();

    return {
      users,
      count,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    delete user.password;

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      lastLogin: user.lastLogin,
      provider: user.provider,
      providerId: user.providerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userResponse;
  }

  async findWithPasswordByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        lastLogin: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  async findAllInactive(query?: FindAllUsersQueryDto) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const role = query?.role;
    const sortBy = query?.sortBy ?? "createdAt";
    const order = query?.order ?? "asc";

    const qb = this.userRepository.createQueryBuilder("user");

    if (role) {
      qb.andWhere("user.role = :role", { role });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (query?.neverLogged === "true") {
      qb.andWhere("user.lastLogin IS NULL");
    }
    else if (query?.neverLogged === "false") {
      qb.andWhere("user.lastLogin IS NOT NULL AND user.lastLogin < :date", { date: thirtyDaysAgo });
    }
    else {
      qb.andWhere("(user.lastLogin IS NULL OR user.lastLogin < :date)", { date: thirtyDaysAgo });
    }

    qb.orderBy(`user.${sortBy}`, order.toUpperCase() as "ASC" | "DESC");
    qb.skip((page - 1) * limit).take(limit);

    const [users, count] = await qb.getManyAndCount();

    return {
      users,
      count,
    };
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    await this.userRepository.remove(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({ where: { email: dto.email } });
      if (emailExists) {
        throw new ConflictException("Email already in use.");
      }
      user.email = dto.email;
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (dto.role) {
      user.role = dto.role;
    }

    const updatedUser = await this.userRepository.save(user);

    delete updatedUser.password;

    return updatedUser;
  }

  async resetPassword(userId: string, dto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
  }
}
import { Injectable, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CreateUserResponseDto } from "./dtos/create-user-response.dto";
import { CreateOrFindSocialUserDto } from "./dtos/create-or-find-social-user.dto";

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
}
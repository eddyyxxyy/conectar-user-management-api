import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from "class-validator";
import { UserRole } from "src/enums/user-role.enum";

@ApiSchema({
  name: "CreateUserDto",
  description: "Data transfer object for creating a new user.",
})
export class CreateUserDto {
  @IsString()
  @Length(2, 100, { message: "Name must be between 2 and 100 characters." })
  @ApiProperty({
    type: String,
    description: "The full name of the new user.",
    example: "John Doe",
    maxLength: 100,
    minLength: 2,
    required: true,
  })
  name: string;

  @IsEmail({}, { message: "Invalid email address." })
  @ApiProperty({
    type: String,
    description: "The email address of the new user.",
    example: "john_doe@email.com",
    required: true,
  })
  email: string;

  @IsOptional()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message: "Password must have at least: one lowercase letter, one " +
      "uppercase letter, one number, one symbol, and be 8 characters long.",
    },
  )
  @ApiProperty({
    type: String,
    description: "The password for the new user.",
    example: "StrongP@ssw0rd!",
    required: false,
  })
  password?: string;

  @IsEnum(UserRole, { message: "Role must be either USER or ADMIN." })
  @IsOptional()
  @ApiProperty({
    enum: UserRole,
    description: "The role of the new user.",
    example: UserRole.USER,
    required: false,
  })
  role?: UserRole = UserRole.USER;
}
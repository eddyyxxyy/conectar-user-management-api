import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { UserRole } from "../../../enums/user-role.enum";

@ApiSchema({
  name: "UpdateUserDto",
  description: "Data transfer object for updating an user.",
})
export class UpdateUserDto {
  @IsString()
  @Length(2, 100, { message: "Name must be between 2 and 100 characters." })
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "The full name of the user.",
    example: "John Doe",
    maxLength: 100,
    minLength: 2,
    required: false,
  })
  name?: string;

  @IsEmail({}, { message: "Invalid email address." })
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "The email address of the user.",
    example: "john_doe@email.com",
    required: false,
  })
  email?: string;

  @IsEnum(UserRole, { message: "Role must be either USER or ADMIN." })
  @IsOptional()
  @ApiProperty({
    enum: UserRole,
    description: "The role of the user.",
    example: UserRole.USER,
    required: false,
  })
  role?: UserRole = UserRole.USER;
}
import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @IsEmail({}, { message: "Invalid email address." })
  @ApiProperty({
    type: String,
    description: "The email address of the user.",
    example: "john_doe@email.com",
    required: true,
  })
  email: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: "The password for the user.",
    example: "StrongP@ssw0rd!",
    required: true,
  })
  password: string;
}
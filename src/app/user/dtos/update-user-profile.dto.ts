import { IsEmail, IsOptional, IsString, Length } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @ApiPropertyOptional({ description: "User's name", example: "John Doe" })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ description: "User's email", example: "john@example.com" })
  email?: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "class-validator";

export class ResetPasswordDto {
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
    description: "The new password for the user.",
    example: "StrongP@ssw0rd!",
    required: true,
  })
  newPassword: string;
}
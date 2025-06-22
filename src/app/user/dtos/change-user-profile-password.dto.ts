import { IsString, ValidateIf, IsStrongPassword } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ValidateIf((o: { currentPassword?: string }) => o.currentPassword !== undefined)
  @IsString()
  @ApiProperty({ description: "Current password", example: "oldPass!123", required: false })
  currentPassword?: string;

  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Password must have at least: one lowercase letter, one uppercase " +
        "letter, one number, one symbol, and be at least 8 characters long.",
    },
  )
  @ApiProperty({ description: "New password", example: "newStrongPass1123" })
  newPassword: string;
}

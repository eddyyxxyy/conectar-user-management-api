import { IsJWT, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenResponseDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: "The user id.",
    required: true,
  })
  id: string;

  @IsJWT()
  @IsString()
  @ApiProperty({
    type: String,
    description: "The refresh token for the user.",
    required: true,
  })
  refreshToken: string;
}
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
  @ApiProperty({
    type: String,
    description: "The new access token for the user.",
    required: true,
  })
  accessToken: string;

  @IsJWT()
  @ApiProperty({
    type: String,
    description: "The new refresh token for the user.",
    required: true,
  })
  refreshToken: string;
}
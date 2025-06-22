import { IsJWT, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
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
    description: "The access token for the user.",
    required: true,
  })
  accessToken: string;

  @IsJWT()
  @IsString()
  @ApiProperty({
    type: String,
    description: "The refresh token for the user.",
    required: true,
  })
  refreshToken: string;
}
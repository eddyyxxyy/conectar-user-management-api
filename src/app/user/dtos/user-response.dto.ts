import { ApiSchema, ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../../enums/user-role.enum";

@ApiSchema({
  name: "UserResponseDto",
  description: "User summary for list endpoints.",
})
export class UserResponseDto {
  @ApiProperty({ example: "d70417de-9aa1-493f-aae1-d6eaa18f2028" })
  id: string;

  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({ example: "john_doe@email.com" })
  email: string;

  @ApiProperty({
    enum: UserRole,
    description: "The role of the user.",
    example: UserRole.USER,
    required: false,
  })
  role: string;

  @ApiProperty({
    description: "The last login date of the user.",
    example: "2025-06-20T23:16:23.415Z",
    nullable: true,
    type: String,
  })
  lastLogin: Date | null;

  @ApiProperty({ example: null, nullable: true })
  provider: string | null | undefined;

  @ApiProperty({ example: null, nullable: true })
  providerId: string | null | undefined;

  @ApiProperty({ example: "2025-06-20T23:16:23.415Z" })
  createdAt: Date;

  @ApiProperty({ example: "2025-06-20T23:16:23.415Z" })
  updatedAt: Date | null | undefined;
}
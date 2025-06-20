import { ApiSchema, ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "./user-response.dto";

@ApiSchema({
  name: "FindAllUsersResponseDto",
  description: "Data transfer object of a list of users.",
})
export class FindAllUsersResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: "List of users.",
    example: [
      {
        id: "d70417de-9aa1-493f-aae1-d6eaa18f2028",
        name: "John Doe",
        email: "john_doe@email.com",
        role: "user",
        lastLogin: "2025-06-20T23:16:23.415Z",
        provider: null,
        providerId: null,
        createdAt: "2025-06-20T23:16:23.415Z",
        updatedAt: "2025-06-20T23:16:23.415Z",
      },
      {
        id: "d70si2de-1kfp-493f-aae1-9Opk818f2028",
        name: "Jane Doe",
        email: "jane_doe@email.com",
        role: "user",
        lastLogin: "2025-06-12T10:45:21.025Z",
        provider: null,
        providerId: null,
        createdAt: "2025-06-02T23:16:23.415Z",
        updatedAt: "2025-06-12T11:33:56.325Z",
      },
    ],
  })
  users: UserResponseDto[];

  @ApiProperty({
    type: Number,
    description: "Total number of users.",
    example: 1,
  })
  count: number;
}
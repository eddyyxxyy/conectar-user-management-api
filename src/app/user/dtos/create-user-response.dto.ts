import { ApiSchema, ApiProperty } from "@nestjs/swagger";

@ApiSchema({
  name: "CreateUserResponseDto",
  description: "Data transfer object of the created user.",
})
export class CreateUserResponseDto {
  @ApiProperty({
    description: "The unique identifier of the created user",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;
}
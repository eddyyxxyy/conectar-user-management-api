import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  Length,
} from "class-validator";

@ApiSchema({
  name: "CreateOrFindSocialUserDto",
  description: "Data transfer object for creating or finding an user with " +
  "social login.",
})
export class CreateOrFindSocialUserDto {
  @IsString()
  @Length(2, 100, { message: "Name must be between 2 and 100 characters." })
  @ApiProperty({
    type: String,
    description: "The full name of the user.",
    example: "John Doe",
    maxLength: 100,
    minLength: 2,
    required: true,
  })
  name: string;

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
    description: "The provider of the user (e.g., 'google', 'facebook').",
    example: "google",
    required: false,
  })
  provider?: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: "The unique identifier from the provider.",
    example: "1234567890",
    required: false,
  })
  providerId?: string;
}
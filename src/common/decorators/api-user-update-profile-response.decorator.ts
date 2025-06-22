import { applyDecorators } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { UserResponseDto } from "../../app/user/dtos/user-response.dto";

const ApiUserUpdateProfileResponse = () => {
  return applyDecorators(
    ApiOkResponse({
      description: "Profile updated successfully.",
      type: UserResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: "Authentication required.",
      schema: {
        example: {
          statusCode: 401,
          message: "Unauthorized",
          error: "Unauthorized",
        },
      },
    }),
    ApiForbiddenResponse({
      description: "Forbidden resource.",
      schema: {
        example: {
          statusCode: 403,
          message: "Forbidden resource",
          error: "Forbidden",
        },
      },
    }),
    ApiConflictResponse({
      description: "Email already in use.",
      schema: {
        example: {
          statusCode: 409,
          message: "Email already in use.",
          error: "Conflict",
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: "Unexpected error.",
      schema: {
        example: {
          statusCode: 500,
          message: "Unexpected error.",
          error: "Internal Server Error",
        },
      },
    }),
  );
};

export { ApiUserUpdateProfileResponse };

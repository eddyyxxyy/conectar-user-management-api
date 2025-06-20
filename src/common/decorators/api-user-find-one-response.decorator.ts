import { applyDecorators } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { UserResponseDto } from "../../app/user/dtos/user-response.dto";

const ApiUserFindOneResponse = () => {
  return applyDecorators(
    ApiOkResponse({
      description: "User found",
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
      description: "Admin permission required.",
      schema: {
        example: {
          statusCode: 403,
          message: "Forbidden resource",
          error: "Forbidden",
        },
      },
    }),
    ApiNotFoundResponse({
      description: "User not found.",
      schema: {
        example: {
          statusCode: 404,
          message: "User not found.",
          error: "Not found",
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

export { ApiUserFindOneResponse };

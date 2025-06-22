import { applyDecorators } from "@nestjs/common";
import {
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { UserResponseDto } from "../../app/user/dtos/user-response.dto";

const ApiUserUpdateResponse = () => {
  return applyDecorators(
    ApiOkResponse({
      description: "User updated successfully.",
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
    ApiBadRequestResponse({
      description: "Bad Request. The input data is invalid.",
      schema: {
        example: {
          message: [
            "Role must be either USER or ADMIN.",
          ],
          error: "Bad Request",
          statusCode: 400,
        },
      },
    }),
    ApiConflictResponse({
      description: "E-mail already in use.",
      schema: {
        example: {
          statusCode: 409,
          message: "E-mail already in use.",
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

export { ApiUserUpdateResponse };

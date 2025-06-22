import { applyDecorators } from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";

const ApiUserChangePasswordResponse = () => {
  return applyDecorators(
    ApiNoContentResponse({
      description: "Password changed successfully.",
    }),
    ApiUnauthorizedResponse({
      description: "Invalid or missing credentials.",
      schema: {
        example: {
          statusCode: 401,
          message: "Current password must be provided.",
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
    ApiNotFoundResponse({
      description: "User not found.",
      schema: {
        example: {
          statusCode: 404,
          message: "User not found.",
          error: "Not Found",
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

export { ApiUserChangePasswordResponse };

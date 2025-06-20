import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";

const ApiUserFindAllResponses = (type: Type<unknown>) => {
  return applyDecorators(
    ApiOkResponse({
      description: "List of all users",
      type,
    }),
    ApiBadRequestResponse({
      description: "Invalid query parameters.",
      schema: {
        example: {
          statusCode: 400,
          message: [
            "page must not be less than 1",
            "limit must not be greater than 100",
            "role must be a valid enum value",
          ],
          error: "Bad Request",
        },
      },
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

export { ApiUserFindAllResponses };

import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";

interface ApiUserFindAllResponsesOptions {
  okMessage?: string;
}

const ApiUserFindAllResponses = (
  type: Type<unknown>,
  options: ApiUserFindAllResponsesOptions = {},
) => {
  const okMessage = options.okMessage ?? "List of all users.";
  return applyDecorators(
    ApiOkResponse({
      description: okMessage,
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

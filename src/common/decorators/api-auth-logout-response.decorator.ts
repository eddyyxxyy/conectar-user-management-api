import { applyDecorators } from "@nestjs/common";
import {
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
} from "@nestjs/swagger";

const ApiAuthLogoutResponses = () => {
  return applyDecorators(
    ApiNoContentResponse({
      description: "User logged out successfully",
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

export { ApiAuthLogoutResponses };

import { applyDecorators } from "@nestjs/common";
import {
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from "@nestjs/swagger";
import { RefreshTokenResponseDto } from "../../app/auth/dtos/refresh-token-response.dto";

const ApiAuthRefreshTokenResponses = () => {
  return applyDecorators(
    ApiOkResponse({
      type: RefreshTokenResponseDto,
      description: "User authenticated successfully.",
    }),
    ApiInternalServerErrorResponse({
      description: "Internal server error.",
      schema: {
        example: {
          statusCode: 500,
          message: "Unexpected error.",
          error: "Internal Server Error",
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: "Refresh token header is required.",
      schema: {
        example: {
          statusCode: 401,
          message: "Refresh token header is required.",
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
  );
};

export { ApiAuthRefreshTokenResponses };

import { applyDecorators } from "@nestjs/common";
import {
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
} from "@nestjs/swagger";
import { LoginResponseDto } from "../../app/auth/dtos/login-response.dto";

const ApiAuthLoginResponses = () => {
  return applyDecorators(
    ApiOkResponse({
      type: LoginResponseDto,
      description: "User authenticated successfully.",
    }),
    ApiBadRequestResponse({
      description: "Bad Request. The input data is invalid.",
      schema: {
        example: {
          statusCode: 400,
          message: "Invalid email address.",
          error: "Bad Request",
        },
      },
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
      description: "Account is linked to a social login.",
      schema: {
        example: {
          statusCode: 401,
          message: "Account is linked to a social login.",
          error: "Unauthorized",
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: "Invalid password.",
      schema: {
        example: {
          statusCode: 401,
          message: "Invalid password.",
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

export { ApiAuthLoginResponses };

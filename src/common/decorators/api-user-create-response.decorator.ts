import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";

interface ApiUserCreateResponsesOptions {
  conflictMessage?: string;
}

/**
 * Decorator para documentar responses de criação de usuário.
 * Permite customizar a mensagem de conflito para cada fluxo.
 */
const ApiUserCreateResponses = (
  type: Type<unknown>,
  options: ApiUserCreateResponsesOptions = {},
) => {
  const conflictMsg = options.conflictMessage ?? "Email already exists.";
  return applyDecorators(
    ApiCreatedResponse({
      description: "The user has been successfully created.",
      type,
    }),
    ApiBadRequestResponse({
      description: "Bad Request. The input data is invalid.",
      schema: {
        example: {
          statusCode: 400,
          message: ["email must be valid", "password must be strong"],
          error: "Bad Request",
        },
      },
    }),
    ApiConflictResponse({
      description: conflictMsg,
      schema: {
        example: {
          statusCode: 409,
          message: conflictMsg,
          error: "Conflict",
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
  );
};

export { ApiUserCreateResponses };
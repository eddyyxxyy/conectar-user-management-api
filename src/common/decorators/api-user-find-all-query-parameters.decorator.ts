import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

const ApiUserFindAllQueryParameters = () => {
  return applyDecorators(
    ApiQuery({
      name: "page",
      required: false,
      type: Number,
      description: "Page number (starts at 1)",
      example: 1,
      minimum: 1,
      default: 1,
    }),
    ApiQuery({
      name: "limit",
      required: false,
      type: Number,
      description: "Number of users per page",
      example: 10,
      minimum: 1,
      maximum: 100,
      default: 10,
    }),
    ApiQuery({
      name: "role",
      required: false,
      enum: ["user", "admin"],
      description: "Filter by user role (user or admin)",
      example: "user",
    }),
    ApiQuery({
      name: "sortBy",
      required: false,
      enum: ["name", "createdAt"],
      description: "Sort by field (name or createdAt)",
      example: "name",
      default: "createdAt",
    }),
    ApiQuery({
      name: "order",
      required: false,
      enum: ["asc", "desc"],
      description: "Sort order (asc or desc)",
      example: "asc",
      default: "asc",
    }),
  );
};

export { ApiUserFindAllQueryParameters };

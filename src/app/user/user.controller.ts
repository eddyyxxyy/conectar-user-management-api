import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { ApiUserCreateResponses } from "../../common/decorators/api-user-create-response.decorator";
import { CreateUserResponseDto } from "./dtos/create-user-response.dto";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CreateOrFindSocialUserDto } from "./dtos/create-or-find-social-user.dto";
import { FindAllUsersResponseDto } from "./dtos/find-all-response.dto";
import { FindAllUsersQueryDto } from "./dtos/find-all-users.query.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new user (traditional)" })
  @ApiBody({ type: CreateUserDto, required: true })
  @ApiUserCreateResponses(CreateUserResponseDto)
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post("social")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create or find user via social provider" })
  @ApiBody({ type: CreateOrFindSocialUserDto, required: true })
  @ApiUserCreateResponses(
    CreateUserResponseDto,
    { conflictMessage: "Email already registered with another method." },
  )
  createOrFindSocialUser(@Body() dto: CreateOrFindSocialUserDto) {
    return this.userService.createOrFindSocialUser(dto);
  }

  // Somente admins podem acessar (adicionar guard futuramente)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all users (admin only)" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (starts at 1)",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of users per page",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @ApiQuery({
    name: "role",
    required: false,
    enum: ["user", "admin"],
    description: "Filter by user role (user or admin)",
    example: "user",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: ["name", "createdAt"],
    description: "Sort by field (name or createdAt)",
    example: "name",
    default: "createdAt",
  })
  @ApiQuery({
    name: "order",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order (asc or desc)",
    example: "asc",
    default: "asc",
  })
  @ApiOkResponse({
    description: "List of all users",
    type: FindAllUsersResponseDto,
  })
  @ApiBadRequestResponse({ description: "Invalid query parameters." })
  @ApiUnauthorizedResponse({ description: "Authentication required." })
  @ApiForbiddenResponse({ description: "Admin permission required." })
  @ApiInternalServerErrorResponse({ description: "Unexpected error." })
  findAll(@Query() query: FindAllUsersQueryDto) {
    return this.userService.findAll(query);
  }
}
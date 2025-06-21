import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger";
import { UserService } from "./user.service";
import {
  ApiUserCreateResponses,
} from "../../common/decorators/api-user-create-response.decorator";
import { CreateUserResponseDto } from "./dtos/create-user-response.dto";
import { CreateUserDto } from "./dtos/create-user.dto";
import {
  CreateOrFindSocialUserDto,
} from "./dtos/create-or-find-social-user.dto";
import { FindAllUsersResponseDto } from "./dtos/find-all-response.dto";
import { FindAllUsersQueryDto } from "./dtos/find-all-users.query.dto";
import {
  ApiUserFindAllResponses,
} from "../../common/decorators/api-user-find-all-response.decorator";
import {
  ApiUserFindAllQueryParameters,
} from "../../common/decorators/api-user-find-all-query-parameters.decorator";
import {
  ApiUserFindOneResponse,
} from "../../common/decorators/api-user-find-one-response.decorator";
import { ApiUserDeleteResponse } from "../../common/decorators/api-user-delete-response.decorator";

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

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all users (admin only)" })
  @ApiUserFindAllQueryParameters()
  @ApiUserFindAllResponses(FindAllUsersResponseDto)
  findAll(@Query() query: Omit<FindAllUsersQueryDto, "neverLogged">) {
    return this.userService.findAll(query);
  }

  @Get("inactive")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all inactive users (admin only)" })
  @ApiUserFindAllQueryParameters()
  @ApiUserFindAllResponses(
    FindAllUsersResponseDto,
    {
      okMessage: "List of all inactive users (never logged or/and 30+ days " +
        "since last login)",
    },
  )
  findAllInactive(@Query() query: FindAllUsersQueryDto) {
    return this.userService.findAllInactive(query);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get user by ID (admin only)" })
  @ApiParam({ name: "id", type: String, description: "User ID" })
  @ApiUserFindOneResponse()
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user by ID (admin only)" })
  @ApiParam({ name: "id", type: String, description: "User ID" })
  @ApiUserDeleteResponse()
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
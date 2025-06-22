import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger";
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
import {
  ApiUserDeleteResponse,
} from "../../common/decorators/api-user-delete-response.decorator";
import {
  ApiUserUpdateResponse,
} from "../../common/decorators/api-user-update-response.decorator";
import {
  ApiResetPasswordResponse,
} from "../../common/decorators/api-user-reset-password-response.decorator";
import {
  ApiUserUpdateProfileResponse,
} from "../../common/decorators/api-user-update-profile-response.decorator";
import {
  ApiUserChangePasswordResponse,
} from "../../common/decorators/api-user-change-password-response.decorator";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { ResetPasswordDto } from "./dtos/reset-user-password.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import type { RequestWithUser } from "../auth/types/request-with-user";
import { UpdateUserProfileDto } from "./dtos/update-user-profile.dto";
import { ChangePasswordDto } from "./dtos/change-user-profile-password.dto";
import { AuthRoles } from "../../common/decorators/auth-roles.decorator";
import { UserRole } from "../../enums/user-role.enum";
import { RolesGuard } from "../auth/guards/roles/roles.guard";

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
  @AuthRoles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all users (admin only)" })
  @ApiUserFindAllQueryParameters()
  @ApiUserFindAllResponses(FindAllUsersResponseDto)
  findAll(@Query() query: Omit<FindAllUsersQueryDto, "neverLogged">) {
    return this.userService.findAll(query);
  }

  @Get("inactive")
  @AuthRoles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
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

  @Get("profile")
  @AuthRoles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current logged user" })
  @ApiBearerAuth("JWT Authentication")
  @ApiUserFindOneResponse()
  getProfile(@Request() req: RequestWithUser) {
    return this.userService.findOne(req.user.id);
  }

  @Patch("profile")
  @AuthRoles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("JWT Authentication")
  @ApiOperation({ summary: "Update current user's profile (name, email)" })
  @ApiUserUpdateProfileResponse()
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.userService.update(req.user.id, dto);
  }

  @Patch("change-password")
  @AuthRoles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("JWT Authentication")
  @ApiOperation({ summary: "Change current user's password" })
  @ApiUserChangePasswordResponse()
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(req.user.id, dto);
  }

  @Get(":id")
  @AuthRoles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get user by ID (admin only)" })
  @ApiParam({ name: "id", type: String, description: "User ID" })
  @ApiUserFindOneResponse()
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Delete(":id")
  @AuthRoles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user by ID (admin only)" })
  @ApiParam({ name: "id", type: String, description: "User ID" })
  @ApiUserDeleteResponse()
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }

  @Patch(":id")
  @AuthRoles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update user by ID (admin only)" })
  @ApiParam({ name: "id", type: String, description: "User ID" })
  @ApiBody({ type: UpdateUserDto, required: false })
  @ApiUserUpdateResponse()
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Patch(":id/reset-password")
  @AuthRoles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT Authentication")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Reset a user's password (admin only)" })
  @ApiParam({ name: "id", type: String, description: "User ID" })
  @ApiBody({ type: ResetPasswordDto, required: false })
  @ApiResetPasswordResponse()
  resetPassword(@Param("id") id: string, @Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(id, dto);
  }
}
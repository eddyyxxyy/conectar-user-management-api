import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { UserRole } from "../../../enums/user-role.enum";
import { Type } from "class-transformer";

export class FindAllUsersQueryDto {
  @ApiPropertyOptional({
    description: "Page number (starts at 1)",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of users per page",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Filter by user role (user or admin)",
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: "Sort by field (name or createdAt)",
    enum: ["name", "createdAt"],
    example: "name",
    default: "createdAt",
  })
  @IsOptional()
  @IsString()
  sortBy?: "name" | "createdAt" = "createdAt";

  @ApiPropertyOptional({
    description: "Sort order (asc or desc)",
    enum: ["asc", "desc"],
    example: "asc",
    default: "asc",
  })
  @IsOptional()
  @IsString()
  order?: "asc" | "desc" = "asc";
}

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../../../../common/decorators/auth-roles.decorator";
import { UserRole } from "../../../../enums/user-role.enum";
import { RequestWithUser } from "../../types/request-with-user";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY, [
          context.getHandler(),
          context.getClass(),
        ],
      );

    const user = context.switchToHttp().getRequest<RequestWithUser>().user;

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    return hasRequiredRole;
  }
}
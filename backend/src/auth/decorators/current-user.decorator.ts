import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUser } from '../../common/types';

/**
 * @CurrentUser() → full user object from JWT validation
 * @CurrentUser('id') → single field from the user object
 */
export const CurrentUser = createParamDecorator(
  (field: keyof SafeUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: SafeUser }>();
    if (field) return request.user?.[field];
    return request.user;
  },
);

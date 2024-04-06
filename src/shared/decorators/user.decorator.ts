import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { HttpRequestWithUserType } from '@shared/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any,max-len
export const HttpUser: () => any = createParamDecorator(async (data: unknown, context: ExecutionContext) => {
  const request: HttpRequestWithUserType = context.switchToHttp().getRequest();
  return request.user;
});

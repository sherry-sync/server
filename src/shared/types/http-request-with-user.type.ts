import { FastifyRequest } from 'fastify';

import { HttpUserPayload } from '@shared/types';

export type HttpRequestWithUserType = FastifyRequest & { user: HttpUserPayload };

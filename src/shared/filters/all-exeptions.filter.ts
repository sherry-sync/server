import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch(HttpException)
export class AllExceptionsFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): T | void {
    const context = host.switchToHttp();
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const request = context.getRequest<FastifyRequest>();
    const status = exception.getStatus();
    let message = (exception.response?.message || exception.messages) ?? exception.message;
    Logger.error(exception);
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Internal server error';
    }
    response.status(status).send({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

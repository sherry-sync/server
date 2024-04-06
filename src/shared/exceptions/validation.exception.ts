import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  messages: string | Record<string, unknown> | string[];

  constructor(response: string | Record<string, unknown> | string[]) {
    super(response, HttpStatus.UNPROCESSABLE_ENTITY);
    this.messages = response;
  }
}

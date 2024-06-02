import {
  Body,
  Controller, Get, HttpCode, Patch, Query, UseGuards,
} from '@nestjs/common';

import { HttpUser } from '@shared/decorators';
import { JWTAuthGuard } from '@shared/guards';
import { HttpUserPayload } from '@shared/types';

import { PatchMeRequestDto } from '@modules/user/dto';
import { FindUserDto } from '@modules/user/dto/find-user.request.dto';
import { UserService } from '@modules/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @HttpCode(200)
  @UseGuards(JWTAuthGuard)
  async getMe(@HttpUser() user: HttpUserPayload) {
    return this.userService.getMe(user.userId);
  }

  @Patch('me')
  @HttpCode(200)
  @UseGuards(JWTAuthGuard)
  async patchMe(@HttpUser() user: HttpUserPayload, @Body() pathUserDto: PatchMeRequestDto) {
    return this.userService.patchMe(user.userId, pathUserDto);
  }

  @Get('find')
  @HttpCode(200)
  @UseGuards(JWTAuthGuard)
  async findUser(@Query() query: FindUserDto) {
    return this.userService.find({
      where: {
        ...query.username && { username: { contains: query.username } },
        ...query.email && { email: { contains: query.email } },
        ...query.userId && { userId: query.userId },
      },
    });
  }
}

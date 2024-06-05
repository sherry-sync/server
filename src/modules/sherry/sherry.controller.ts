import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';

import { HttpUser } from '@shared/decorators';
import { JWTAuthGuard } from '@shared/guards';
import { HttpUserPayload } from '@shared/types';

import { CreateSherryDto, UpdateSherryDto, UpdateSherryPermissionDto } from '@modules/sherry/dto/request';
import { SherryResponseDto } from '@modules/sherry/dto/response';
import { SherryService } from '@modules/sherry/sherry.service';

@Controller('sherry')
export class SherryController {
  constructor(private readonly sherryService: SherryService) {}

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async getMy(@HttpUser() user: HttpUserPayload): Promise<SherryResponseDto[]> {
    return this.sherryService.getAllByUserId(user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JWTAuthGuard)
  async create(
    @HttpUser() user: HttpUserPayload,
      @Body() createDto: CreateSherryDto,
  ): Promise<SherryResponseDto> {
    return this.sherryService.create(user.userId, createDto);
  }

  @Delete(':sherryId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async delete(
    @HttpUser() user: HttpUserPayload,
      @Param('sherryId', ParseUUIDPipe) sherryId: string,
  ): Promise<boolean> {
    await this.sherryService.delete(user.userId, sherryId);
    return true;
  }

  @Get(':sherryId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async getById(
    @HttpUser() user: HttpUserPayload,
      @Param('sherryId', ParseUUIDPipe) sherryId: string,
  ): Promise<SherryResponseDto> {
    return this.sherryService.getById(user.userId, sherryId);
  }

  @Patch(':sherryId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async update(
  @HttpUser() user: HttpUserPayload,
    @Param('sherryId', ParseUUIDPipe) sherryId: string,
    @Body() updateDto: UpdateSherryDto,
  ) {
    return this.sherryService.update(user.userId, sherryId, updateDto);
  }

  @Patch(':sherryId/users/:userId/permission')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async updatePermission(
  @HttpUser() user: HttpUserPayload,
    @Param('sherryId', ParseUUIDPipe) sherryId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateSherryPermissionDto: UpdateSherryPermissionDto,
  ) {
    return this.sherryService.updatePermission(
      user.userId,
      sherryId,
      userId,
      updateSherryPermissionDto,
    );
  }
}

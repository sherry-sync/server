import {
  Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';

import { HttpUser } from '@shared/decorators';
import { JWTAuthGuard } from '@shared/guards';
import { HttpUserPayload } from '@shared/types';

import { CreateSherryDto, UpdateSherryDto } from '@modules/sherry/dto/request ';
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
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PartsService } from './parts.service';
import { Part } from './parts.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PaginatedPartsResponse, PartsQueryDto } from './dto/parts-query.dto';

import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('parts')
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  // ==============================
  // PUBLIC
  // ==============================

  @Get()
  @ApiOperation({
    summary:
      'Pobierz listę wszystkich części z paginacją, sortowaniem i wyszukiwaniem',
  })
  findAll(@Query() queryDto: PartsQueryDto): Promise<PaginatedPartsResponse> {
    return this.partsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz szczegóły jednej części po ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Part> {
    return this.partsService.findOne(id);
  }

  // ==============================
  // ADMIN ONLY
  // ==============================

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({ summary: 'Stwórz nową część (admin only)' })
  create(@Body() createPartDto: CreatePartDto): Promise<Part> {
    return this.partsService.create(createPartDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Put(':id')
  @ApiOperation({ summary: 'Aktualizuj część (admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePartDto: UpdatePartDto,
  ): Promise<Part> {
    return this.partsService.update(id, updatePartDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usuń część (admin only)' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.partsService.delete(id);
  }

  // ==============================
  // ADMIN + CLIENT
  // ==============================

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @Post(':id/purchase')
  @ApiOperation({ summary: 'Zakup część (admin & client)' })
  purchase(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<Part> {
    return this.partsService.purchase(id, quantity || 1);
  }
}

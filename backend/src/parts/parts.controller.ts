import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PartsService } from './parts.service';
import { Part } from './parts.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsQueryDto, PaginatedPartsResponse } from './dto/parts-query.dto';

@ApiTags('parts')
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  // ---------------- PUBLIC ----------------

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

  // ---------------- PROTECTED ----------------

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({ summary: 'Stwórz nową część (wymaga logowania)' })
  create(@Body() createPartDto: CreatePartDto): Promise<Part> {
    return this.partsService.create(createPartDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Put(':id')
  @ApiOperation({ summary: 'Aktualizuj część (wymaga logowania)' })
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updatePartDto: UpdatePartDto,
  ): Promise<Part> {
    return this.partsService.update(id, updatePartDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usuń część (wymaga logowania)' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.partsService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post(':id/purchase')
  @ApiOperation({ summary: 'Zakup część (wymaga logowania)' })
  purchase(
      @Param('id', ParseIntPipe) id: number,
      @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<Part> {
    return this.partsService.purchase(id, quantity || 1);
  }
}

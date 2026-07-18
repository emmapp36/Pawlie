import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { Pet } from '@pawlie/domain';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  list(@Query('householdId', ParseUUIDPipe) householdId: string): Promise<Pet[]> {
    return this.petsService.list(householdId);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Pet> {
    return this.petsService.get(id);
  }

  @Post()
  create(@Body() dto: CreatePetDto): Promise<Pet> {
    return this.petsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePetDto,
  ): Promise<Pet> {
    return this.petsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.petsService.remove(id);
  }
}

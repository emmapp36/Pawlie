import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import type { WeightEntry } from '@pawlie/domain';
import { WeightsService } from './weights.service';

@Controller('pets/:petId/weights')
export class WeightsController {
  constructor(private readonly weightsService: WeightsService) {}

  @Get()
  list(
    @Param('petId', ParseUUIDPipe) petId: string,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ): Promise<WeightEntry[]> {
    return this.weightsService.list(petId, limit);
  }
}

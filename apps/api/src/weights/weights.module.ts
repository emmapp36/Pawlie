import { Module } from '@nestjs/common';
import { WeightsController } from './weights.controller';
import { WeightsRepository } from './weights.repository';
import { WeightsService } from './weights.service';

@Module({
  controllers: [WeightsController],
  providers: [WeightsService, WeightsRepository],
})
export class WeightsModule {}

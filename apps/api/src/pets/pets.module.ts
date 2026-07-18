import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsRepository } from './pets.repository';
import { PetsService } from './pets.service';

@Module({
  controllers: [PetsController],
  providers: [PetsService, PetsRepository],
  exports: [PetsService],
})
export class PetsModule {}

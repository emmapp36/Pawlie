import { Injectable } from '@nestjs/common';
import type { WeightEntry } from '@pawlie/domain';
import { WeightsRepository } from './weights.repository';

@Injectable()
export class WeightsService {
  constructor(private readonly repository: WeightsRepository) {}

  list(petId: string, limit = 30): Promise<WeightEntry[]> {
    return this.repository.findByPet(petId, limit);
  }
}

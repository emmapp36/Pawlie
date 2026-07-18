import { Injectable, NotFoundException } from '@nestjs/common';
import type { Pet } from '@pawlie/domain';
import type { CreatePetDto } from './dto/create-pet.dto';
import type { UpdatePetDto } from './dto/update-pet.dto';
import { PetsRepository } from './pets.repository';

@Injectable()
export class PetsService {
  constructor(private readonly repository: PetsRepository) {}

  list(householdId: string): Promise<Pet[]> {
    return this.repository.findAll(householdId);
  }

  async get(id: string): Promise<Pet> {
    const pet = await this.repository.findById(id);
    if (!pet) throw new NotFoundException(`Pet ${id} not found`);
    return pet;
  }

  create(dto: CreatePetDto): Promise<Pet> {
    return this.repository.insert(dto);
  }

  async update(id: string, dto: UpdatePetDto): Promise<Pet> {
    const pet = await this.repository.update(id, dto);
    if (!pet) throw new NotFoundException(`Pet ${id} not found`);
    return pet;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.remove(id);
    if (!removed) throw new NotFoundException(`Pet ${id} not found`);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { Pet } from '@pawlie/domain';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import type { CreatePetDto } from './dto/create-pet.dto';
import type { UpdatePetDto } from './dto/update-pet.dto';

interface PetRow {
  id: string;
  household_id: string;
  name: string;
  species: Pet['species'];
  breed: string | null;
  birth_date: string | null;
  sex: Pet['sex'];
  allergies: string[];
  microchip_id: string | null;
  created_at: Date;
}

const toPet = (row: PetRow): Pet => ({
  id: row.id,
  householdId: row.household_id,
  name: row.name,
  species: row.species,
  breed: row.breed,
  birthDate: row.birth_date,
  sex: row.sex,
  allergies: row.allergies ?? [],
  microchipId: row.microchip_id,
  createdAt: row.created_at.toISOString(),
});

@Injectable()
export class PetsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(householdId: string): Promise<Pet[]> {
    const { rows } = await this.pool.query<PetRow>(
      `SELECT id, household_id, name, species, breed, birth_date, sex, allergies, microchip_id, created_at
         FROM pets
        WHERE household_id = $1
        ORDER BY created_at`,
      [householdId],
    );
    return rows.map(toPet);
  }

  async findById(id: string): Promise<Pet | null> {
    const { rows } = await this.pool.query<PetRow>(
      `SELECT id, household_id, name, species, breed, birth_date, sex, allergies, microchip_id, created_at
         FROM pets
        WHERE id = $1`,
      [id],
    );
    const row = rows[0];
    return row ? toPet(row) : null;
  }

  async insert(dto: CreatePetDto): Promise<Pet> {
    const { rows } = await this.pool.query<PetRow>(
      `INSERT INTO pets (household_id, name, species, breed, birth_date, sex, allergies, microchip_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, household_id, name, species, breed, birth_date, sex, allergies, microchip_id, created_at`,
      [
        dto.householdId,
        dto.name,
        dto.species,
        dto.breed ?? null,
        dto.birthDate ?? null,
        dto.sex,
        JSON.stringify(dto.allergies ?? []),
        dto.microchipId ?? null,
      ],
    );
    return toPet(rows[0]!);
  }

  async update(id: string, dto: UpdatePetDto): Promise<Pet | null> {
    const assignments: string[] = [];
    const values: unknown[] = [];

    const set = (column: string, value: unknown) => {
      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    };

    if (dto.name !== undefined) set('name', dto.name);
    if (dto.species !== undefined) set('species', dto.species);
    if (dto.breed !== undefined) set('breed', dto.breed);
    if (dto.birthDate !== undefined) set('birth_date', dto.birthDate);
    if (dto.sex !== undefined) set('sex', dto.sex);
    if (dto.allergies !== undefined) set('allergies', JSON.stringify(dto.allergies));
    if (dto.microchipId !== undefined) set('microchip_id', dto.microchipId);

    if (assignments.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await this.pool.query<PetRow>(
      `UPDATE pets
          SET ${assignments.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, household_id, name, species, breed, birth_date, sex, allergies, microchip_id, created_at`,
      values,
    );
    const row = rows[0];
    return row ? toPet(row) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM pets WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

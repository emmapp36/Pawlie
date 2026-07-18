import { Inject, Injectable } from '@nestjs/common';
import type { WeightEntry } from '@pawlie/domain';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

interface WeightRow {
  id: string;
  pet_id: string;
  weight_kg: string;
  body_condition_score: string | null;
  measured_at: Date;
}

const toWeightEntry = (row: WeightRow): WeightEntry => ({
  id: row.id,
  petId: row.pet_id,
  weightKg: Number(row.weight_kg),
  bodyConditionScore:
    row.body_condition_score === null ? null : Number(row.body_condition_score),
  measuredAt: row.measured_at.toISOString(),
});

@Injectable()
export class WeightsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findByPet(petId: string, limit: number): Promise<WeightEntry[]> {
    const { rows } = await this.pool.query<WeightRow>(
      `SELECT id, pet_id, weight_kg, body_condition_score, measured_at
         FROM weight_entries
        WHERE pet_id = $1
        ORDER BY measured_at DESC
        LIMIT $2`,
      [petId, limit],
    );
    return rows.map(toWeightEntry);
  }
}

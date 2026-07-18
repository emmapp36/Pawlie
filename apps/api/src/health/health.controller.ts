import { Controller, Get, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Controller('healthz')
export class HealthController {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  @Get()
  async check(): Promise<{ status: 'ok'; database: 'up' | 'down' }> {
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ok', database: 'up' };
    } catch {
      return { status: 'ok', database: 'down' };
    }
  }
}

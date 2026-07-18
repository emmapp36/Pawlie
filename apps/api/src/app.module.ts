import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { PetsModule } from './pets/pets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    PetsModule,
    ChatModule,
  ],
})
export class AppModule {}

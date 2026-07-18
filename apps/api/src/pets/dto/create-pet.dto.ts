import type { Sex, Species } from '@pawlie/domain';
import {
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

const SPECIES: Species[] = ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'small_mammal'];
const SEXES: Sex[] = ['male', 'female', 'unknown'];

export class CreatePetDto {
  @IsUUID()
  householdId!: string;

  @IsString()
  @Length(1, 80)
  name!: string;

  @IsIn(SPECIES)
  species!: Species;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  breed?: string;

  @IsOptional()
  @IsISO8601()
  birthDate?: string;

  @IsIn(SEXES)
  sex!: Sex;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  @Length(1, 40)
  microchipId?: string;
}

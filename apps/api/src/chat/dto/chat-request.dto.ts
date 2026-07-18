import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class ChatRequestDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsString()
  @Length(1, 4000)
  message!: string;
}

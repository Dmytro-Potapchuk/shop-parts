import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    example: 'jankowalski',
    description: 'Nazwa użytkownika (login)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'MocneHaslo123!',
    description: 'Hasło użytkownika (min. 6 znaków)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // UWAGA: Poniższe pole jest ryzykowne! Zastanów się, czy na pewno chcesz pozwolić na ustawianie roli przy rejestracji.
  // Jeśli tak, endpoint powinien być BARDZO dobrze zabezpieczony.
  // Domyślnie, użytkownicy powinni być tworzeni z rolą 'client'.
  @ApiProperty({
    example: 'client',
    enum: ['admin', 'client'],
    description: 'Rola użytkownika (opcjonalnie, domyślnie "client")',
    required: false,
  })
  @IsOptional()
  @IsEnum(['admin', 'client'])
  role?: 'admin' | 'client';
}

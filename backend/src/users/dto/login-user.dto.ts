import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    example: 'jankowalski',
    description: 'Nazwa użytkownika (login)',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'MocneHaslo123!', description: 'Hasło użytkownika' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

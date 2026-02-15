import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'Unikalne ID użytkownika' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'jankowalski',
    description: 'Nazwa użytkownika (login)',
  })
  @Column({ unique: true })
  username: string;

  // Hasło NIE powinno być zwracane przez API, więc nie dodajemy @ApiProperty()
  // lub jeśli musimy (np. dla wewnętrznych DTO), to z odpowiednią adnotacją o wykluczeniu
  @Column()
  password: string;

  @ApiProperty({
    example: 'client',
    enum: ['admin', 'client'],
    description: 'Rola użytkownika',
  })
  @Column({ default: 'client' })
  role: 'admin' | 'client';

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshToken: string | null;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { AuthModule } from '../auth/auth.module'; // ⬅ DODAJ

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule, // ⬅ TO JEST KLUCZ
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

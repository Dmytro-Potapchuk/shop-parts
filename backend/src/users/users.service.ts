import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    username: string,
    password: string,
    role: 'admin' | 'client' = 'client',
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      role,
    });

    return this.usersRepository.save(user);
  }

  async login(username: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Niepoprawne dane logowania');
    }

    const payload = { sub: user.id, role: user.role };

    // ACCESS TOKEN
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    // REFRESH TOKEN
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    console.log('ACCESS TOKEN:', accessToken);
    console.log('REFRESH TOKEN:', refreshToken);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    await this.usersRepository.update(user.id, {
      refreshToken: hashedRefresh,
    });

    return {
      accessToken,
      refreshToken,
      role: user.role,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isMatch) {
        throw new UnauthorizedException();
      }

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, role: user.role },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      );

      console.log('NEW ACCESS TOKEN:', newAccessToken);

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Nieprawidłowy refresh token');
    }
  }

  async logout(userId: number) {
    await this.usersRepository.update(userId, {
      refreshToken: null,
    });
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { DatabaseModule } from './config/database.module';
import { PartsModule } from './parts/parts.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {CustomThrottlerGuard} from "./common/guards/throttler.guard";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /**
     * GLOBAL RATE LIMIT
     * 2 requesty / 10 sekund / IP
     */
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: process.env.NODE_ENV === 'test' ? 0 : 10,
          limit: process.env.NODE_ENV === 'test' ? 9999 : 2,
        },
      ],
    }),

    DatabaseModule,
    AuthModule,
    UsersModule,
    PartsModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    /**
     * GLOBAL RATE LIMIT GUARD
     */
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}

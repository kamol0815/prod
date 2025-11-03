import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HashingService } from '../../../../shared/utils/hashing/hashing.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [HashingService],
  exports: [],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Session } from 'src/auth/entities/session.entity';

@Module({
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [UsersController],
})
export class UsersModule {}

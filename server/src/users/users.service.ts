import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Session } from 'src/auth/entities/session.entity';
import { DeleteResult, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Session) private sessionsRepository: Repository<Session>,
  ) {}

  public getUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { id: id },
    });
  }

  public async deleteUserById(id: any): Promise<void> {
    await this.sessionsRepository.delete({
      user: {
        id: id,
      },
    });
    await this.usersRepository.delete({
      id: id,
    });
  }
}

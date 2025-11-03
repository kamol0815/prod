import { Injectable } from '@nestjs/common';
import { BotContext } from './bot-core.service';
import { UserModel } from '../../../shared/database/models/user.model';

@Injectable()
export class UserService {
  async createUserIfNotExist(ctx: BotContext): Promise<void> {
    // ... existing createUserIfNotExist implementation ...
  }

  async getUser(telegramId: number) {
    return UserModel.findOne({ telegramId });
  }
}

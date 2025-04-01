import { Module } from '@nestjs/common';

import { CommonService } from '../common/common.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CommonService],
  exports: [UserService],
})
export class UserModule {}

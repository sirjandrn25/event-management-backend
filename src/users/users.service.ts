import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private service: PrismaService) {}

  findAll() {
    return this.service.user.findMany();
  }

  findOne(id: string) {
    return this.service.user.findUnique({
      where: {
        id,
      },
    });
  }

  remove(id: string) {
    return this.service.user.delete({
      where: {
        id,
      },
    });
  }
}

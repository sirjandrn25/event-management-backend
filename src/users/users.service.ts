import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private service: PrismaService) {}

  findAll() {
    return this.service.user.findMany();
  }

  search(search: string) {
    return this.service.user.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });
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

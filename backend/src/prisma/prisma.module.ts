import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // exported globally so no module needs to re-import PrismaModule
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

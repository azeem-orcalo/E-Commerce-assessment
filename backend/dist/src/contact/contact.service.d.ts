import { ContactStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
export declare class ContactService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateContactDto): import(".prisma/client").Prisma.Prisma__ContactQueryClient<{
        id: string;
        name: string;
        email: string;
        subject: string;
        message: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        email: string;
        subject: string;
        message: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateStatus(id: string, status: ContactStatus): import(".prisma/client").Prisma.Prisma__ContactQueryClient<{
        id: string;
        name: string;
        email: string;
        subject: string;
        message: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}

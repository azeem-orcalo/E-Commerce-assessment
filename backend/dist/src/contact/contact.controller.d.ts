import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    create(dto: CreateContactDto): import(".prisma/client").Prisma.Prisma__ContactQueryClient<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        message: string;
        subject: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        message: string;
        subject: string;
    }[]>;
    updateStatus(id: string, dto: UpdateContactStatusDto): import(".prisma/client").Prisma.Prisma__ContactQueryClient<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        message: string;
        subject: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}

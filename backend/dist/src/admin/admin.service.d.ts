import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOrders(page: number, limit: number, status?: OrderStatus): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            items: ({
                product: {
                    id: string;
                    name: string;
                    imageUrl: string | null;
                };
            } & {
                id: string;
                orderId: string;
                productId: string;
                quantity: number;
                priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
            })[];
        } & {
            id: string;
            userId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            stripePaymentIntentId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        items: ({
            product: {
                id: string;
                name: string;
                imageUrl: string | null;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
        id: string;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        stripePaymentIntentId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getUsers(page: number, limit: number, search?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            _count: {
                orders: number;
            };
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            city: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    updateUser(userId: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        city: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    deleteUser(userId: string): Promise<{
        message: string;
    }>;
    getDashboardStats(): Promise<{
        totalRevenue: number;
        totalOrders: number;
        activeStock: number;
        ordersByStatus: {
            status: import(".prisma/client").$Enums.OrderStatus;
            count: number;
        }[];
        topProducts: {
            name: string;
            unitsSold: number;
        }[];
    }>;
}

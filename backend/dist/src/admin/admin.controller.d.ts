import { OrderStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getOrders(page?: string, limit?: string, status?: OrderStatus): Promise<{
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
                productId: string;
                orderId: string;
                quantity: number;
                priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            discountPercent: import("@prisma/client-runtime-utils").Decimal | null;
            userId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            originalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            stripePaymentIntentId: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<({
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
            productId: string;
            orderId: string;
            quantity: number;
            priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        discountPercent: import("@prisma/client-runtime-utils").Decimal | null;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        originalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        stripePaymentIntentId: string | null;
    }) | null>;
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
    getUsers(page?: string, limit?: string, search?: string): Promise<{
        data: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            city: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            _count: {
                orders: number;
            };
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    updateUser(userId: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        city: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    deleteUser(userId: string): Promise<{
        message: string;
    }>;
}

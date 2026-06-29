import { OrderStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
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
            userId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
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
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
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
            product: {
                id: string;
                name: string;
                price: import("@prisma/client-runtime-utils").Decimal;
                imageUrl: string | null;
            } | undefined;
            totalSold: number;
        }[];
    }>;
}

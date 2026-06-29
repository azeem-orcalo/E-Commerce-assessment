import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    checkout(userId: string, dto: CreateOrderDto): Promise<{
        orderId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        totalAmount: string;
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
    }>;
    getOrders(userId: string): Promise<({
        items: ({
            product: {
                id: string;
                name: string;
                price: import("@prisma/client-runtime-utils").Decimal;
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
    })[]>;
    getOrder(userId: string, orderId: string): Promise<{
        items: ({
            product: {
                id: string;
                name: string;
                price: import("@prisma/client-runtime-utils").Decimal;
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
    }>;
}

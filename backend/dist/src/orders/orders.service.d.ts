import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly config;
    private readonly stripe;
    constructor(prisma: PrismaService, config: ConfigService);
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
            quantity: number;
            priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
        })[];
    }>;
    private checkoutWithCod;
    private checkoutWithCard;
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
            quantity: number;
            priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        userId: string;
        updatedAt: Date;
        createdAt: Date;
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
            quantity: number;
            priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        userId: string;
        updatedAt: Date;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        stripePaymentIntentId: string | null;
    }>;
}

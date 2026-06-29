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
        originalAmount: string | null;
        discountPercent: number | null;
        discountAmount: string | null;
        offerTitle: string | null;
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
            orderId: string;
            quantity: number;
            priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
        id: string;
        userId: string;
        updatedAt: Date;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        originalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        discountPercent: import("@prisma/client-runtime-utils").Decimal | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
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
        userId: string;
        updatedAt: Date;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        originalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        discountPercent: import("@prisma/client-runtime-utils").Decimal | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        stripePaymentIntentId: string | null;
    }>;
}

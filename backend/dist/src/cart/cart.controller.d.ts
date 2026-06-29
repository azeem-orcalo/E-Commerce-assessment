import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(userId: string): Promise<{
        items: never[];
        total: string;
    } | {
        total: string;
        items: ({
            product: {
                id: string;
                name: string;
                category: {
                    id: string;
                    name: string;
                };
                price: import("@prisma/client-runtime-utils").Decimal;
                imageUrl: string | null;
                stock: number;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            chosenColor: string;
            chosenSize: string;
            cartId: string;
        })[];
        id: string;
        updatedAt: Date;
        userId: string;
    }>;
    addItem(userId: string, dto: AddCartItemDto): Promise<{
        product: {
            id: string;
            name: string;
            category: {
                id: string;
                name: string;
            };
            price: import("@prisma/client-runtime-utils").Decimal;
            imageUrl: string | null;
            stock: number;
        };
    } & {
        id: string;
        productId: string;
        quantity: number;
        chosenColor: string;
        chosenSize: string;
        cartId: string;
    }>;
    updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<({
        product: {
            id: string;
            name: string;
            category: {
                id: string;
                name: string;
            };
            price: import("@prisma/client-runtime-utils").Decimal;
            imageUrl: string | null;
            stock: number;
        };
    } & {
        id: string;
        productId: string;
        quantity: number;
        chosenColor: string;
        chosenSize: string;
        cartId: string;
    }) | {
        deleted: boolean;
    }>;
    removeItem(userId: string, itemId: string): Promise<{
        deleted: boolean;
    }>;
    clearCart(userId: string): Promise<{
        deleted: number;
    }>;
}

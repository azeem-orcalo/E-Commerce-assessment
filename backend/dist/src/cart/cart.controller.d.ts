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
                price: import("@prisma/client-runtime-utils").Decimal;
                imageUrl: string | null;
                stock: number;
                category: {
                    id: string;
                    name: string;
                };
            };
        } & {
            id: string;
            cartId: string;
            productId: string;
            quantity: number;
            chosenColor: string;
            chosenSize: string;
        })[];
        id: string;
        userId: string;
        updatedAt: Date;
    }>;
    addItem(userId: string, dto: AddCartItemDto): Promise<{
        product: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            imageUrl: string | null;
            stock: number;
            category: {
                id: string;
                name: string;
            };
        };
    } & {
        id: string;
        cartId: string;
        productId: string;
        quantity: number;
        chosenColor: string;
        chosenSize: string;
    }>;
    updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<({
        product: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            imageUrl: string | null;
            stock: number;
            category: {
                id: string;
                name: string;
            };
        };
    } & {
        id: string;
        cartId: string;
        productId: string;
        quantity: number;
        chosenColor: string;
        chosenSize: string;
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

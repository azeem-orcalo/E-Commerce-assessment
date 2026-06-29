export declare enum ProductSortBy {
    FEATURED = "featured",
    BEST_SELLER = "best_seller",
    PRICE_ASC = "price_asc",
    PRICE_DESC = "price_desc",
    NEWEST = "newest"
}
export declare class QueryProductsDto {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: ProductSortBy;
    page?: number;
    limit?: number;
}

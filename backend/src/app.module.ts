import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OffersModule } from './offers/offers.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { ContactModule } from './contact/contact.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,   // @Global() — PrismaService available everywhere
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    FavoritesModule,
    OrdersModule,
    AdminModule,
    ReviewsModule,
    OffersModule,
    SuggestionsModule,
    ContactModule,
  ],
  providers: [
    // Guard order matters: JWT validates identity first, Roles checks authorization second
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

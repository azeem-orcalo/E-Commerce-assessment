"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const BCRYPT_ROUNDS = 10;
async function main() {
    const pool = new pg_1.Pool({ connectionString: process.env['DATABASE_URL'] });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new client_1.PrismaClient({ adapter });
    try {
        console.log('🌱 Starting seed...\n');
        const adminHash = await bcrypt.hash('Admin1234!', BCRYPT_ROUNDS);
        const customerHash = await bcrypt.hash('Customer1234!', BCRYPT_ROUNDS);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@store.com' },
            update: {
                passwordHash: adminHash,
                firstName: 'Store',
                lastName: 'Admin',
                phone: '+447700900001',
                city: 'London',
                address: '1 Admin Lane',
                role: client_1.Role.ADMIN,
            },
            create: {
                email: 'admin@store.com',
                passwordHash: adminHash,
                firstName: 'Store',
                lastName: 'Admin',
                phone: '+447700900001',
                city: 'London',
                address: '1 Admin Lane',
                role: client_1.Role.ADMIN,
            },
        });
        console.log(`✅ Admin user:    ${admin.email}`);
        const customer = await prisma.user.upsert({
            where: { email: 'customer@store.com' },
            update: {
                passwordHash: customerHash,
                firstName: 'Jane',
                lastName: 'Doe',
                phone: '+447700900002',
                city: 'Manchester',
                address: '42 Customer Street',
            },
            create: {
                email: 'customer@store.com',
                passwordHash: customerHash,
                firstName: 'Jane',
                lastName: 'Doe',
                phone: '+447700900002',
                city: 'Manchester',
                address: '42 Customer Street',
                role: client_1.Role.CUSTOMER,
            },
        });
        console.log(`✅ Customer user: ${customer.email}\n`);
        const [casual, formal, active, accessories] = await Promise.all([
            prisma.category.upsert({
                where: { name: 'Casual Wear' },
                update: {},
                create: { name: 'Casual Wear' },
            }),
            prisma.category.upsert({
                where: { name: 'Formal Wear' },
                update: {},
                create: { name: 'Formal Wear' },
            }),
            prisma.category.upsert({
                where: { name: 'Activewear' },
                update: {},
                create: { name: 'Activewear' },
            }),
            prisma.category.upsert({
                where: { name: 'Accessories' },
                update: {},
                create: { name: 'Accessories' },
            }),
        ]);
        console.log('✅ Categories: Casual Wear, Formal Wear, Activewear, Accessories\n');
        const products = [
            {
                name: 'Premium Cotton Classic Tee',
                description: 'Crafted from 100% ring-spun premium cotton, this classic tee delivers unmatched softness and breathability. Pre-shrunk for a lasting fit, it features reinforced stitching at the collar and cuffs for everyday durability.',
                price: 24.99,
                stock: 120,
                material: '100% Ring-Spun Premium Cotton',
                imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
                categoryId: casual.id,
                variants: {
                    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                    colors: ['White', 'Black', 'Navy Blue', 'Heather Grey', 'Forest Green'],
                },
            },
            {
                name: 'Slim-Fit Stretch Chinos',
                description: 'These versatile chinos are woven from a premium cotton-elastane blend, giving you the polished look of traditional chinos with added comfort and freedom of movement. Perfect for the office or a weekend out.',
                price: 54.99,
                stock: 75,
                material: '98% Cotton, 2% Elastane',
                imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
                categoryId: casual.id,
                variants: {
                    sizes: ['28', '30', '32', '34', '36', '38'],
                    colors: ['Khaki', 'Olive', 'Navy', 'Stone', 'Charcoal'],
                },
            },
            {
                name: 'Relaxed Linen Summer Shirt',
                description: 'Woven from 100% pure linen sourced from Belgian flax, this shirt develops a beautiful lived-in texture with every wear. The relaxed cut and breathable weave make it the ideal companion for warm days.',
                price: 44.99,
                stock: 60,
                material: '100% Pure Belgian Linen',
                imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
                categoryId: casual.id,
                variants: {
                    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                    colors: ['Natural White', 'Sky Blue', 'Sage Green', 'Sand'],
                },
            },
            {
                name: 'Egyptian Cotton Dress Shirt',
                description: 'Tailored from long-staple Egyptian cotton with a thread count of 160, this dress shirt offers a silky smooth finish and exceptional wrinkle resistance. A spread collar and French placket elevate any formal ensemble.',
                price: 79.99,
                stock: 50,
                material: '100% Long-Staple Egyptian Cotton',
                imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80',
                categoryId: formal.id,
                variants: {
                    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                    colors: ['Crisp White', 'Light Blue', 'Pale Pink', 'Ecru'],
                },
            },
            {
                name: 'Wool-Blend Tailored Blazer',
                description: 'A modern single-breasted blazer cut from a premium Italian wool-polyester blend. Half-lined for breathability, it features a notched lapel, three-button cuffs, and a structured shoulder for a sharp, tailored silhouette.',
                price: 149.99,
                stock: 30,
                material: '60% Wool, 40% Recycled Polyester',
                imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
                categoryId: formal.id,
                variants: {
                    sizes: ['36R', '38R', '40R', '42R', '44R', '46R'],
                    colors: ['Charcoal Grey', 'Navy Blue', 'Camel', 'Black'],
                },
            },
            {
                name: 'Slim-Cut Dress Trousers',
                description: 'These classic dress trousers are constructed from a fine wool-polyester twill that drapes elegantly and resists creasing. A flat-front cut and tapered leg deliver a contemporary, polished silhouette for board meetings and black-tie events alike.',
                price: 89.99,
                stock: 45,
                material: '55% Wool, 45% Polyester Twill',
                imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
                categoryId: formal.id,
                variants: {
                    sizes: ['28', '30', '32', '34', '36', '38'],
                    colors: ['Charcoal', 'Black', 'Dark Navy', 'Grey Melange'],
                },
            },
            {
                name: 'DryFit Performance Running Tee',
                description: 'Engineered for endurance, this running tee is made from 100% recycled polyester with moisture-wicking DryFit technology. Flatlock seams prevent chafing on long runs, while the mesh panel back promotes ventilation during high-intensity training.',
                price: 34.99,
                stock: 100,
                material: '100% Recycled Polyester (DryFit)',
                imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
                categoryId: active.id,
                variants: {
                    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                    colors: ['Black', 'Electric Blue', 'Signal Orange', 'White', 'Dark Grey'],
                },
            },
            {
                name: 'High-Waist Performance Leggings',
                description: 'Four-way stretch leggings engineered with a 80/20 polyester-spandex blend for unrestricted movement. A high-rise waistband with a hidden pocket provides secure storage, while the squat-proof fabric keeps you confident through every rep.',
                price: 59.99,
                stock: 85,
                material: '80% Polyester, 20% Spandex',
                imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
                categoryId: active.id,
                variants: {
                    sizes: ['XS', 'S', 'M', 'L', 'XL'],
                    colors: ['Black', 'Midnight Navy', 'Dusty Rose', 'Olive Green'],
                },
            },
            {
                name: 'Lightweight Windproof Track Jacket',
                description: 'A packable, windproof track jacket crafted from 100% ripstop nylon. Weighing just 220g, it compresses into its own chest pocket for effortless portability. Taped seams and a DWR coating ensure weather protection on unpredictable training days.',
                price: 74.99,
                stock: 55,
                material: '100% Ripstop Nylon (DWR Coated)',
                imageUrl: 'https://images.unsplash.com/photo-1539533018257-23bc6ce37f83?w=600&q=80',
                categoryId: active.id,
                variants: {
                    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                    colors: ['Black', 'Cobalt Blue', 'Forest Green', 'Burgundy'],
                },
            },
            {
                name: 'Full-Grain Leather Belt',
                description: 'Saddle-stitched by hand from a single piece of full-grain cowhide leather, this belt develops a rich patina with age. A solid brass roller-buckle with antique finish adds understated elegance to any outfit, formal or casual.',
                price: 39.99,
                stock: 90,
                material: 'Full-Grain Vegetable-Tanned Cowhide',
                imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
                categoryId: accessories.id,
                variants: {
                    sizes: ['28', '30', '32', '34', '36', '38', '40'],
                    colors: ['Tan', 'Dark Brown', 'Black', 'Cognac'],
                },
            },
            {
                name: 'Merino Wool Winter Scarf',
                description: 'Woven from ultra-fine 18.5-micron merino wool sourced from New Zealand, this scarf is sumptuously soft yet lightweight. Its natural temperature-regulating properties keep you warm in winter and cool in transitional seasons without any itch.',
                price: 49.99,
                stock: 70,
                material: '100% Fine Merino Wool (18.5 micron)',
                imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80',
                categoryId: accessories.id,
                variants: {
                    sizes: ['One Size'],
                    colors: ['Camel', 'Charcoal Grey', 'Burgundy', 'Cobalt Blue', 'Ivory'],
                },
            },
            {
                name: 'Waxed Canvas Tote Bag',
                description: 'Constructed from 12oz waxed cotton canvas, this tote transitions seamlessly from farmers markets to office commutes. Reinforced at all stress points with double-stitching and solid brass rivets, it features a sturdy cotton webbing handle and an interior zip pocket.',
                price: 44.99,
                stock: 40,
                material: '12oz Waxed Cotton Canvas',
                imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80',
                categoryId: accessories.id,
                variants: {
                    sizes: ['One Size'],
                    colors: ['Olive Wax', 'Navy Wax', 'Dark Tan', 'Black Wax'],
                },
            },
        ];
        let created = 0;
        let updated = 0;
        for (const p of products) {
            const existing = await prisma.product.findFirst({ where: { name: p.name } });
            const variantsJson = p.variants;
            const data = {
                description: p.description,
                price: p.price,
                stock: p.stock,
                material: p.material,
                imageUrl: p.imageUrl,
                variants: variantsJson,
                categoryId: p.categoryId,
                deletedAt: null,
            };
            if (existing) {
                await prisma.product.update({ where: { id: existing.id }, data });
                updated++;
                process.stdout.write(`  🔄 ${p.name} (updated)\n`);
            }
            else {
                await prisma.product.create({ data: { name: p.name, ...data } });
                created++;
                process.stdout.write(`  ✅ ${p.name} (created)\n`);
            }
        }
        console.log(`\n✅ Products seeded — ${created} created, ${updated} updated\n`);
        const offersData = [
            {
                title: 'Summer Sale — Up to 30% Off',
                description: 'Beat the heat with our biggest summer discounts. Selected tops, dresses, and lightweight outerwear all at reduced prices.',
                discountPercent: 30,
                startDate: new Date('2026-06-01T00:00:00Z'),
                endDate: new Date('2026-07-31T23:59:59Z'),
                isActive: true,
                imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
            },
            {
                title: 'New Arrivals — 15% Off Everything',
                description: 'Fresh drops just landed. Get 15% off all new season pieces — limited time only.',
                discountPercent: 15,
                startDate: new Date('2026-06-15T00:00:00Z'),
                endDate: new Date('2026-07-15T23:59:59Z'),
                isActive: true,
                imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
            },
            {
                title: 'Weekend Flash Deal — 20% Off',
                description: 'This weekend only — take 20% off sitewide. No code needed, discount applied at checkout.',
                discountPercent: 20,
                startDate: new Date('2026-06-28T00:00:00Z'),
                endDate: new Date('2026-07-20T23:59:59Z'),
                isActive: true,
                imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
            },
        ];
        let offersCreated = 0;
        let offersUpdated = 0;
        for (const o of offersData) {
            const existing = await prisma.offer.findFirst({ where: { title: o.title } });
            if (existing) {
                await prisma.offer.update({ where: { id: existing.id }, data: o });
                offersUpdated++;
                process.stdout.write(`  🔄 ${o.title} (updated)\n`);
            }
            else {
                await prisma.offer.create({ data: o });
                offersCreated++;
                process.stdout.write(`  ✅ ${o.title} (created)\n`);
            }
        }
        console.log(`\n✅ Offers seeded — ${offersCreated} created, ${offersUpdated} updated\n`);
        console.log('─'.repeat(50));
        console.log('Seed complete!\n');
        console.log('Login credentials:');
        console.log('  Admin    → admin@store.com    / Admin1234!');
        console.log('  Customer → customer@store.com / Customer1234!');
        console.log('─'.repeat(50));
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map
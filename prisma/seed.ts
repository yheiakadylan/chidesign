import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log(`🧹 Cleaning database...`)

    // Order of deletion matters due to foreign key constraints
    await prisma.activity.deleteMany({});
    await prisma.idea.deleteMany({});
    await prisma.price.deleteMany({});
    await prisma.productType.deleteMany({});
    await prisma.urgentType.deleteMany({});
    await prisma.board.deleteMany({});
    await prisma.discount.deleteMany({});
    await prisma.file.deleteMany({});
    await prisma.package.deleteMany({});
    await prisma.setting.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});

    console.log(`🌱 Start seeding real-world data...`)

    // 1. Roles
    const ROLES = ['ADMIN', 'CLIENT_MANAGER', 'CLIENT_USER', 'DESIGNER'];
    for (const roleName of ROLES) {
        await prisma.role.create({ data: { name: roleName } });
    }

    // 2. Users
    // --- Cheese Design Team (Provider) ---
    const admin = await prisma.user.create({
        data: {
            email: 'admin@CheeseDesign.io',
            full_name: 'Admin - Cheese Design Master',
            is_supper_admin: true,
            roles: { connect: { name: 'ADMIN' } }
        }
    });

    const designer1 = await prisma.user.create({
        data: {
            email: 'designer.nguyen@CheeseDesign.io',
            full_name: 'Nguyen Designer',
            roles: { connect: { name: 'DESIGNER' } }
        }
    });

    const designer2 = await prisma.user.create({
        data: {
            email: 'designer.tran@CheeseDesign.io',
            full_name: 'Tran Designer',
            roles: { connect: { name: 'DESIGNER' } }
        }
    });

    // --- Customer Side (Shopify Store) ---
    const clientManager = await prisma.user.create({
        data: {
            email: 'haitrinh2605204@gmail.com',
            full_name: 'Lê Bảo Vi (Store Manager)',
            normal_pink: 2500.50,
            monthly_pink: 500.00,
            roles: { connect: { name: 'CLIENT_MANAGER' } }
        }
    });

    const clientStaff = await prisma.user.create({
        data: {
            email: 'researcher1@shopify-store.com',
            full_name: 'Staff - Researcher Alex',
            managerId: clientManager.id,
            roles: { connect: { name: 'CLIENT_USER' } }
        }
    });

    // 3. Product Types & Prices
    const productTypesData = [
        {
            title: 'T-shirt (Standard)',
            prices: [
                { designType: 'NEW', pink: 1.5 },
                { designType: 'CLONE', pink: 1.0 },
                { designType: 'REDESIGN', pink: 1.2 }
            ]
        },
        {
            title: 'Hoodie (Heavy)',
            prices: [
                { designType: 'NEW', pink: 2.0 },
                { designType: 'CLONE', pink: 1.5 },
                { designType: 'REDESIGN', pink: 1.8 }
            ]
        },
        {
            title: 'Coffee Mug 11oz',
            prices: [
                { designType: 'NEW', pink: 1.0 },
                { designType: 'CLONE', pink: 0.8 },
                { designType: 'REDESIGN', pink: 0.9 }
            ]
        },
        {
            title: 'Canvas Wall Art',
            prices: [
                { designType: 'NEW', pink: 3.5 },
                { designType: 'CLONE', pink: 2.5 },
                { designType: 'REDESIGN', pink: 3.0 }
            ]
        }
    ];

    const productTypes: any[] = [];
    for (const pt of productTypesData) {
        const created = await prisma.productType.create({
            data: {
                title: pt.title,
                prices: {
                    create: pt.prices
                }
            }
        });
        productTypes.push(created);
    }

    // 4. Packages
    await prisma.package.createMany({
        data: [
            { title: 'Bronze Starter (50 PINK)', qty: 50, amount: 75, type: 'normal' },
            { title: 'Silver Pro (200 PINK)', qty: 200, amount: 280, type: 'normal' },
            { title: 'Gold Enterprise (1000 PINK)', qty: 1000, amount: 1300, type: 'normal' },
            { title: 'Monthly Lite (100 PINK)', qty: 100, amount: 140, type: 'monthly' },
            { title: 'Monthly Growth (500 PINK)', qty: 500, amount: 650, type: 'monthly' },
        ]
    });

    // 5. Boards
    const mainBoard = await prisma.board.create({
        data: {
            title: 'Viking Store - Q1 Designs',
            clientId: clientManager.id,
            checked_terms: true,
            isPublic: true,
            defaultDesignType: 'CLONE',
            readMe: 'Ghi chú: Luôn sử dụng font chữ Inter. File xuất ra định dạng .PNG transparent 300dpi.',
            productTypes: {
                connect: [{ id: productTypes[0].id }, { id: productTypes[1].id }]
            }
        }
    });

    const sideBoard = await prisma.board.create({
        data: {
            title: 'Home Decor Project',
            clientId: clientManager.id,
            checked_terms: true,
            isPublic: false,
            productTypes: {
                connect: [{ id: productTypes[2].id }, { id: productTypes[3].id }]
            }
        }
    });

    // 6. Ideas (Tasks) with realistic progress
    const tasks = [
        {
            sku: 'VIK-2024-001',
            title: 'Viking Warrior with Axe Illustration',
            status: 'DONE',
            designType: 'NEW',
            pink: 1.5,
            is_urgent: true,
            deadline: new Date(Date.now() + 86400000), // tomorrow
            authorId: clientStaff.id,
            designerId: designer1.id,
            boardId: mainBoard.id,
            productTypeId: productTypes[0].id,
            design_urls: 'https://drive.google.com/file/d/viking_axe_final.zip'
        },
        {
            sku: 'VIK-2024-002',
            title: 'Cute Scandinavian Pattern Hoodie',
            status: 'IN_REVIEW',
            designType: 'CLONE',
            pink: 1.5,
            is_urgent: false,
            authorId: clientStaff.id,
            designerId: designer1.id,
            boardId: mainBoard.id,
            productTypeId: productTypes[1].id,
            design_urls: 'https://www.dropbox.com/s/sample_hoodie_mockup.png'
        },
        {
            sku: 'VIK-2024-003',
            title: 'Minimalist Coffee Quote Mug',
            status: 'DOING',
            designType: 'REDESIGN',
            pink: 0.9,
            is_urgent: false,
            authorId: clientManager.id,
            designerId: designer2.id,
            boardId: sideBoard.id,
            productTypeId: productTypes[2].id,
        },
        {
            sku: 'VIK-2024-004',
            title: 'Abstract Mountain Landscape Canvas',
            status: 'TODO',
            designType: 'NEW',
            pink: 3.5,
            is_urgent: true,
            authorId: clientManager.id,
            boardId: sideBoard.id,
            productTypeId: productTypes[3].id,
        },
        {
            sku: 'VIK-2024-005',
            title: 'Funny Programmer Cat T-shirt',
            status: 'NEW',
            designType: 'CLONE',
            pink: 1.0,
            is_urgent: false,
            authorId: clientStaff.id,
            boardId: mainBoard.id,
            productTypeId: productTypes[0].id,
        }
    ];

    for (const t of tasks) {
        await prisma.idea.create({ data: t });
    }

    // 7. Activity Logs
    const createdTask = await prisma.idea.findUnique({ where: { sku: 'VIK-2024-001' } });
    const doingTask = await prisma.idea.findUnique({ where: { sku: 'VIK-2024-003' } });

    await prisma.activity.createMany({
        data: [
            {
                type: 'charged_pink',
                message: 'Package Purchase: Silver Pro (200 PINK)',
                message2: 'Silver Pro',
                userId: clientManager.id,
                createdAt: new Date(Date.now() - 172800000)
            },
            {
                type: 'task_created',
                message: 'Created task: Viking Warrior with Axe Illustration',
                userId: clientStaff.id,
                ideaId: createdTask?.id,
                boardId: mainBoard.id
            },
            {
                type: 'status_change',
                message: 'Status updated to DONE',
                userId: designer1.id,
                ideaId: createdTask?.id,
                boardId: mainBoard.id
            },
            {
                type: 'comment',
                message: 'Please make the colors more vibrant for the print.',
                userId: clientManager.id,
                ideaId: doingTask?.id,
                boardId: sideBoard.id
            }
        ]
    });

    console.log(`✅ Success: Database cleared and seeded with real-world scenarios!`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

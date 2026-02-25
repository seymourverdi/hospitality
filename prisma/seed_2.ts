import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error", "warn"] });

const adminPerms = { all: true } satisfies Prisma.InputJsonValue;
const cashierPerms = { pos: true, payments: true } satisfies Prisma.InputJsonValue;
const waiterPerms = { pos: true, tables: true } satisfies Prisma.InputJsonValue;

async function main() {
  console.log("Seed started");

  await prisma.$transaction(async (tx) => {
    // 1) Roles
    const adminRole =
      (await tx.role.findFirst({ where: { name: "Admin" } })) ??
      (await tx.role.create({
        data: {
          name: "Admin",
          permissionsJson: adminPerms,
        },
      }));

    const cashierRole =
      (await tx.role.findFirst({ where: { name: "Cashier" } })) ??
      (await tx.role.create({
        data: {
          name: "Cashier",
          permissionsJson: cashierPerms,
        },
      }));

    const waiterRole =
      (await tx.role.findFirst({ where: { name: "Waiter" } })) ??
      (await tx.role.create({
        data: {
          name: "Waiter",
          permissionsJson: waiterPerms,
        },
      }));

    // 2) Location
    const location =
      (await tx.restaurantLocation.findFirst({
        where: { OR: [{ code: "DEMO" }, { name: "Demo Restaurant" }] },
      })) ??
      (await tx.restaurantLocation.create({
        data: {
          name: "Demo Restaurant",
          code: "DEMO",
          timezone: "Europe/Kiev",
          address: "Demo address",
          phone: "+380000000000",
          isActive: true,
        },
      }));

    // 3) KDS Station
    // Note: model name in schema might be KDSStation (Prisma client uses same model name).
    // If your generated client exposes it as kDSStation (rare), rename tx.kDSStation accordingly.
    const kdsStation =
      (await (tx as any).KDSStation?.findFirst?.({
        where: { locationId: location.id, OR: [{ code: "KDS-1" }, { name: "Kitchen" }] },
      })) ??
      (await (tx as any).KDSStation?.create?.({
        data: {
          locationId: location.id,
          name: "Kitchen",
          code: "KDS-1",
          sortOrder: 1,
          isActive: true,
        },
      })) ??
      // fallback if your model is named differently (e.g. kDSStation)
      ((await (tx as any).kDSStation?.findFirst?.({
        where: { locationId: location.id, OR: [{ code: "KDS-1" }, { name: "Kitchen" }] },
      })) ??
        (await (tx as any).kDSStation?.create?.({
          data: {
            locationId: location.id,
            name: "Kitchen",
            code: "KDS-1",
            sortOrder: 1,
            isActive: true,
          },
        })));

    const kdsStationId: number | null = kdsStation?.id ?? null;

    // 4) Terminals
    const posTerminal =
      (await tx.terminal.findFirst({
        where: { locationId: location.id, OR: [{ code: "POS-1" }, { name: "Front POS" }] },
      })) ??
      (await tx.terminal.create({
        data: {
          locationId: location.id,
          name: "Front POS",
          code: "POS-1",
          deviceType: "POS" as any, // enum/string-safe
          kdsStationId: null,
          isActive: true,
        },
      }));

    await tx.terminal.findFirst({
      where: { locationId: location.id, OR: [{ code: "KDS-T1" }, { name: "Kitchen Display" }] },
    }) ??
      (await tx.terminal.create({
        data: {
          locationId: location.id,
          name: "Kitchen Display",
          code: "KDS-T1",
          deviceType: "KDS" as any, // enum/string-safe
          kdsStationId,
          isActive: true,
        },
      }));

    // 5) Users (PIN)
    const admin =
      (await tx.user.findFirst({ where: { locationId: location.id, pinCode: "1111" } })) ??
      (await tx.user.create({
        data: {
          locationId: location.id,
          roleId: adminRole.id,
          firstName: "Admin",
          lastName: "User",
          pinCode: "1111",
          email: "admin@example.com",
          isActive: true,
        },
      }));

    await tx.user.findFirst({ where: { locationId: location.id, pinCode: "2222" } }) ??
      (await tx.user.create({
        data: {
          locationId: location.id,
          roleId: cashierRole.id,
          firstName: "Cashier",
          lastName: "User",
          pinCode: "2222",
          email: "cashier@example.com",
          isActive: true,
        },
      }));

    await tx.user.findFirst({ where: { locationId: location.id, pinCode: "3333" } }) ??
      (await tx.user.create({
        data: {
          locationId: location.id,
          roleId: waiterRole.id,
          firstName: "Waiter",
          lastName: "User",
          pinCode: "3333",
          email: "waiter@example.com",
          isActive: true,
        },
      }));

    // 6) Areas
    const mainHall =
      (await tx.area.findFirst({ where: { locationId: location.id, name: "Main Hall" } })) ??
      (await tx.area.create({
        data: { locationId: location.id, name: "Main Hall", sortOrder: 1, isActive: true },
      }));

    const patio =
      (await tx.area.findFirst({ where: { locationId: location.id, name: "Patio" } })) ??
      (await tx.area.create({
        data: { locationId: location.id, name: "Patio", sortOrder: 2, isActive: true },
      }));

    // 7) Tables
    for (const name of ["T1", "T2", "T3", "T4"]) {
      const exists = await (tx as any).table.findFirst({
        where: { locationId: location.id, areaId: mainHall.id, name },
      });
      if (!exists) {
        await (tx as any).table.create({
          data: {
            locationId: location.id,
            areaId: mainHall.id,
            name,
            capacity: 4,
            status: "free" as any, // could be enum FREE or string free
            isActive: true,
          },
        });
      }
    }

    for (const name of ["P1", "P2"]) {
      const exists = await (tx as any).table.findFirst({
        where: { locationId: location.id, areaId: patio.id, name },
      });
      if (!exists) {
        await (tx as any).table.create({
          data: {
            locationId: location.id,
            areaId: patio.id,
            name,
            capacity: 2,
            status: "free" as any,
            isActive: true,
          },
        });
      }
    }

    // 8) Menu Categories
    const foodCategory =
      (await (tx as any).menuCategory.findFirst({
        where: { locationId: location.id, OR: [{ slug: "food" }, { name: "Food" }] },
      })) ??
      (await (tx as any).menuCategory.create({
        data: {
          locationId: location.id,
          name: "Food",
          slug: "food",
          description: null,
          sortOrder: 1,
          isActive: true,
        },
      }));

    const drinksCategory =
      (await (tx as any).menuCategory.findFirst({
        where: { locationId: location.id, OR: [{ slug: "drinks" }, { name: "Drinks" }] },
      })) ??
      (await (tx as any).menuCategory.create({
        data: {
          locationId: location.id,
          name: "Drinks",
          slug: "drinks",
          description: null,
          sortOrder: 2,
          isActive: true,
        },
      }));

    // 9) Menu Items
    const burger =
      (await (tx as any).menuItem.findFirst({
        where: { locationId: location.id, OR: [{ sku: "BURGER-1" }, { name: "Burger" }] },
      })) ??
      (await (tx as any).menuItem.create({
        data: {
          locationId: location.id,
          categoryId: foodCategory.id,
          name: "Burger",
          sku: "BURGER-1",
          description: null,
          basePrice: new Prisma.Decimal("9.99"),
          taxRate: new Prisma.Decimal("0.00"),
          isAlcohol: false,
          isActive: true,
          kdsStationId,
        },
      }));

    await (tx as any).menuItem.findFirst({
      where: { locationId: location.id, OR: [{ sku: "COLA-1" }, { name: "Cola" }] },
    }) ??
      (await (tx as any).menuItem.create({
        data: {
          locationId: location.id,
          categoryId: drinksCategory.id,
          name: "Cola",
          sku: "COLA-1",
          description: null,
          basePrice: new Prisma.Decimal("2.50"),
          taxRate: new Prisma.Decimal("0.00"),
          isAlcohol: false,
          isActive: true,
          kdsStationId: null,
        },
      }));

    // 10) Modifiers
    const burgerMods =
      (await (tx as any).modifierGroup.findFirst({
        where: { locationId: location.id, name: "Burger Add-ons" },
      })) ??
      (await (tx as any).modifierGroup.create({
        data: {
          locationId: location.id,
          name: "Burger Add-ons",
          minSelected: 0,
          maxSelected: 3,
          isRequired: false,
          sortOrder: 1,
          isActive: true,
        },
      }));

    const options = [
      { name: "Extra cheese", priceDelta: "1.00", sortOrder: 1 },
      { name: "Bacon", priceDelta: "1.50", sortOrder: 2 },
      { name: "No onions", priceDelta: null, sortOrder: 3 },
    ];

    for (const opt of options) {
      const exists = await (tx as any).modifierOption.findFirst({
        where: { modifierGroupId: burgerMods.id, name: opt.name },
      });
      if (!exists) {
        await (tx as any).modifierOption.create({
          data: {
            modifierGroupId: burgerMods.id,
            name: opt.name,
            priceDelta: opt.priceDelta === null ? null : new Prisma.Decimal(opt.priceDelta),
            sortOrder: opt.sortOrder,
            isActive: true,
          },
        });
      }
    }

    // 11) Link menu item <-> modifier group
    const linkExists = await (tx as any).menuItemModifierGroup.findFirst({
      where: { menuItemId: burger.id, modifierGroupId: burgerMods.id },
    });

    if (!linkExists) {
      await (tx as any).menuItemModifierGroup.create({
        data: { menuItemId: burger.id, modifierGroupId: burgerMods.id },
      });
    }

    // 12) Guest + Membership
    const guest =
      (await (tx as any).guest.findFirst({
        where: { locationId: location.id, email: "guest@example.com" },
      })) ??
      (await (tx as any).guest.create({
        data: {
          locationId: location.id,
          firstName: "Demo",
          lastName: "Guest",
          email: "guest@example.com",
          phone: "+380000000001",
          note: null,
        },
      }));

    await (tx as any).membership.findFirst({ where: { guestId: guest.id } }) ??
      (await (tx as any).membership.create({
        data: {
          guestId: guest.id,
          membershipLevel: "SILVER" as any, // enum/string-safe
          membershipNumber: "MEM-0001",
          discountPercent: new Prisma.Decimal("5.00"),
          isActive: true,
        },
      }));

    // 13) Open shift
    const openShiftExists = await (tx as any).shift.findFirst({
      where: {
        locationId: location.id,
        userId: admin.id,
        terminalId: posTerminal.id,
        status: "OPEN" as any,
      },
    });

    if (!openShiftExists) {
      await (tx as any).shift.create({
        data: {
          locationId: location.id,
          userId: admin.id,
          terminalId: posTerminal.id,
          openedAt: new Date(),
          openingCashAmount: new Prisma.Decimal("0.00"),
          closingCashAmount: null,
          status: "OPEN" as any,
        },
      });
    }
  });

  console.log("Seed finished");
}

main()
  .catch((e) => {
    console.error("Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

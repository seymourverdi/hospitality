import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] });

const dec = (n: number | string) => new Prisma.Decimal(n);

type CreatedMenuItem = {
  id: number;
  key: string;
  name: string;
};

async function clearDatabase() {
  await prisma.paymentRefund.deleteMany();
  await prisma.apiIdempotency.deleteMany();
  await prisma.kitchenTicketItem.deleteMany();
  await prisma.kitchenTicket.deleteMany();
  await prisma.orderItemModifier.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.savedFilter.deleteMany();
  await prisma.displayLayout.deleteMany();
  await prisma.reportSnapshot.deleteMany();
  await prisma.reservationTable.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.order.deleteMany();
  await prisma.userDevice.deleteMany();
  await prisma.locationSettings.deleteMany();
  await prisma.menuItemModifierGroup.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.table.deleteMany();
  await prisma.area.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.terminal.deleteMany();
  await prisma.kDSStation.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.restaurantLocation.deleteMany();
}

async function main() {
  console.log("Seed started");

  await clearDatabase();

  const roles = await createRoles();
  const location = await createLocation();
  const stations = await createStations(location.id);
  const terminals = await createTerminals(location.id, stations);
  const users = await createUsers(location.id, roles);
  await createUserDevices(users);
  await createLocationSettings(location.id);

  const areas = await createAreas(location.id);
  const tables = await createTables(location.id, areas);

  const menuCategories = await createMenuCategories(location.id);
  const modifierGroups = await createModifierGroups(location.id);
  const menuItems = await createMenuItems(location.id, menuCategories, stations);
  await linkMenuItemModifierGroups(menuItems, modifierGroups);

  const guests = await createGuests(location.id);
  const memberships = await createMemberships(guests);
  await createReservations(location.id, guests, tables);

  const shifts = await createShifts(location.id, users, terminals);
  const orders = await createOrdersAndOps({
    locationId: location.id,
    users,
    guests,
    memberships,
    tables,
    terminals,
    shifts,
    menuItems,
    stations,
  });

  await createSessions(location.id, terminals, users);
  await createFilters(location.id, users, areas);
  await createLayouts(location.id, terminals);
  await createSnapshots(location.id, shifts);
  await createApiIdempotency(location.id, terminals, users, orders.openOrderId);

  console.log("Seed completed successfully");
  console.log({
    location: location.name,
    adminPin: users.admin.pinCode,
    managerPin: users.manager.pinCode,
    cashierPin: users.cashier.pinCode,
    waiterPins: [users.waiter1.pinCode, users.waiter2.pinCode, users.waiter3.pinCode],
    openOrderId: orders.openOrderId,
    paidOrderId: orders.paidOrderId,
  });
}

async function createRoles() {
  const admin = await prisma.role.create({
    data: {
      name: "Admin",
      permissionsJson: {
        all: true,
      },
    },
  });

  const manager = await prisma.role.create({
    data: {
      name: "Manager",
      permissionsJson: {
        dashboard: true,
        pos: true,
        tables: true,
        menu: true,
        reservations: true,
        reports: true,
        settings: true,
        users: true,
      },
    },
  });

  const cashier = await prisma.role.create({
    data: {
      name: "Cashier",
      permissionsJson: {
        pos: true,
        payments: true,
        orders: true,
        tables: true,
      },
    },
  });

  const waiter = await prisma.role.create({
    data: {
      name: "Waiter",
      permissionsJson: {
        pos: true,
        orders: true,
        tables: true,
        reservations: true,
      },
    },
  });

  const bartender = await prisma.role.create({
    data: {
      name: "Bartender",
      permissionsJson: {
        pos: true,
        orders: true,
        bar: true,
        payments: false,
      },
    },
  });

  return { admin, manager, cashier, waiter, bartender };
}

async function createLocation() {
  return prisma.restaurantLocation.create({
    data: {
      name: "City Club Grill & Lounge",
      code: "CITY-CLUB",
      timezone: "America/New_York",
      address: "125 West 47th Street, New York, NY",
      phone: "+1-212-555-0188",
      isActive: true,
    },
  });
}

async function createStations(locationId: number) {
  const hotKitchen = await prisma.kDSStation.create({
    data: {
      locationId,
      name: "Hot Kitchen",
      code: "HOT",
      sortOrder: 1,
      isActive: true,
    },
  });

  const coldKitchen = await prisma.kDSStation.create({
    data: {
      locationId,
      name: "Cold Kitchen",
      code: "COLD",
      sortOrder: 2,
      isActive: true,
    },
  });

  const pastry = await prisma.kDSStation.create({
    data: {
      locationId,
      name: "Pastry",
      code: "PASTRY",
      sortOrder: 3,
      isActive: true,
    },
  });

  const bar = await prisma.kDSStation.create({
    data: {
      locationId,
      name: "Bar",
      code: "BAR",
      sortOrder: 4,
      isActive: true,
    },
  });

  return { hotKitchen, coldKitchen, pastry, bar };
}

async function createTerminals(
  locationId: number,
  stations: Awaited<ReturnType<typeof createStations>>,
) {
  const posMain = await prisma.terminal.create({
    data: {
      locationId,
      name: "Main POS",
      code: "POS-1",
      deviceType: "POS",
      isActive: true,
    },
  });

  const posBar = await prisma.terminal.create({
    data: {
      locationId,
      name: "Bar POS",
      code: "POS-2",
      deviceType: "BAR",
      kdsStationId: stations.bar.id,
      isActive: true,
    },
  });

  const floorTablet = await prisma.terminal.create({
    data: {
      locationId,
      name: "Floor Tablet",
      code: "TAB-1",
      deviceType: "TABLET",
      isActive: true,
    },
  });

  const kitchenDisplay = await prisma.terminal.create({
    data: {
      locationId,
      name: "Kitchen Display",
      code: "KDS-HOT-1",
      deviceType: "KDS",
      kdsStationId: stations.hotKitchen.id,
      isActive: true,
    },
  });

  const barDisplay = await prisma.terminal.create({
    data: {
      locationId,
      name: "Bar Display",
      code: "KDS-BAR-1",
      deviceType: "KDS",
      kdsStationId: stations.bar.id,
      isActive: true,
    },
  });

  return { posMain, posBar, floorTablet, kitchenDisplay, barDisplay };
}

async function createUsers(
  locationId: number,
  roles: Awaited<ReturnType<typeof createRoles>>,
) {
  const admin = await prisma.user.create({
    data: {
      locationId,
      roleId: roles.admin.id,
      firstName: "Michael",
      lastName: "Carter",
      pinCode: "1111",
      email: "michael.carter@cityclub.local",
      phone: "+1-212-555-1101",
      avatarColor: "slate",
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      locationId,
      roleId: roles.manager.id,
      firstName: "Jessica",
      lastName: "Miller",
      pinCode: "2222",
      email: "jessica.miller@cityclub.local",
      phone: "+1-212-555-1102",
      avatarColor: "blue",
      isActive: true,
    },
  });

  const cashier = await prisma.user.create({
    data: {
      locationId,
      roleId: roles.cashier.id,
      firstName: "Daniel",
      lastName: "Brooks",
      pinCode: "3333",
      email: "daniel.brooks@cityclub.local",
      phone: "+1-212-555-1103",
      avatarColor: "green",
      isActive: true,
    },
  });

  const waiter1 = await prisma.user.create({
    data: {
      locationId,
      roleId: roles.waiter.id,
      firstName: "Emily",
      lastName: "Johnson",
      pinCode: "4444",
      email: "emily.johnson@cityclub.local",
      phone: "+1-212-555-1104",
      avatarColor: "orange",
      isActive: true,
    },
  });

  const waiter2 = await prisma.user.create({
    data: {
      locationId,
      roleId: roles.waiter.id,
      firstName: "Ryan",
      lastName: "Walker",
      pinCode: "5555",
      email: "ryan.walker@cityclub.local",
      phone: "+1-212-555-1105",
      avatarColor: "purple",
      isActive: true,
    },
  });

  const waiter3 = await prisma.user.create({
    data: {
      locationId,
      roleId: roles.waiter.id,
      firstName: "Olivia",
      lastName: "Davis",
      pinCode: "6666",
      email: "olivia.davis@cityclub.local",
      phone: "+1-212-555-1106",
      avatarColor: "pink",
      isActive: true,
    },
  });

  const bartender = await prisma.user.create({
    data: {
      locationId,
      roleId: roles.bartender.id,
      firstName: "Ethan",
      lastName: "Reed",
      pinCode: "7777",
      email: "ethan.reed@cityclub.local",
      phone: "+1-212-555-1107",
      avatarColor: "amber",
      isActive: true,
    },
  });

  return { admin, manager, cashier, waiter1, waiter2, waiter3, bartender };
}

async function createUserDevices(users: Awaited<ReturnType<typeof createUsers>>) {
  await prisma.userDevice.createMany({
    data: [
      {
        userId: users.admin.id,
        token: "device-admin-001",
        platform: "ios",
      },
      {
        userId: users.manager.id,
        token: "device-manager-001",
        platform: "ios",
      },
      {
        userId: users.waiter1.id,
        token: "device-emily-001",
        platform: "android",
      },
      {
        userId: users.waiter2.id,
        token: "device-ryan-001",
        platform: "android",
      },
      {
        userId: users.waiter3.id,
        token: "device-olivia-001",
        platform: "android",
      },
      {
        userId: users.bartender.id,
        token: "device-ethan-001",
        platform: "ios",
      },
    ],
  });
}

async function createLocationSettings(locationId: number) {
  await prisma.locationSettings.create({
    data: {
      locationId,
      statsConfig: {
        revenue: true,
        tickets: true,
        avgOrderValue: true,
        events: true,
        covers: true,
        topItems: true,
        topCategories: true,
        topServers: true,
      },
      saleConfig: {
        requireTable: false,
        allowDiscounts: true,
        allowVoid: true,
        allowSplitPayment: true,
        allowScheduledOrders: true,
      },
      rsvpConfig: {
        reservationsEnabled: true,
        defaultTurnMinutes: 120,
        socialLunchEnabled: true,
        mixedEnabled: true,
      },
      displayConfig: {
        autoRefreshSeconds: 10,
        showElapsedTime: true,
        showCourseNumber: true,
      },
      tablesConfig: {
        showOccupancy: true,
        showServerName: true,
        showChecks: true,
      },
      filterConfig: {
        defaultPeriod: "today",
        defaultStatus: "all",
      },
      logConfig: {
        level: "info",
        retentionDays: 30,
      },
    },
  });
}

async function createAreas(locationId: number) {
  const mainDining = await prisma.area.create({
    data: {
      locationId,
      name: "Main Dining",
      sortOrder: 1,
      isActive: true,
    },
  });

  const terrace = await prisma.area.create({
    data: {
      locationId,
      name: "Terrace",
      sortOrder: 2,
      isActive: true,
    },
  });

  const barLounge = await prisma.area.create({
    data: {
      locationId,
      name: "Bar Lounge",
      sortOrder: 3,
      isActive: true,
    },
  });

  const privateRoom = await prisma.area.create({
    data: {
      locationId,
      name: "Private Room",
      sortOrder: 4,
      isActive: true,
    },
  });

  return { mainDining, terrace, barLounge, privateRoom };
}

async function createTables(
  locationId: number,
  areas: Awaited<ReturnType<typeof createAreas>>,
) {
  const tables = [];

  const tableDefs = [
    { areaId: areas.mainDining.id, name: "T1", capacity: 2, status: "AVAILABLE" },
    { areaId: areas.mainDining.id, name: "T2", capacity: 4, status: "OCCUPIED" },
    { areaId: areas.mainDining.id, name: "T3", capacity: 4, status: "AVAILABLE" },
    { areaId: areas.mainDining.id, name: "T4", capacity: 6, status: "AVAILABLE" },
    { areaId: areas.mainDining.id, name: "T5", capacity: 6, status: "RESERVED" },
    { areaId: areas.mainDining.id, name: "T6", capacity: 8, status: "AVAILABLE" },
    { areaId: areas.terrace.id, name: "P1", capacity: 2, status: "AVAILABLE" },
    { areaId: areas.terrace.id, name: "P2", capacity: 2, status: "AVAILABLE" },
    { areaId: areas.terrace.id, name: "P3", capacity: 4, status: "RESERVED" },
    { areaId: areas.terrace.id, name: "P4", capacity: 4, status: "AVAILABLE" },
    { areaId: areas.barLounge.id, name: "B1", capacity: 2, status: "AVAILABLE" },
    { areaId: areas.barLounge.id, name: "B2", capacity: 2, status: "OCCUPIED" },
    { areaId: areas.barLounge.id, name: "B3", capacity: 2, status: "AVAILABLE" },
    { areaId: areas.barLounge.id, name: "B4", capacity: 2, status: "AVAILABLE" },
    { areaId: areas.privateRoom.id, name: "R1", capacity: 10, status: "AVAILABLE" },
    { areaId: areas.privateRoom.id, name: "R2", capacity: 12, status: "AVAILABLE" },
  ];

  for (const def of tableDefs) {
    tables.push(
      await prisma.table.create({
        data: {
          locationId,
          areaId: def.areaId,
          name: def.name,
          capacity: def.capacity,
          status: def.status,
          isActive: true,
        },
      }),
    );
  }

  return {
    all: tables,
    t2: tables.find((t) => t.name === "T2")!,
    t5: tables.find((t) => t.name === "T5")!,
    p3: tables.find((t) => t.name === "P3")!,
    b2: tables.find((t) => t.name === "B2")!,
  };
}

async function createMenuCategories(locationId: number) {
  const names = [
    ["Breakfast", "breakfast"],
    ["Starters", "starters"],
    ["Soups", "soups"],
    ["Salads", "salads"],
    ["Burgers & Sandwiches", "burgers-sandwiches"],
    ["Steaks & Grill", "steaks-grill"],
    ["Pasta", "pasta"],
    ["Pizza", "pizza"],
    ["Seafood", "seafood"],
    ["Desserts", "desserts"],
    ["Kids Menu", "kids-menu"],
    ["Soft Drinks", "soft-drinks"],
    ["Coffee & Tea", "coffee-tea"],
    ["Beer", "beer"],
    ["Wine", "wine"],
    ["Cocktails", "cocktails"],
    ["Spirits", "spirits"],
  ] as const;

  const result: Record<string, { id: number; name: string }> = {};

  for (let i = 0; i < names.length; i += 1) {
    const [name, slug] = names[i];
    const row = await prisma.menuCategory.create({
      data: {
        locationId,
        name,
        slug,
        sortOrder: i + 1,
        isActive: true,
      },
    });
    result[slug] = { id: row.id, name: row.name };
  }

  return result;
}

async function createModifierGroups(locationId: number) {
  const groups: Record<string, { id: number }> = {};

  async function createGroup(
    key: string,
    name: string,
    minSelected: number | null,
    maxSelected: number | null,
    isRequired = false,
    options: Array<{ name: string; priceDelta?: number }>,
  ) {
    const group = await prisma.modifierGroup.create({
      data: {
        locationId,
        name,
        minSelected,
        maxSelected,
        isRequired,
        isActive: true,
      },
    });

    for (let i = 0; i < options.length; i += 1) {
      await prisma.modifierOption.create({
        data: {
          modifierGroupId: group.id,
          name: options[i]!.name,
          priceDelta: options[i]!.priceDelta != null ? dec(options[i].priceDelta) : null,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }

    groups[key] = { id: group.id };
  }

  await createGroup("eggs", "Egg Style", 1, 1, true, [
    { name: "Scrambled" },
    { name: "Sunny Side Up" },
    { name: "Over Easy" },
    { name: "Poached" },
  ]);

  await createGroup("toast", "Toast Choice", 0, 1, false, [
    { name: "Sourdough" },
    { name: "Whole Wheat" },
    { name: "Gluten Free", priceDelta: 1.5 },
  ]);

  await createGroup("steakTemp", "Steak Temperature", 1, 1, true, [
    { name: "Rare" },
    { name: "Medium Rare" },
    { name: "Medium" },
    { name: "Medium Well" },
    { name: "Well Done" },
  ]);

  await createGroup("grillSide", "Side Choice", 1, 1, true, [
    { name: "French Fries" },
    { name: "Mashed Potatoes" },
    { name: "Seasonal Vegetables" },
    { name: "Mixed Greens" },
    { name: "Rice Pilaf" },
  ]);

  await createGroup("grillSauce", "Sauce Choice", 0, 2, false, [
    { name: "Peppercorn Sauce", priceDelta: 2 },
    { name: "Mushroom Sauce", priceDelta: 2 },
    { name: "Red Wine Reduction", priceDelta: 2.5 },
    { name: "Garlic Butter", priceDelta: 1.5 },
  ]);

  await createGroup("burgerAddons", "Burger Add-ons", 0, 5, false, [
    { name: "Extra Cheese", priceDelta: 1.5 },
    { name: "Bacon", priceDelta: 2 },
    { name: "Avocado", priceDelta: 2.5 },
    { name: "Jalapenos", priceDelta: 1 },
    { name: "Fried Egg", priceDelta: 2 },
    { name: "No Onion" },
    { name: "No Tomato" },
  ]);

  await createGroup("pizzaSize", "Pizza Size", 1, 1, true, [
    { name: "Small 10in" },
    { name: "Medium 12in", priceDelta: 3 },
    { name: "Large 14in", priceDelta: 6 },
  ]);

  await createGroup("pizzaToppings", "Extra Toppings", 0, 6, false, [
    { name: "Pepperoni", priceDelta: 2 },
    { name: "Mushrooms", priceDelta: 1.5 },
    { name: "Olives", priceDelta: 1.5 },
    { name: "Roasted Peppers", priceDelta: 1.5 },
    { name: "Extra Mozzarella", priceDelta: 2 },
    { name: "Prosciutto", priceDelta: 3 },
  ]);

  await createGroup("pastaAddons", "Pasta Add-ons", 0, 3, false, [
    { name: "Chicken", priceDelta: 4 },
    { name: "Shrimp", priceDelta: 6 },
    { name: "Extra Parmesan", priceDelta: 1.5 },
  ]);

  await createGroup("coffeeMilk", "Milk Choice", 0, 1, false, [
    { name: "Whole Milk" },
    { name: "Oat Milk", priceDelta: 0.9 },
    { name: "Almond Milk", priceDelta: 0.9 },
    { name: "Lactose Free", priceDelta: 0.7 },
  ]);

  await createGroup("coffeeSyrup", "Syrup", 0, 2, false, [
    { name: "Vanilla", priceDelta: 0.75 },
    { name: "Caramel", priceDelta: 0.75 },
    { name: "Hazelnut", priceDelta: 0.75 },
  ]);

  await createGroup("ice", "Ice Preference", 0, 1, false, [
    { name: "No Ice" },
    { name: "Regular Ice" },
    { name: "Extra Ice" },
  ]);

  await createGroup("cocktailSpirit", "Spirit Upgrade", 0, 1, false, [
    { name: "House Pour" },
    { name: "Premium Pour", priceDelta: 4 },
  ]);

  await createGroup("kidsSide", "Kids Side", 1, 1, true, [
    { name: "Fries" },
    { name: "Fruit Cup" },
    { name: "Mashed Potatoes" },
  ]);

  return groups;
}

async function createMenuItems(
  locationId: number,
  categories: Awaited<ReturnType<typeof createMenuCategories>>,
  stations: Awaited<ReturnType<typeof createStations>>,
) {
  const created: CreatedMenuItem[] = [];
  let order = 1;

  async function createItem(data: {
    key: string;
    category: keyof typeof categories;
    name: string;
    sku: string;
    price: number;
    stationId?: number;
    isAlcohol?: boolean;
    allergens?: string[];
    description?: string;
  }) {
    const row = await prisma.menuItem.create({
      data: {
        locationId,
        categoryId: categories[data.category]!.id,
        name: data.name,
        sku: data.sku,
        description: data.description ?? null,
        basePrice: dec(data.price),
        taxRate: dec(8.875),
        isAlcohol: data.isAlcohol ?? false,
        isActive: true,
        kdsStationId: data.stationId ?? null,
        allergens: data.allergens ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    created.push({ id: row.id, key: data.key, name: data.name });
    order += 1;
    return row;
  }

  await createItem({ key: "pancakes", category: "breakfast", name: "Buttermilk Pancakes", sku: "BR-001", price: 12, stationId: stations.hotKitchen.id, allergens: ["gluten", "egg", "milk"] });
  await createItem({ key: "avocado_toast", category: "breakfast", name: "Avocado Toast", sku: "BR-002", price: 14, stationId: stations.coldKitchen.id, allergens: ["gluten"] });
  await createItem({ key: "eggs_benedict", category: "breakfast", name: "Eggs Benedict", sku: "BR-003", price: 16, stationId: stations.hotKitchen.id, allergens: ["egg", "gluten", "milk"] });
  await createItem({ key: "omelette", category: "breakfast", name: "Build Your Own Omelette", sku: "BR-004", price: 15, stationId: stations.hotKitchen.id, allergens: ["egg", "milk"] });

  await createItem({ key: "truffle_fries", category: "starters", name: "Truffle Parmesan Fries", sku: "ST-001", price: 11, stationId: stations.hotKitchen.id, allergens: ["milk"] });
  await createItem({ key: "wings", category: "starters", name: "Buffalo Chicken Wings", sku: "ST-002", price: 14, stationId: stations.hotKitchen.id, allergens: ["milk"] });
  await createItem({ key: "calamari", category: "starters", name: "Crispy Calamari", sku: "ST-003", price: 16, stationId: stations.hotKitchen.id, allergens: ["gluten", "shellfish"] });
  await createItem({ key: "bruschetta", category: "starters", name: "Tomato Bruschetta", sku: "ST-004", price: 10, stationId: stations.coldKitchen.id, allergens: ["gluten"] });

  await createItem({ key: "tomato_soup", category: "soups", name: "Roasted Tomato Soup", sku: "SO-001", price: 9, stationId: stations.hotKitchen.id, allergens: ["milk"] });
  await createItem({ key: "onion_soup", category: "soups", name: "French Onion Soup", sku: "SO-002", price: 11, stationId: stations.hotKitchen.id, allergens: ["gluten", "milk"] });

  await createItem({ key: "caesar", category: "salads", name: "Caesar Salad", sku: "SA-001", price: 13, stationId: stations.coldKitchen.id, allergens: ["egg", "fish", "gluten", "milk"] });
  await createItem({ key: "greek", category: "salads", name: "Greek Salad", sku: "SA-002", price: 13, stationId: stations.coldKitchen.id, allergens: ["milk"] });
  await createItem({ key: "beet_goat", category: "salads", name: "Roasted Beet & Goat Cheese Salad", sku: "SA-003", price: 15, stationId: stations.coldKitchen.id, allergens: ["milk", "nuts"] });

  await createItem({ key: "club_burger", category: "burgers-sandwiches", name: "City Club Burger", sku: "BG-001", price: 19, stationId: stations.hotKitchen.id, allergens: ["gluten", "milk", "egg"] });
  await createItem({ key: "chicken_sandwich", category: "burgers-sandwiches", name: "Crispy Chicken Sandwich", sku: "BG-002", price: 18, stationId: stations.hotKitchen.id, allergens: ["gluten", "egg", "milk"] });
  await createItem({ key: "veggie_burger", category: "burgers-sandwiches", name: "Veggie Burger", sku: "BG-003", price: 17, stationId: stations.hotKitchen.id, allergens: ["gluten", "soy"] });

  await createItem({ key: "ribeye", category: "steaks-grill", name: "Ribeye Steak 14oz", sku: "GR-001", price: 42, stationId: stations.hotKitchen.id });
  await createItem({ key: "sirloin", category: "steaks-grill", name: "Sirloin Steak 10oz", sku: "GR-002", price: 34, stationId: stations.hotKitchen.id });
  await createItem({ key: "bbq_ribs", category: "steaks-grill", name: "BBQ Baby Back Ribs", sku: "GR-003", price: 29, stationId: stations.hotKitchen.id });
  await createItem({ key: "grilled_chicken", category: "steaks-grill", name: "Herb Grilled Chicken", sku: "GR-004", price: 24, stationId: stations.hotKitchen.id });

  await createItem({ key: "carbonara", category: "pasta", name: "Spaghetti Carbonara", sku: "PA-001", price: 21, stationId: stations.hotKitchen.id, allergens: ["gluten", "egg", "milk"] });
  await createItem({ key: "alfredo", category: "pasta", name: "Fettuccine Alfredo", sku: "PA-002", price: 20, stationId: stations.hotKitchen.id, allergens: ["gluten", "milk"] });
  await createItem({ key: "arrabbiata", category: "pasta", name: "Penne Arrabbiata", sku: "PA-003", price: 18, stationId: stations.hotKitchen.id, allergens: ["gluten"] });

  await createItem({ key: "margherita", category: "pizza", name: "Margherita Pizza", sku: "PZ-001", price: 18, stationId: stations.hotKitchen.id, allergens: ["gluten", "milk"] });
  await createItem({ key: "pepperoni", category: "pizza", name: "Pepperoni Pizza", sku: "PZ-002", price: 21, stationId: stations.hotKitchen.id, allergens: ["gluten", "milk"] });
  await createItem({ key: "prosciutto", category: "pizza", name: "Prosciutto Arugula Pizza", sku: "PZ-003", price: 23, stationId: stations.hotKitchen.id, allergens: ["gluten", "milk"] });

  await createItem({ key: "salmon", category: "seafood", name: "Pan Seared Salmon", sku: "SF-001", price: 31, stationId: stations.hotKitchen.id, allergens: ["fish"] });
  await createItem({ key: "shrimp_scampi", category: "seafood", name: "Shrimp Scampi", sku: "SF-002", price: 29, stationId: stations.hotKitchen.id, allergens: ["shellfish", "gluten", "milk"] });
  await createItem({ key: "fish_chips", category: "seafood", name: "Fish & Chips", sku: "SF-003", price: 24, stationId: stations.hotKitchen.id, allergens: ["fish", "gluten"] });

  await createItem({ key: "cheesecake", category: "desserts", name: "New York Cheesecake", sku: "DS-001", price: 10, stationId: stations.pastry.id, allergens: ["gluten", "egg", "milk"] });
  await createItem({ key: "tiramisu", category: "desserts", name: "Classic Tiramisu", sku: "DS-002", price: 11, stationId: stations.pastry.id, allergens: ["gluten", "egg", "milk"] });
  await createItem({ key: "lava_cake", category: "desserts", name: "Chocolate Lava Cake", sku: "DS-003", price: 12, stationId: stations.pastry.id, allergens: ["gluten", "egg", "milk"] });
  await createItem({ key: "ice_cream", category: "desserts", name: "Ice Cream Trio", sku: "DS-004", price: 8, stationId: stations.pastry.id, allergens: ["milk"] });

  await createItem({ key: "kids_pasta", category: "kids-menu", name: "Kids Butter Pasta", sku: "KD-001", price: 9, stationId: stations.hotKitchen.id, allergens: ["gluten", "milk"] });
  await createItem({ key: "kids_tenders", category: "kids-menu", name: "Kids Chicken Tenders", sku: "KD-002", price: 10, stationId: stations.hotKitchen.id, allergens: ["gluten"] });
  await createItem({ key: "kids_burger", category: "kids-menu", name: "Kids Cheeseburger", sku: "KD-003", price: 11, stationId: stations.hotKitchen.id, allergens: ["gluten", "milk"] });

  await createItem({ key: "cola", category: "soft-drinks", name: "Cola", sku: "SD-001", price: 4, stationId: stations.bar.id });
  await createItem({ key: "diet_cola", category: "soft-drinks", name: "Diet Cola", sku: "SD-002", price: 4, stationId: stations.bar.id });
  await createItem({ key: "sprite", category: "soft-drinks", name: "Lemon Lime Soda", sku: "SD-003", price: 4, stationId: stations.bar.id });
  await createItem({ key: "lemonade", category: "soft-drinks", name: "House Lemonade", sku: "SD-004", price: 5, stationId: stations.bar.id });
  await createItem({ key: "orange_juice", category: "soft-drinks", name: "Fresh Orange Juice", sku: "SD-005", price: 6, stationId: stations.bar.id });
  await createItem({ key: "water_still", category: "soft-drinks", name: "Still Water", sku: "SD-006", price: 3, stationId: stations.bar.id });
  await createItem({ key: "water_sparkling", category: "soft-drinks", name: "Sparkling Water", sku: "SD-007", price: 3.5, stationId: stations.bar.id });

  await createItem({ key: "latte", category: "coffee-tea", name: "Caffe Latte", sku: "CF-001", price: 6, stationId: stations.bar.id, allergens: ["milk"] });
  await createItem({ key: "americano", category: "coffee-tea", name: "Americano", sku: "CF-002", price: 5, stationId: stations.bar.id });
  await createItem({ key: "cappuccino", category: "coffee-tea", name: "Cappuccino", sku: "CF-003", price: 6, stationId: stations.bar.id, allergens: ["milk"] });
  await createItem({ key: "espresso", category: "coffee-tea", name: "Espresso", sku: "CF-004", price: 4, stationId: stations.bar.id });
  await createItem({ key: "tea", category: "coffee-tea", name: "English Breakfast Tea", sku: "CF-005", price: 4, stationId: stations.bar.id });

  await createItem({ key: "lager", category: "beer", name: "Draft Lager", sku: "BE-001", price: 8, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "ipa", category: "beer", name: "IPA Pint", sku: "BE-002", price: 9, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "stout", category: "beer", name: "Dry Stout", sku: "BE-003", price: 9, stationId: stations.bar.id, isAlcohol: true });

  await createItem({ key: "cabernet", category: "wine", name: "Cabernet Sauvignon Glass", sku: "WI-001", price: 12, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "chardonnay", category: "wine", name: "Chardonnay Glass", sku: "WI-002", price: 12, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "prosecco", category: "wine", name: "Prosecco Glass", sku: "WI-003", price: 13, stationId: stations.bar.id, isAlcohol: true });

  await createItem({ key: "old_fashioned", category: "cocktails", name: "Old Fashioned", sku: "CK-001", price: 16, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "margarita", category: "cocktails", name: "Margarita", sku: "CK-002", price: 15, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "gin_tonic", category: "cocktails", name: "Gin & Tonic", sku: "CK-003", price: 14, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "espresso_martini", category: "cocktails", name: "Espresso Martini", sku: "CK-004", price: 17, stationId: stations.bar.id, isAlcohol: true });

  await createItem({ key: "bourbon", category: "spirits", name: "Bourbon 2oz", sku: "SP-001", price: 14, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "vodka", category: "spirits", name: "Vodka 2oz", sku: "SP-002", price: 12, stationId: stations.bar.id, isAlcohol: true });
  await createItem({ key: "gin", category: "spirits", name: "Gin 2oz", sku: "SP-003", price: 12, stationId: stations.bar.id, isAlcohol: true });

  return created.reduce<Record<string, CreatedMenuItem>>((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {});
}

async function linkMenuItemModifierGroups(
  menuItems: Awaited<ReturnType<typeof createMenuItems>>,
  groups: Awaited<ReturnType<typeof createModifierGroups>>,
) {
  const links = [
    [menuItems.omelette!.id, groups.eggs!.id],
    [menuItems.avocado_toast!.id, groups.toast!.id],
    [menuItems.eggs_benedict!.id, groups.toast!.id],

    [menuItems.truffle_fries!.id, groups.ice!.id],
    [menuItems.wings!.id, groups.grillSauce!.id],

    [menuItems.club_burger!.id, groups.burgerAddons!.id],
    [menuItems.club_burger!.id, groups.grillSide!.id],
    [menuItems.chicken_sandwich!.id, groups.burgerAddons!.id],
    [menuItems.veggie_burger!.id, groups.burgerAddons!.id],

    [menuItems.ribeye!.id, groups.steakTemp!.id],
    [menuItems.ribeye!.id, groups.grillSide!.id],
    [menuItems.ribeye!.id, groups.grillSauce!.id],
    [menuItems.sirloin!.id, groups.steakTemp!.id],
    [menuItems.sirloin!.id, groups.grillSide!.id],
    [menuItems.sirloin!.id, groups.grillSauce!.id],
    [menuItems.grilled_chicken!.id, groups.grillSide!.id],
    [menuItems.bbq_ribs!.id, groups.grillSide!.id],

    [menuItems.carbonara?.id ?? 0, groups.pastaAddons!.id],
    [menuItems.alfredo!.id, groups.pastaAddons!.id],
    [menuItems.arrabbiata!.id, groups.pastaAddons!.id],

    [menuItems.margherita!.id, groups.pizzaSize!.id],
    [menuItems.margherita!.id, groups.pizzaToppings!.id],
    [menuItems.pepperoni!.id, groups.pizzaSize!.id],
    [menuItems.pepperoni!.id, groups.pizzaToppings!.id],
    [menuItems.prosciutto!.id, groups.pizzaSize!.id],
    [menuItems.prosciutto!.id, groups.pizzaToppings!.id],

    [menuItems.latte!.id, groups.coffeeMilk!.id],
    [menuItems.latte!.id, groups.coffeeSyrup!.id],
    [menuItems.cappuccino!.id, groups.coffeeMilk!.id],
    [menuItems.cappuccino!.id, groups.coffeeSyrup!.id],

    [menuItems.cola!.id, groups.ice!.id],
    [menuItems.diet_cola!.id, groups.ice!.id],
    [menuItems.sprite!.id, groups.ice!.id],
    [menuItems.lemonade!.id, groups.ice!.id],
    [menuItems.orange_juice!.id, groups.ice!.id],
    [menuItems.lager!.id, groups.ice!.id],
    [menuItems.ipa!.id, groups.ice!.id],

    [menuItems.old_fashioned!.id, groups.cocktailSpirit!.id],
    [menuItems.margarita!.id, groups.cocktailSpirit!.id],
    [menuItems.gin_tonic!.id, groups.cocktailSpirit!.id],
    [menuItems.espresso_martini!.id, groups.cocktailSpirit!.id],

    [menuItems.kids_tenders!.id, groups.kidsSide!.id],
    [menuItems.kids_burger!.id, groups.kidsSide!.id],
  ].filter(([menuItemId]) => menuItemId! > 0);

  for (const [menuItemId, modifierGroupId] of links) {
    await prisma.menuItemModifierGroup.create({
      data: { menuItemId, modifierGroupId },
    });
  }
}

async function createGuests(locationId: number) {
  const guestDefs = [
    ["Sophia", "Anderson", "+1-646-555-1001", "sophia.anderson@example.com", "Prefers terrace seating"],
    ["Liam", "Thompson", "+1-646-555-1002", "liam.thompson@example.com", "Allergic to shellfish"],
    ["Emma", "Roberts", "+1-646-555-1003", "emma.roberts@example.com", "Birthday dinner"],
    ["Noah", "Bennett", "+1-646-555-1004", "noah.bennett@example.com", "Loves bourbon"],
    ["Ava", "Parker", "+1-646-555-1005", "ava.parker@example.com", "VIP guest"],
    ["James", "Collins", "+1-646-555-1006", "james.collins@example.com", "Corporate client"],
    ["Mia", "Edwards", "+1-646-555-1007", "mia.edwards@example.com", "Requests window tables"],
    ["Lucas", "Hayes", "+1-646-555-1008", "lucas.hayes@example.com", "No dairy"],
  ] as const;

  const created = [];
  for (const [firstName, lastName, phone, email, note] of guestDefs) {
    created.push(
      await prisma.guest.create({
        data: {
          locationId,
          firstName,
          lastName,
          phone,
          email,
          note,
        },
      }),
    );
  }

  return {
    all: created,
    vip: created[4],
    birthday: created[2],
    shellfish: created[1],
    corporate: created[5],
  };
}

async function createMemberships(guests: Awaited<ReturnType<typeof createGuests>>) {
  const gold = await prisma.membership.create({
    data: {
      guestId: guests.vip!.id,
      membershipLevel: "GOLD",
      membershipNumber: "GOLD-1001",
      discountPercent: dec(10),
      isActive: true,
    },
  });

  const vip = await prisma.membership.create({
    data: {
      guestId: guests.corporate!.id,
      membershipLevel: "VIP",
      membershipNumber: "VIP-1002",
      discountPercent: dec(15),
      isActive: true,
    },
  });

  return { gold, vip };
}

async function createReservations(
  locationId: number,
  guests: Awaited<ReturnType<typeof createGuests>>,
  tables: Awaited<ReturnType<typeof createTables>>,
) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  const tomorrowLate = new Date(tomorrow);
  tomorrowLate.setHours(20, 30, 0, 0);

  const reservation1 = await prisma.reservation.create({
    data: {
      locationId,
      guestId: guests.vip!.id,
      reservationTime: tomorrow,
      partySize: 4,
      status: "CONFIRMED",
      source: "PHONE",
      serviceType: "ALL_DAY_MENU",
      note: "Terrace preferred if weather permits",
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      locationId,
      guestId: guests.birthday!.id,
      reservationTime: tomorrowLate,
      partySize: 6,
      status: "CONFIRMED",
      source: "ONLINE",
      serviceType: "MIXED",
      note: "Birthday dessert candle",
    },
  });

  await prisma.reservationTable.createMany({
    data: [
      {
        reservationId: reservation1.id,
        tableId: tables.p3.id,
      },
      {
        reservationId: reservation2.id,
        tableId: tables.t5.id,
      },
    ],
  });
}

async function createShifts(
  locationId: number,
  users: Awaited<ReturnType<typeof createUsers>>,
  terminals: Awaited<ReturnType<typeof createTerminals>>,
) {
  const now = new Date();

  const openShift = await prisma.shift.create({
    data: {
      locationId,
      userId: users.cashier.id,
      terminalId: terminals.posMain.id,
      openedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      openingCashAmount: dec(500),
      status: "OPEN",
    },
  });

  const closedShift = await prisma.shift.create({
    data: {
      locationId,
      userId: users.manager.id,
      terminalId: terminals.posBar.id,
      openedAt: new Date(now.getTime() - 28 * 60 * 60 * 1000),
      closedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      openingCashAmount: dec(300),
      closingCashAmount: dec(2140),
      status: "CLOSED",
    },
  });

  return { openShift, closedShift };
}

async function createOrdersAndOps(input: {
  locationId: number;
  users: Awaited<ReturnType<typeof createUsers>>;
  guests: Awaited<ReturnType<typeof createGuests>>;
  memberships: Awaited<ReturnType<typeof createMemberships>>;
  tables: Awaited<ReturnType<typeof createTables>>;
  terminals: Awaited<ReturnType<typeof createTerminals>>;
  shifts: Awaited<ReturnType<typeof createShifts>>;
  menuItems: Awaited<ReturnType<typeof createMenuItems>>;
  stations: Awaited<ReturnType<typeof createStations>>;
}) {
  const now = new Date();

  const openOrder = await prisma.order.create({
    data: {
      locationId: input.locationId,
      terminalId: input.terminals.posMain.id,
      shiftId: input.shifts.openShift.id,
      tableId: input.tables.t2.id,
      guestId: input.guests.shellfish!.id,
      orderType: "DINE_IN",
      status: "SENT_TO_KITCHEN",
      subtotalAmount: dec(76),
      discountAmount: dec(0),
      serviceChargeAmount: dec(13.68),
      taxAmount: dec(6.74),
      totalAmount: dec(96.42),
      openedByUserId: input.users.waiter1.id,
      openedAt: new Date(now.getTime() - 45 * 60 * 1000),
      note: "Guest noted shellfish allergy",
      serverUserId: input.users.waiter1.id,
    },
  });

  const oi1 = await prisma.orderItem.create({
    data: {
      orderId: openOrder.id,
      menuItemId: input.menuItems.club_burger!.id,
      seatNumber: 1,
      quantity: 1,
      basePrice: dec(19),
      discountAmount: dec(0),
      finalPrice: dec(19),
      comment: "Medium well, no tomato",
      kdsStatus: "IN_PROGRESS",
      status: "ACTIVE",
      courseNumber: 1,
    },
  });

  const oi2 = await prisma.orderItem.create({
    data: {
      orderId: openOrder.id,
      menuItemId: input.menuItems.truffle_fries!.id,
      seatNumber: 1,
      quantity: 1,
      basePrice: dec(11),
      discountAmount: dec(0),
      finalPrice: dec(11),
      comment: null,
      kdsStatus: "READY",
      status: "ACTIVE",
      courseNumber: 1,
    },
  });

  const oi3 = await prisma.orderItem.create({
    data: {
      orderId: openOrder.id,
      menuItemId: input.menuItems.lemonade!.id,
      seatNumber: 1,
      quantity: 2,
      basePrice: dec(5),
      discountAmount: dec(0),
      finalPrice: dec(10),
      comment: "Less ice",
      kdsStatus: "SERVED",
      status: "ACTIVE",
      courseNumber: 1,
    },
  });

  const burgerAddon = await prisma.modifierOption.findFirstOrThrow({
    where: { name: "No Tomato" },
  });

  const friesSauce = await prisma.modifierOption.findFirstOrThrow({
    where: { name: "Garlic Butter" },
  });

  const iceOption = await prisma.modifierOption.findFirstOrThrow({
    where: { name: "No Ice" },
  });

  await prisma.orderItemModifier.createMany({
    data: [
      {
        orderItemId: oi1.id,
        modifierOptionId: burgerAddon.id,
        priceDelta: dec(0),
      },
      {
        orderItemId: oi2.id,
        modifierOptionId: friesSauce.id,
        priceDelta: dec(1.5),
      },
      {
        orderItemId: oi3.id,
        modifierOptionId: iceOption.id,
        priceDelta: dec(0),
      },
    ],
  });

  const ticketHot = await prisma.kitchenTicket.create({
    data: {
      locationId: input.locationId,
      orderId: openOrder.id,
      tableId: input.tables.t2.id,
      kdsStationId: input.stations.hotKitchen.id,
      terminalId: input.terminals.posMain.id,
      createdByUserId: input.users.waiter1.id,
      status: "OPEN",
    },
  });

  const ticketBar = await prisma.kitchenTicket.create({
    data: {
      locationId: input.locationId,
      orderId: openOrder.id,
      tableId: input.tables.t2.id,
      kdsStationId: input.stations.bar.id,
      terminalId: input.terminals.posMain.id,
      createdByUserId: input.users.waiter1.id,
      status: "OPEN",
    },
  });

  await prisma.kitchenTicketItem.createMany({
    data: [
      {
        ticketId: ticketHot.id,
        orderItemId: oi1.id,
        quantity: 1,
      },
      {
        ticketId: ticketHot.id,
        orderItemId: oi2.id,
        quantity: 1,
      },
      {
        ticketId: ticketBar.id,
        orderItemId: oi3.id,
        quantity: 2,
      },
    ],
  });

  const paidOrder = await prisma.order.create({
    data: {
      locationId: input.locationId,
      terminalId: input.terminals.posBar.id,
      shiftId: input.shifts.closedShift.id,
      tableId: input.tables.b2.id,
      guestId: input.guests.vip!.id,
      membershipId: input.memberships.gold.id,
      orderType: "BAR",
      status: "PAID",
      subtotalAmount: dec(58),
      discountAmount: dec(5.8),
      serviceChargeAmount: dec(9.4),
      taxAmount: dec(4.63),
      totalAmount: dec(66.23),
      openedByUserId: input.users.bartender.id,
      closedByUserId: input.users.cashier.id,
      openedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000),
      closedAt: new Date(now.getTime() - 21 * 60 * 60 * 1000),
      note: "Gold member discount applied",
      serverUserId: input.users.bartender.id,
    },
  });

  const paidItem1 = await prisma.orderItem.create({
    data: {
      orderId: paidOrder.id,
      menuItemId: input.menuItems.old_fashioned!.id,
      seatNumber: 1,
      quantity: 2,
      basePrice: dec(16),
      discountAmount: dec(3.2),
      finalPrice: dec(28.8),
      kdsStatus: "SERVED",
      status: "ACTIVE",
      courseNumber: 1,
    },
  });

  const paidItem2 = await prisma.orderItem.create({
    data: {
      orderId: paidOrder.id,
      menuItemId: input.menuItems.wings!.id,
      seatNumber: 1,
      quantity: 1,
      basePrice: dec(14),
      discountAmount: dec(1.4),
      finalPrice: dec(12.6),
      kdsStatus: "SERVED",
      status: "ACTIVE",
      courseNumber: 1,
    },
  });

  const paidItem3 = await prisma.orderItem.create({
    data: {
      orderId: paidOrder.id,
      menuItemId: input.menuItems.cheesecake!.id,
      seatNumber: 1,
      quantity: 1,
      basePrice: dec(10),
      discountAmount: dec(1.0),
      finalPrice: dec(9.0),
      kdsStatus: "SERVED",
      status: "ACTIVE",
      courseNumber: 2,
    },
  });

  const premiumPour = await prisma.modifierOption.findFirstOrThrow({
    where: { name: "Premium Pour" },
  });

  await prisma.orderItemModifier.create({
    data: {
      orderItemId: paidItem1.id,
      modifierOptionId: premiumPour.id,
      priceDelta: dec(4),
    },
  });

  const completedBarTicket = await prisma.kitchenTicket.create({
    data: {
      locationId: input.locationId,
      orderId: paidOrder.id,
      tableId: input.tables.b2.id,
      kdsStationId: input.stations.bar.id,
      terminalId: input.terminals.posBar.id,
      createdByUserId: input.users.bartender.id,
      status: "COMPLETED",
    },
  });

  await prisma.kitchenTicketItem.create({
    data: {
      ticketId: completedBarTicket.id,
      orderItemId: paidItem1.id,
      quantity: 2,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: paidOrder.id,
      shiftId: input.shifts.closedShift.id,
      terminalId: input.terminals.posBar.id,
      amount: dec(66.23),
      tipAmount: dec(12),
      paymentMethod: "CARD",
      provider: "stripe",
      transactionId: "txn_cityclub_0001",
      status: "APPROVED",
      paidAt: new Date(now.getTime() - 21 * 60 * 60 * 1000),
    },
  });

  await prisma.paymentRefund.create({
    data: {
      paymentId: payment.id,
      orderId: paidOrder.id,
      shiftId: input.shifts.closedShift.id,
      terminalId: input.terminals.posBar.id,
      amount: dec(8),
      reason: "Courtesy adjustment",
      provider: "stripe",
      refundTransactionId: "refund_cityclub_0001",
      status: "REFUNDED",
    },
  });

  await prisma.table.update({
    where: { id: input.tables.t2.id },
    data: {
      activeOrderId: openOrder.id,
      status: "OCCUPIED",
    },
  });

  return {
    openOrderId: openOrder.id,
    paidOrderId: paidOrder.id,
  };
}

async function createSessions(
  locationId: number,
  terminals: Awaited<ReturnType<typeof createTerminals>>,
  users: Awaited<ReturnType<typeof createUsers>>,
) {
  const now = Date.now();

  await prisma.session.createMany({
    data: [
      {
        token: "sess-admin-cityclub-001",
        locationId,
        terminalId: terminals.posMain.id,
        userId: users.admin.id,
        expiresAt: new Date(now + 24 * 60 * 60 * 1000),
      },
      {
        token: "sess-manager-cityclub-001",
        locationId,
        terminalId: terminals.floorTablet.id,
        userId: users.manager.id,
        expiresAt: new Date(now + 16 * 60 * 60 * 1000),
      },
      {
        token: "sess-emily-cityclub-001",
        locationId,
        terminalId: terminals.floorTablet.id,
        userId: users.waiter1.id,
        expiresAt: new Date(now + 8 * 60 * 60 * 1000),
      },
    ],
  });
}

async function createFilters(
  locationId: number,
  users: Awaited<ReturnType<typeof createUsers>>,
  areas: Awaited<ReturnType<typeof createAreas>>,
) {
  await prisma.savedFilter.createMany({
    data: [
      {
        locationId,
        userId: users.manager.id,
        name: "Open Orders",
        scope: "ORDERS",
        filterJson: {
          statuses: ["OPEN", "SENT_TO_KITCHEN", "PARTIALLY_PAID"],
        },
        isDefault: true,
      },
      {
        locationId,
        userId: users.waiter1.id,
        name: "Terrace Tables",
        scope: "TABLES",
        filterJson: {
          areaIds: [areas.terrace.id],
        },
        isDefault: false,
      },
      {
        locationId,
        userId: users.cashier.id,
        name: "Today Sales",
        scope: "SALES",
        filterJson: {
          period: "today",
          paymentMethods: ["CARD", "CASH"],
        },
        isDefault: false,
      },
      {
        locationId,
        userId: users.manager.id,
        name: "VIP Guests",
        scope: "GUESTS",
        filterJson: {
          membershipOnly: true,
        },
        isDefault: false,
      },
    ],
  });
}

async function createLayouts(
  locationId: number,
  terminals: Awaited<ReturnType<typeof createTerminals>>,
) {
  await prisma.displayLayout.createMany({
    data: [
      {
        locationId,
        terminalId: terminals.posMain.id,
        name: "Main POS Layout",
        configJson: {
          tabs: ["tables", "menu", "orders", "guests"],
          compactMode: false,
        },
        isDefault: true,
      },
      {
        locationId,
        terminalId: terminals.floorTablet.id,
        name: "Floor Layout",
        configJson: {
          tabs: ["tables", "reservations"],
          compactMode: true,
        },
        isDefault: false,
      },
      {
        locationId,
        terminalId: terminals.kitchenDisplay.id,
        name: "Kitchen KDS Layout",
        configJson: {
          station: "hot-kitchen",
          showTimers: true,
        },
        isDefault: false,
      },
    ],
  });
}

async function createSnapshots(
  locationId: number,
  shifts: Awaited<ReturnType<typeof createShifts>>,
) {
  const now = new Date();

  await prisma.reportSnapshot.createMany({
    data: [
      {
        locationId,
        shiftId: shifts.openShift.id,
        date: now,
        type: "SHIFT",
        dataJson: {
          revenue: {
            daily: { value: 96.42, label: "Today revenue" },
            weekly: { value: 4820.18, label: "This week revenue" },
          },
          tickets: {
            daily: { count: 1, avg: 96.42 },
            weekly: { count: 71, avg: 67.89 },
          },
          avgOrderValue: {
            daily: 96.42,
            weekly: 67.89,
          },
          events: {
            activeReservations: 2,
            openTables: 1,
          },
        },
      },
      {
        locationId,
        shiftId: shifts.closedShift.id,
        date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        type: "DAILY",
        dataJson: {
          revenue: {
            daily: { value: 66.23, label: "Yesterday revenue" },
            weekly: { value: 4723.76, label: "Rolling week revenue" },
          },
          tickets: {
            daily: { count: 1, avg: 66.23 },
            weekly: { count: 70, avg: 67.48 },
          },
          avgOrderValue: {
            daily: 66.23,
            weekly: 67.48,
          },
          events: {
            activeReservations: 1,
            openTables: 0,
          },
        },
      },
    ],
  });
}

async function createApiIdempotency(
  locationId: number,
  terminals: Awaited<ReturnType<typeof createTerminals>>,
  users: Awaited<ReturnType<typeof createUsers>>,
  openOrderId: number,
) {
  await prisma.apiIdempotency.create({
    data: {
      key: "idem-order-create-cityclub-0001",
      locationId,
      terminalId: terminals.posMain.id,
      userId: users.waiter1.id,
      method: "POST",
      path: "/api/pos/orders",
      requestHash: "hash-order-create-cityclub-0001",
      responseJson: {
        success: true,
        orderId: openOrderId,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
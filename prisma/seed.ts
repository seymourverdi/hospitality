import { PrismaClient, DeviceType } from "@prisma/client";

const prisma = new PrismaClient();

function money(n: number) {
  // Prisma Decimal понимает string/number, но string надёжнее
  return n.toFixed(2);
}

async function getOrCreateLocation() {
  const code = process.env.SEED_LOCATION_CODE || "MAIN";
  const name = process.env.SEED_LOCATION_NAME || "Demo Restaurant";
  const timezone = process.env.SEED_LOCATION_TZ || "Europe/Kiev";

  const existing = await prisma.restaurantLocation.findFirst({
    where: { code },
  });

  if (existing) return existing;

  return prisma.restaurantLocation.create({
    data: {
      code,
      name,
      timezone,
      isActive: true,
    },
  });
}

async function seedKdsStations(locationId: number) {
  const stations = [
    { code: "KITCHEN", name: "Kitchen", sortOrder: 1 },
    { code: "BAR", name: "Bar", sortOrder: 2 },
    { code: "DESSERT", name: "Dessert", sortOrder: 3 },
  ];

  const out: Record<string, { id: number }> = {};

  for (const s of stations) {
    const existing = await prisma.kDSStation.findFirst({
      where: { locationId, code: s.code },
      select: { id: true },
    });

    const row =
      existing ??
      (await prisma.kDSStation.create({
        data: {
          locationId,
          code: s.code,
          name: s.name,
          sortOrder: s.sortOrder,
          isActive: true,
        },
        select: { id: true },
      }));

    out[s.code] = row;
  }

  return out;
}

async function seedTerminal(locationId: number, kdsStationId: number | null) {
  const name = process.env.SEED_TERMINAL_NAME || "Main POS";
  const existing = await prisma.terminal.findFirst({
    where: { locationId, name },
    select: { id: true },
  });

  if (existing) return existing;

  return prisma.terminal.create({
    data: {
      locationId,
      name,
      deviceType: DeviceType.POS,
      isActive: true,
      kdsStationId: kdsStationId ?? undefined,
    },
    select: { id: true },
  });
}

type CategorySeed = { key: string; name: string; sortOrder: number };
type ItemSeed = {
  key: string;
  categoryKey: string;
  name: string;
  sku?: string;
  basePrice: number;
  isAlcohol?: boolean;
  kdsStationCode?: "KITCHEN" | "BAR" | "DESSERT";
};

type ModifierGroupSeed = {
  key: string;
  name: string;
  minSelected?: number | null;
  maxSelected?: number | null;
  isRequired?: boolean;
  sortOrder?: number;
  options: Array<{ key: string; name: string; priceDelta?: number }>;
};

type ItemGroupMapSeed = { itemKey: string; groupKey: string };

async function main() {
  const reset = (process.env.SEED_RESET || "").toLowerCase() === "true";

  const location = await getOrCreateLocation();
  const kds = await seedKdsStations(location.id);

  // Опциональный терминал под будущие тесты/заказы
  await seedTerminal(location.id, null);

  if (reset) {
    // ВНИМАНИЕ: удаляем только menu-сущности и их привязки для конкретной локации.
    // Не трогаем заказы/платежи/пользователей и т.п.
    await prisma.$transaction([
      prisma.orderItemModifier.deleteMany({
        where: { orderItem: { order: { locationId: location.id } } },
      }),
      prisma.menuItemModifierGroup.deleteMany({
        where: { menuItem: { locationId: location.id } },
      }),
      prisma.orderItem.deleteMany({
        where: { order: { locationId: location.id } },
      }),
      prisma.order.deleteMany({ where: { locationId: location.id } }),

      prisma.modifierOption.deleteMany({
        where: { modifierGroup: { locationId: location.id } },
      }),
      prisma.modifierGroup.deleteMany({ where: { locationId: location.id } }),
      prisma.menuItem.deleteMany({ where: { locationId: location.id } }),
      prisma.menuCategory.deleteMany({ where: { locationId: location.id } }),
    ]);
  }

  const categories: CategorySeed[] = [
    { key: "starters", name: "Starters", sortOrder: 1 },
    { key: "mains", name: "Mains", sortOrder: 2 },
    { key: "drinks", name: "Drinks", sortOrder: 3 },
    { key: "desserts", name: "Desserts", sortOrder: 4 },
  ];

  const items: ItemSeed[] = [
    { key: "fries", categoryKey: "starters", name: "French Fries", sku: "ST-001", basePrice: 3.5, kdsStationCode: "KITCHEN" },
    { key: "wings", categoryKey: "starters", name: "Chicken Wings", sku: "ST-002", basePrice: 6.9, kdsStationCode: "KITCHEN" },

    { key: "burger", categoryKey: "mains", name: "Classic Burger", sku: "MN-001", basePrice: 10.9, kdsStationCode: "KITCHEN" },
    { key: "pizza", categoryKey: "mains", name: "Margherita Pizza", sku: "MN-002", basePrice: 11.5, kdsStationCode: "KITCHEN" },

    { key: "cola", categoryKey: "drinks", name: "Cola", sku: "DR-001", basePrice: 2.8, kdsStationCode: "BAR" },
    { key: "beer", categoryKey: "drinks", name: "Lager Beer", sku: "DR-002", basePrice: 4.5, isAlcohol: true, kdsStationCode: "BAR" },
    { key: "latte", categoryKey: "drinks", name: "Latte", sku: "DR-003", basePrice: 3.9, kdsStationCode: "BAR" },

    { key: "cheesecake", categoryKey: "desserts", name: "Cheesecake", sku: "DS-001", basePrice: 5.2, kdsStationCode: "DESSERT" },
  ];

  const modifierGroups: ModifierGroupSeed[] = [
    {
      key: "burger_cook",
      name: "Cooking Preference",
      minSelected: 1,
      maxSelected: 1,
      isRequired: true,
      sortOrder: 1,
      options: [
        { key: "rare", name: "Rare" },
        { key: "medium", name: "Medium" },
        { key: "welldone", name: "Well-done" },
      ],
    },
    {
      key: "burger_addons",
      name: "Add-ons",
      minSelected: 0,
      maxSelected: 5,
      isRequired: false,
      sortOrder: 2,
      options: [
        { key: "extra_cheese", name: "Extra cheese", priceDelta: 1.0 },
        { key: "bacon", name: "Bacon", priceDelta: 1.5 },
        { key: "jalapeno", name: "Jalapeño", priceDelta: 0.7 },
      ],
    },
    {
      key: "sauce_choice",
      name: "Sauce Choice",
      minSelected: 0,
      maxSelected: 2,
      isRequired: false,
      sortOrder: 3,
      options: [
        { key: "bbq", name: "BBQ" },
        { key: "mayo", name: "Mayo" },
        { key: "ketchup", name: "Ketchup" },
        { key: "spicy", name: "Spicy sauce", priceDelta: 0.3 },
      ],
    },
    {
      key: "pizza_size",
      name: "Pizza Size",
      minSelected: 1,
      maxSelected: 1,
      isRequired: true,
      sortOrder: 1,
      options: [
        { key: "small", name: 'Small 25cm', priceDelta: 0 },
        { key: "medium", name: 'Medium 30cm', priceDelta: 2.0 },
        { key: "large", name: 'Large 35cm', priceDelta: 4.0 },
      ],
    },
    {
      key: "pizza_toppings",
      name: "Extra Toppings",
      minSelected: 0,
      maxSelected: 6,
      isRequired: false,
      sortOrder: 2,
      options: [
        { key: "mushrooms", name: "Mushrooms", priceDelta: 1.0 },
        { key: "olives", name: "Olives", priceDelta: 0.8 },
        { key: "pepperoni", name: "Pepperoni", priceDelta: 1.5 },
        { key: "extra_mozzarella", name: "Extra mozzarella", priceDelta: 1.2 },
      ],
    },
    {
      key: "drink_ice",
      name: "Ice",
      minSelected: 0,
      maxSelected: 1,
      isRequired: false,
      sortOrder: 1,
      options: [
        { key: "no_ice", name: "No ice" },
        { key: "regular_ice", name: "Regular ice" },
        { key: "extra_ice", name: "Extra ice" },
      ],
    },
    {
      key: "coffee_milk",
      name: "Milk",
      minSelected: 0,
      maxSelected: 1,
      isRequired: false,
      sortOrder: 1,
      options: [
        { key: "regular", name: "Regular" },
        { key: "oat", name: "Oat milk", priceDelta: 0.7 },
        { key: "almond", name: "Almond milk", priceDelta: 0.9 },
        { key: "lactose_free", name: "Lactose-free", priceDelta: 0.5 },
      ],
    },
    {
      key: "coffee_syrup",
      name: "Syrup",
      minSelected: 0,
      maxSelected: 2,
      isRequired: false,
      sortOrder: 2,
      options: [
        { key: "vanilla", name: "Vanilla", priceDelta: 0.5 },
        { key: "caramel", name: "Caramel", priceDelta: 0.5 },
        { key: "hazelnut", name: "Hazelnut", priceDelta: 0.5 },
      ],
    },
  ];

  const itemGroupMap: ItemGroupMapSeed[] = [
    { itemKey: "burger", groupKey: "burger_cook" },
    { itemKey: "burger", groupKey: "burger_addons" },
    { itemKey: "burger", groupKey: "sauce_choice" },
    { itemKey: "fries", groupKey: "sauce_choice" },
    { itemKey: "wings", groupKey: "sauce_choice" },

    { itemKey: "pizza", groupKey: "pizza_size" },
    { itemKey: "pizza", groupKey: "pizza_toppings" },

    { itemKey: "cola", groupKey: "drink_ice" },
    { itemKey: "beer", groupKey: "drink_ice" },

    { itemKey: "latte", groupKey: "coffee_milk" },
    { itemKey: "latte", groupKey: "coffee_syrup" },
  ];

  // 1) Categories
  const categoryByKey = new Map<string, { id: number }>();

  for (const c of categories) {
    // Нет уникального индекса - поэтому ищем вручную
    const existing = await prisma.menuCategory.findFirst({
      where: { locationId: location.id, name: c.name },
      select: { id: true },
    });

    const row =
      existing ??
      (await prisma.menuCategory.create({
        data: {
          locationId: location.id,
          name: c.name,
          sortOrder: c.sortOrder,
          isActive: true,
        },
        select: { id: true },
      }));

    categoryByKey.set(c.key, row);
  }

  // 2) Modifier Groups + Options
  const groupByKey = new Map<string, { id: number }>();
  const optionByKey = new Map<string, { id: number }>(); // key = `${groupKey}:${optionKey}`

  for (const g of modifierGroups) {
    const existing = await prisma.modifierGroup.findFirst({
      where: { locationId: location.id, name: g.name },
      select: { id: true },
    });

    const group =
      existing ??
      (await prisma.modifierGroup.create({
        data: {
          locationId: location.id,
          name: g.name,
          minSelected: g.minSelected ?? null,
          maxSelected: g.maxSelected ?? null,
          isRequired: g.isRequired ?? false,
          sortOrder: g.sortOrder ?? null,
          isActive: true,
        },
        select: { id: true },
      }));

    groupByKey.set(g.key, group);

    for (const o of g.options) {
      const optExisting = await prisma.modifierOption.findFirst({
        where: { modifierGroupId: group.id, name: o.name },
        select: { id: true },
      });

      const opt =
        optExisting ??
        (await prisma.modifierOption.create({
          data: {
            modifierGroupId: group.id,
            name: o.name,
            priceDelta:
              typeof o.priceDelta === "number" ? money(o.priceDelta) : null,
            isActive: true,
          },
          select: { id: true },
        }));

      optionByKey.set(`${g.key}:${o.key}`, opt);
    }
  }

  // 3) Menu Items
  const itemByKey = new Map<string, { id: number }>();

  for (const it of items) {
    const category = categoryByKey.get(it.categoryKey);
    if (!category) throw new Error(`Missing categoryKey: ${it.categoryKey}`);

    const kdsStationId =
      it.kdsStationCode ? kds[it.kdsStationCode]?.id : undefined;

    const existing = await prisma.menuItem.findFirst({
      where: {
        locationId: location.id,
        name: it.name,
        categoryId: category.id,
      },
      select: { id: true },
    });

    const row =
      existing ??
      (await prisma.menuItem.create({
        data: {
          locationId: location.id,
          categoryId: category.id,
          name: it.name,
          sku: it.sku ?? null,
          basePrice: money(it.basePrice),
          isAlcohol: it.isAlcohol ?? false,
          isActive: true,
          kdsStationId: kdsStationId ?? null,
        },
        select: { id: true },
      }));

    itemByKey.set(it.key, row);
  }

  // 4) Map groups to items (MenuItemModifierGroup)
  for (const link of itemGroupMap) {
    const item = itemByKey.get(link.itemKey);
    const group = groupByKey.get(link.groupKey);
    if (!item) throw new Error(`Missing itemKey: ${link.itemKey}`);
    if (!group) throw new Error(`Missing groupKey: ${link.groupKey}`);

    // есть @@unique([menuItemId, modifierGroupId]) → можно create with catch
    const exists = await prisma.menuItemModifierGroup.findFirst({
      where: { menuItemId: item.id, modifierGroupId: group.id },
      select: { id: true },
    });

    if (!exists) {
      await prisma.menuItemModifierGroup.create({
        data: { menuItemId: item.id, modifierGroupId: group.id },
      });
    }
  }

  console.log("Seed completed");
  console.log(`Location id: ${location.id}`);
}

main()
  .catch((e) => {
    console.error("Seed failed");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
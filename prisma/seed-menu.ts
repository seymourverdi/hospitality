import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function money(n: number) {
  return n.toFixed(2);
}

async function main() {
  const locationId = Number(process.env.SEED_LOCATION_ID || "1");
  if (!Number.isInteger(locationId) || locationId <= 0) {
    throw new Error("Invalid SEED_LOCATION_ID");
  }

  // Ensure KDS stations exist
  const kitchen = await prisma.kDSStation.upsert({
    where: { id: 1 }, // если у тебя уже есть Kitchen id=1 — ок
    update: {},
    create: {
      locationId,
      name: "Kitchen",
      code: "KITCHEN",
      sortOrder: 1,
      isActive: true,
    },
    select: { id: true },
  });

  const bar = await prisma.kDSStation.upsert({
    where: { id: 2 }, // если нет — Prisma создаст с новым id, это не страшно
    update: {},
    create: {
      locationId,
      name: "Bar",
      code: "BAR",
      sortOrder: 2,
      isActive: true,
    },
    select: { id: true },
  });

  // Categories (upsert by unique? у тебя нет уникального, поэтому findFirst + create)
  async function getOrCreateCategory(name: string, slug: string, sortOrder: number) {
    const existing = await prisma.menuCategory.findFirst({
      where: { locationId, name },
      select: { id: true },
    });
    if (existing) return existing;

    return prisma.menuCategory.create({
      data: { locationId, name, slug, sortOrder, isActive: true },
      select: { id: true },
    });
  }

  const catFood = await getOrCreateCategory("Food", "food", 1);
  const catDrinks = await getOrCreateCategory("Drinks", "drinks", 2);
  const catDesserts = await getOrCreateCategory("Desserts", "desserts", 3);
  const catStarters = await getOrCreateCategory("Starters", "starters", 4);

  // Helper: create menu item if not exists (by name+category)
  async function getOrCreateItem(params: {
    categoryId: number;
    name: string;
    sku: string;
    basePrice: number;
    kdsStationId?: number | null;
    isAlcohol?: boolean;
  }) {
    const existing = await prisma.menuItem.findFirst({
      where: { locationId, categoryId: params.categoryId, name: params.name },
      select: { id: true },
    });
    if (existing) return existing;

    return prisma.menuItem.create({
      data: {
        locationId,
        categoryId: params.categoryId,
        name: params.name,
        sku: params.sku,
        basePrice: money(params.basePrice),
        taxRate: money(0),
        isAlcohol: params.isAlcohol ?? false,
        isActive: true,
        kdsStationId: params.kdsStationId ?? null,
      },
      select: { id: true },
    });
  }

  // Items
  const fries = await getOrCreateItem({
    categoryId: catStarters.id,
    name: "French Fries",
    sku: "ST-001",
    basePrice: 3.5,
    kdsStationId: kitchen.id,
  });

  const wings = await getOrCreateItem({
    categoryId: catStarters.id,
    name: "Chicken Wings",
    sku: "ST-002",
    basePrice: 6.9,
    kdsStationId: kitchen.id,
  });

  const burger = await getOrCreateItem({
    categoryId: catFood.id,
    name: "Classic Burger",
    sku: "MN-001",
    basePrice: 10.9,
    kdsStationId: kitchen.id,
  });

  const pizza = await getOrCreateItem({
    categoryId: catFood.id,
    name: "Margherita Pizza",
    sku: "MN-002",
    basePrice: 11.5,
    kdsStationId: kitchen.id,
  });

  const cola = await getOrCreateItem({
    categoryId: catDrinks.id,
    name: "Cola",
    sku: "DR-001",
    basePrice: 2.8,
    kdsStationId: bar.id,
  });

  const beer = await getOrCreateItem({
    categoryId: catDrinks.id,
    name: "Lager Beer",
    sku: "DR-002",
    basePrice: 4.5,
    kdsStationId: bar.id,
    isAlcohol: true,
  });

  const latte = await getOrCreateItem({
    categoryId: catDrinks.id,
    name: "Latte",
    sku: "DR-003",
    basePrice: 3.9,
    kdsStationId: bar.id,
  });

  await getOrCreateItem({
    categoryId: catDesserts.id,
    name: "Cheesecake",
    sku: "DS-001",
    basePrice: 5.2,
    kdsStationId: kitchen.id,
  });

  // Modifier groups/options
  async function getOrCreateGroup(name: string, data: { min?: number | null; max?: number | null; required?: boolean }) {
    const existing = await prisma.modifierGroup.findFirst({
      where: { locationId, name },
      select: { id: true },
    });
    if (existing) return existing;

    return prisma.modifierGroup.create({
      data: {
        locationId,
        name,
        minSelected: data.min ?? null,
        maxSelected: data.max ?? null,
        isRequired: data.required ?? false,
        isActive: true,
      },
      select: { id: true },
    });
  }

  async function getOrCreateOption(groupId: number, name: string, priceDelta?: number) {
    const existing = await prisma.modifierOption.findFirst({
      where: { modifierGroupId: groupId, name },
      select: { id: true },
    });
    if (existing) return existing;

    return prisma.modifierOption.create({
      data: {
        modifierGroupId: groupId,
        name,
        priceDelta: typeof priceDelta === "number" ? money(priceDelta) : null,
        isActive: true,
      },
      select: { id: true },
    });
  }

  const grpCook = await getOrCreateGroup("Cooking Preference", { min: 1, max: 1, required: true });
  await getOrCreateOption(grpCook.id, "Rare");
  await getOrCreateOption(grpCook.id, "Medium");
  await getOrCreateOption(grpCook.id, "Well-done");

  const grpAddons = await getOrCreateGroup("Add-ons", { min: 0, max: 5, required: false });
  await getOrCreateOption(grpAddons.id, "Extra cheese", 1.0);
  await getOrCreateOption(grpAddons.id, "Bacon", 1.5);
  await getOrCreateOption(grpAddons.id, "Jalapeño", 0.7);

  const grpSauce = await getOrCreateGroup("Sauce Choice", { min: 0, max: 2, required: false });
  await getOrCreateOption(grpSauce.id, "BBQ");
  await getOrCreateOption(grpSauce.id, "Mayo");
  await getOrCreateOption(grpSauce.id, "Ketchup");
  await getOrCreateOption(grpSauce.id, "Spicy sauce", 0.3);

  const grpPizzaSize = await getOrCreateGroup("Pizza Size", { min: 1, max: 1, required: true });
  await getOrCreateOption(grpPizzaSize.id, "Small 25cm", 0);
  await getOrCreateOption(grpPizzaSize.id, "Medium 30cm", 2.0);
  await getOrCreateOption(grpPizzaSize.id, "Large 35cm", 4.0);

  const grpToppings = await getOrCreateGroup("Extra Toppings", { min: 0, max: 6, required: false });
  await getOrCreateOption(grpToppings.id, "Mushrooms", 1.0);
  await getOrCreateOption(grpToppings.id, "Olives", 0.8);
  await getOrCreateOption(grpToppings.id, "Pepperoni", 1.5);
  await getOrCreateOption(grpToppings.id, "Extra mozzarella", 1.2);

  const grpIce = await getOrCreateGroup("Ice", { min: 0, max: 1, required: false });
  await getOrCreateOption(grpIce.id, "No ice");
  await getOrCreateOption(grpIce.id, "Regular ice");
  await getOrCreateOption(grpIce.id, "Extra ice");

  const grpMilk = await getOrCreateGroup("Milk", { min: 0, max: 1, required: false });
  await getOrCreateOption(grpMilk.id, "Regular");
  await getOrCreateOption(grpMilk.id, "Oat milk", 0.7);
  await getOrCreateOption(grpMilk.id, "Almond milk", 0.9);
  await getOrCreateOption(grpMilk.id, "Lactose-free", 0.5);

  const grpSyrup = await getOrCreateGroup("Syrup", { min: 0, max: 2, required: false });
  await getOrCreateOption(grpSyrup.id, "Vanilla", 0.5);
  await getOrCreateOption(grpSyrup.id, "Caramel", 0.5);
  await getOrCreateOption(grpSyrup.id, "Hazelnut", 0.5);

  // Link groups to items (MenuItemModifierGroup has @@unique)
  async function link(itemId: number, groupId: number) {
    const exists = await prisma.menuItemModifierGroup.findFirst({
      where: { menuItemId: itemId, modifierGroupId: groupId },
      select: { id: true },
    });
    if (exists) return;

    await prisma.menuItemModifierGroup.create({
      data: { menuItemId: itemId, modifierGroupId: groupId },
    });
  }

  await link(burger.id, grpCook.id);
  await link(burger.id, grpAddons.id);
  await link(burger.id, grpSauce.id);
  await link(fries.id, grpSauce.id);
  await link(wings.id, grpSauce.id);

  await link(pizza.id, grpPizzaSize.id);
  await link(pizza.id, grpToppings.id);

  await link(cola.id, grpIce.id);
  await link(beer.id, grpIce.id);

  await link(latte.id, grpMilk.id);
  await link(latte.id, grpSyrup.id);

  console.log("Menu seed completed for locationId =", locationId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
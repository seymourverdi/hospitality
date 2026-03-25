/**
 * prisma/seed.ts
 *
 * Comprehensive, idempotent seed for the City Club HMS.
 * Safe to run multiple times — uses upsert patterns throughout.
 *
 * Usage on server:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 *   or:  npx prisma db seed
 */

import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] })

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(n.toFixed(2))
}

async function main() {
  console.log('🌱  Seed started …')

  // 1. Roles
  const adminRole = await prisma.role.upsert({ where: { id: 1 }, update: {}, create: { name: 'Admin',   permissionsJson: { all: true } } })
  const mgrRole   = await prisma.role.upsert({ where: { id: 2 }, update: {}, create: { name: 'Manager', permissionsJson: { pos: true, reports: true, settings: true } } })
  const cashRole  = await prisma.role.upsert({ where: { id: 3 }, update: {}, create: { name: 'Cashier', permissionsJson: { pos: true, payments: true } } })
  const waitRole  = await prisma.role.upsert({ where: { id: 4 }, update: {}, create: { name: 'Waiter',  permissionsJson: { pos: true, tables: true } } })
  console.log('  ✓ Roles')

  // 2. Location
  const loc = await prisma.restaurantLocation.upsert({
    where: { id: 1 }, update: {},
    create: { name: 'City Club', code: 'CITY', timezone: 'Europe/Kiev', address: 'City Club Address', phone: '+380000000000', isActive: true },
  })
  console.log('  ✓ Location:', loc.name)

  // 3. KDS Stations
  const kKitchen = await prisma.kDSStation.upsert({ where: { id: 1 }, update: {}, create: { locationId: loc.id, name: 'Kitchen', code: 'KITCHEN', sortOrder: 1, isActive: true } })
  const kBar     = await prisma.kDSStation.upsert({ where: { id: 2 }, update: {}, create: { locationId: loc.id, name: 'Bar',     code: 'BAR',     sortOrder: 2, isActive: true } })
  console.log('  ✓ KDS Stations')

  // 4. Terminals
  const pos1 = await prisma.terminal.upsert({ where: { id: 1 }, update: {}, create: { locationId: loc.id, name: 'POS 1',           code: 'POS-1',  deviceType: 'POS', isActive: true } })
               await prisma.terminal.upsert({ where: { id: 2 }, update: {}, create: { locationId: loc.id, name: 'POS 2',           code: 'POS-2',  deviceType: 'POS', isActive: true } })
               await prisma.terminal.upsert({ where: { id: 3 }, update: {}, create: { locationId: loc.id, name: 'Kitchen Display', code: 'KDS-1',  deviceType: 'KDS', kdsStationId: kKitchen.id, isActive: true } })
               await prisma.terminal.upsert({ where: { id: 4 }, update: {}, create: { locationId: loc.id, name: 'Bar Display',     code: 'KDS-2',  deviceType: 'KDS', kdsStationId: kBar.id,     isActive: true } })
  console.log('  ✓ Terminals')

  // 5. Users
  await prisma.user.upsert({ where: { id: 1 }, update: {}, create: { locationId: loc.id, roleId: adminRole.id, firstName: 'Admin',   lastName: '',  pinCode: '1111', isActive: true } })
  await prisma.user.upsert({ where: { id: 2 }, update: {}, create: { locationId: loc.id, roleId: mgrRole.id,   firstName: 'Manager', lastName: '',  pinCode: '2222', isActive: true } })
  await prisma.user.upsert({ where: { id: 3 }, update: {}, create: { locationId: loc.id, roleId: cashRole.id,  firstName: 'Cashier', lastName: '',  pinCode: '3333', isActive: true } })
  await prisma.user.upsert({ where: { id: 4 }, update: {}, create: { locationId: loc.id, roleId: waitRole.id,  firstName: 'Waiter',  lastName: '1', pinCode: '4444', isActive: true } })
  await prisma.user.upsert({ where: { id: 5 }, update: {}, create: { locationId: loc.id, roleId: waitRole.id,  firstName: 'Waiter',  lastName: '2', pinCode: '5555', isActive: true } })
  console.log('  ✓ Users (PINs: 1111 Admin, 2222 Manager, 3333 Cashier, 4444/5555 Waiters)')

  // 6. Areas
  const aHall    = await prisma.area.upsert({ where: { id: 1 }, update: {}, create: { locationId: loc.id, name: 'Main Hall', sortOrder: 1, isActive: true } })
  const aTerrace = await prisma.area.upsert({ where: { id: 2 }, update: {}, create: { locationId: loc.id, name: 'Terrace',   sortOrder: 2, isActive: true } })
  const aBar     = await prisma.area.upsert({ where: { id: 3 }, update: {}, create: { locationId: loc.id, name: 'Bar',       sortOrder: 3, isActive: true } })
  console.log('  ✓ Areas')

  // 7. Tables
  const tbl = async (id: number, areaId: number, name: string, cap: number) =>
    prisma.table.upsert({ where: { id }, update: {}, create: { id, locationId: loc.id, areaId, name, capacity: cap, status: 'free', isActive: true } })
  await tbl(1,  aHall.id,    'T1', 4); await tbl(2,  aHall.id,    'T2', 4)
  await tbl(3,  aHall.id,    'T3', 4); await tbl(4,  aHall.id,    'T4', 4)
  await tbl(5,  aHall.id,    'T5', 6); await tbl(6,  aHall.id,    'T6', 6)
  await tbl(7,  aHall.id,    'T7', 8); await tbl(8,  aHall.id,    'T8', 8)
  await tbl(9,  aTerrace.id, 'P1', 2); await tbl(10, aTerrace.id, 'P2', 2)
  await tbl(11, aTerrace.id, 'P3', 4); await tbl(12, aTerrace.id, 'P4', 4)
  await tbl(13, aBar.id,     'B1', 2); await tbl(14, aBar.id,     'B2', 2)
  await tbl(15, aBar.id,     'B3', 2); await tbl(16, aBar.id,     'B4', 2)
  console.log('  ✓ Tables (16)')

  // 8. Menu categories
  const cSt  = await prisma.menuCategory.upsert({ where: { id: 1  }, update: {}, create: { id: 1,  locationId: loc.id, name: 'Starters',      slug: 'starters',    sortOrder: 1,  isActive: true } })
  const cSo  = await prisma.menuCategory.upsert({ where: { id: 2  }, update: {}, create: { id: 2,  locationId: loc.id, name: 'Soups',         slug: 'soups',       sortOrder: 2,  isActive: true } })
  const cSa  = await prisma.menuCategory.upsert({ where: { id: 3  }, update: {}, create: { id: 3,  locationId: loc.id, name: 'Salads',        slug: 'salads',      sortOrder: 3,  isActive: true } })
  const cMn  = await prisma.menuCategory.upsert({ where: { id: 4  }, update: {}, create: { id: 4,  locationId: loc.id, name: 'Main Course',   slug: 'main',        sortOrder: 4,  isActive: true } })
  const cGr  = await prisma.menuCategory.upsert({ where: { id: 5  }, update: {}, create: { id: 5,  locationId: loc.id, name: 'Grill',         slug: 'grill',       sortOrder: 5,  isActive: true } })
  const cPp  = await prisma.menuCategory.upsert({ where: { id: 6  }, update: {}, create: { id: 6,  locationId: loc.id, name: 'Pasta & Pizza', slug: 'pasta',       sortOrder: 6,  isActive: true } })
  const cDs  = await prisma.menuCategory.upsert({ where: { id: 7  }, update: {}, create: { id: 7,  locationId: loc.id, name: 'Desserts',      slug: 'desserts',    sortOrder: 7,  isActive: true } })
  const cSd  = await prisma.menuCategory.upsert({ where: { id: 8  }, update: {}, create: { id: 8,  locationId: loc.id, name: 'Soft Drinks',   slug: 'soft-drinks', sortOrder: 8,  isActive: true } })
  const cHd  = await prisma.menuCategory.upsert({ where: { id: 9  }, update: {}, create: { id: 9,  locationId: loc.id, name: 'Hot Drinks',    slug: 'hot-drinks',  sortOrder: 9,  isActive: true } })
  const cAl  = await prisma.menuCategory.upsert({ where: { id: 10 }, update: {}, create: { id: 10, locationId: loc.id, name: 'Alcohol',       slug: 'alcohol',     sortOrder: 10, isActive: true } })
  console.log('  ✓ Categories (10)')

  // 9. Menu items
  const item = async (id: number, catId: number, name: string, sku: string, price: number, kds: number | null, alc = false) =>
    prisma.menuItem.upsert({ where: { id }, update: {}, create: { id, locationId: loc.id, categoryId: catId, name, sku, basePrice: dec(price), taxRate: dec(0), isAlcohol: alc, isActive: true, kdsStationId: kds } })

  const K = kKitchen.id, Br = kBar.id
  const fries   = await item(1,  cSt.id, 'French Fries',         'ST-001', 3.50, K)
  const wings   = await item(2,  cSt.id, 'Chicken Wings',        'ST-002', 6.90, K)
                  await item(3,  cSt.id, 'Bruschetta',           'ST-003', 5.50, K)
                  await item(4,  cSt.id, 'Nachos',               'ST-004', 6.20, K)
                  await item(5,  cSo.id, 'Tomato Soup',          'SO-001', 5.00, K)
                  await item(6,  cSo.id, 'French Onion Soup',    'SO-002', 6.00, K)
                  await item(7,  cSa.id, 'Caesar Salad',         'SA-001', 8.50, K)
                  await item(8,  cSa.id, 'Greek Salad',          'SA-002', 7.90, K)
                  await item(9,  cSa.id, 'Caprese',              'SA-003', 9.00, K)
                  await item(10, cMn.id, 'Grilled Salmon',       'MN-001', 18.50, K)
                  await item(11, cMn.id, 'Chicken Kiev',         'MN-002', 14.90, K)
                  await item(12, cMn.id, 'Pork Chop',            'MN-003', 15.50, K)
                  await item(13, cMn.id, 'Fish & Chips',         'MN-004', 13.90, K)
  const ribeye  = await item(14, cGr.id, 'Ribeye Steak 300g',    'GR-001', 32.00, K)
  const sirloin = await item(15, cGr.id, 'Sirloin Steak 250g',   'GR-002', 28.00, K)
                  await item(16, cGr.id, 'BBQ Ribs',             'GR-003', 24.00, K)
                  await item(17, cGr.id, 'Grilled Chicken',      'GR-004', 16.50, K)
  const burger  = await item(18, cPp.id, 'Classic Burger',       'PP-001', 10.90, K)
  const pizza   = await item(19, cPp.id, 'Margherita Pizza',     'PP-002', 11.50, K)
                  await item(20, cPp.id, 'Pepperoni Pizza',      'PP-003', 12.90, K)
                  await item(21, cPp.id, 'Spaghetti Carbonara',  'PP-004', 11.00, K)
                  await item(22, cPp.id, 'Penne Arrabbiata',     'PP-005', 10.00, K)
                  await item(23, cDs.id, 'Cheesecake',           'DS-001', 5.20, K)
                  await item(24, cDs.id, 'Tiramisu',             'DS-002', 5.90, K)
                  await item(25, cDs.id, 'Creme Brulee',         'DS-003', 6.50, K)
                  await item(26, cDs.id, 'Ice Cream (2 scoops)', 'DS-004', 4.50, K)
  const cola    = await item(27, cSd.id, 'Cola',                 'SD-001', 2.80, Br)
                  await item(28, cSd.id, 'Lemonade',             'SD-002', 3.00, Br)
                  await item(29, cSd.id, 'Orange Juice',         'SD-003', 3.50, Br)
                  await item(30, cSd.id, 'Still Water',          'SD-004', 1.50, Br)
                  await item(31, cSd.id, 'Sparkling Water',      'SD-005', 1.80, Br)
  const latte   = await item(32, cHd.id, 'Latte',                'HD-001', 3.90, Br)
                  await item(33, cHd.id, 'Americano',            'HD-002', 2.90, Br)
                  await item(34, cHd.id, 'Cappuccino',           'HD-003', 3.50, Br)
                  await item(35, cHd.id, 'Espresso',             'HD-004', 2.20, Br)
                  await item(36, cHd.id, 'Tea',                  'HD-005', 2.50, Br)
  const beer    = await item(37, cAl.id, 'Lager Beer (0.5L)',    'AL-001', 4.50, Br, true)
                  await item(38, cAl.id, 'Dark Beer (0.5L)',     'AL-002', 4.90, Br, true)
                  await item(39, cAl.id, 'House Red Wine',       'AL-003', 6.50, Br, true)
                  await item(40, cAl.id, 'House White Wine',     'AL-004', 6.50, Br, true)
                  await item(41, cAl.id, 'Prosecco (glass)',     'AL-005', 7.50, Br, true)
                  await item(42, cAl.id, 'Whisky (50ml)',        'AL-006', 8.00, Br, true)
                  await item(43, cAl.id, 'Vodka (50ml)',         'AL-007', 5.50, Br, true)
                  await item(44, cAl.id, 'Gin & Tonic',          'AL-008', 9.00, Br, true)
  console.log('  ✓ Menu items (44)')

  // 10. Modifier groups & options
  const grp = async (id: number, name: string, min: number | null, max: number | null, req = false) =>
    prisma.modifierGroup.upsert({ where: { id }, update: {}, create: { id, locationId: loc.id, name, minSelected: min, maxSelected: max, isRequired: req, isActive: true } })
  const opt = async (id: number, gid: number, name: string, price?: number) =>
    prisma.modifierOption.upsert({ where: { id }, update: {}, create: { id, modifierGroupId: gid, name, priceDelta: price !== undefined ? dec(price) : null, isActive: true } })

  const gCook  = await grp(1,  'Cooking Preference', 1, 1, true)
  await opt(1,  gCook.id,  'Rare');   await opt(2, gCook.id, 'Medium Rare'); await opt(3, gCook.id, 'Medium'); await opt(4, gCook.id, 'Well-done')

  const gSauce = await grp(2,  'Sauce Choice',  0, 2)
  await opt(5,  gSauce.id, 'BBQ'); await opt(6, gSauce.id, 'Mayo'); await opt(7, gSauce.id, 'Ketchup'); await opt(8, gSauce.id, 'Spicy sauce', 0.3)

  const gAddon = await grp(3,  'Burger Add-ons', 0, 5)
  await opt(9,  gAddon.id, 'Extra cheese', 1.0); await opt(10, gAddon.id, 'Bacon', 1.5); await opt(11, gAddon.id, 'Jalapeño', 0.7)
  await opt(12, gAddon.id, 'Avocado', 1.2);      await opt(13, gAddon.id, 'No onions');  await opt(14, gAddon.id, 'No tomato')

  const gPSize = await grp(4,  'Pizza Size',    1, 1, true)
  await opt(15, gPSize.id, 'Small 25cm', 0); await opt(16, gPSize.id, 'Medium 30cm', 2.0); await opt(17, gPSize.id, 'Large 35cm', 4.0)

  const gTop   = await grp(5,  'Extra Toppings', 0, 6)
  await opt(18, gTop.id,   'Mushrooms', 1.0); await opt(19, gTop.id, 'Olives', 0.8); await opt(20, gTop.id, 'Pepperoni', 1.5)
  await opt(21, gTop.id,   'Extra mozzarella', 1.2); await opt(22, gTop.id, 'Roasted peppers', 0.9)

  const gMilk  = await grp(6,  'Milk',    0, 1)
  await opt(23, gMilk.id,  'Regular'); await opt(24, gMilk.id, 'Oat milk', 0.7); await opt(25, gMilk.id, 'Almond milk', 0.9); await opt(26, gMilk.id, 'Lactose-free', 0.5)

  const gSyrup = await grp(7,  'Syrup',   0, 2)
  await opt(27, gSyrup.id, 'Vanilla', 0.5); await opt(28, gSyrup.id, 'Caramel', 0.5); await opt(29, gSyrup.id, 'Hazelnut', 0.5)

  const gIce   = await grp(8,  'Ice',     0, 1)
  await opt(30, gIce.id,   'No ice'); await opt(31, gIce.id, 'Regular ice'); await opt(32, gIce.id, 'Extra ice')

  const gGSide = await grp(9,  'Grill Side',  1, 1, true)
  await opt(33, gGSide.id, 'French fries'); await opt(34, gGSide.id, 'Grilled vegetables'); await opt(35, gGSide.id, 'Mashed potato')
  await opt(36, gGSide.id, 'Rice');         await opt(37, gGSide.id, 'Salad')

  const gGSauce = await grp(10, 'Grill Sauce', 0, 2)
  await opt(38, gGSauce.id, 'Pepper sauce'); await opt(39, gGSauce.id, 'Mushroom sauce'); await opt(40, gGSauce.id, 'Red wine sauce'); await opt(41, gGSauce.id, 'Garlic butter')
  console.log('  ✓ Modifier groups & options')

  // 11. Item → modifier group links
  const lnk = async (mi: number, mg: number) =>
    prisma.menuItemModifierGroup.upsert({ where: { menuItemId_modifierGroupId: { menuItemId: mi, modifierGroupId: mg } }, update: {}, create: { menuItemId: mi, modifierGroupId: mg } })

  await lnk(fries.id,   gSauce.id);  await lnk(wings.id,   gSauce.id)
  await lnk(burger.id,  gAddon.id);  await lnk(burger.id,  gSauce.id)
  await lnk(pizza.id,   gPSize.id);  await lnk(pizza.id,   gTop.id)
  await lnk(ribeye.id,  gCook.id);   await lnk(ribeye.id,  gGSide.id);  await lnk(ribeye.id,  gGSauce.id)
  await lnk(sirloin.id, gCook.id);   await lnk(sirloin.id, gGSide.id);  await lnk(sirloin.id, gGSauce.id)
  await lnk(latte.id,   gMilk.id);   await lnk(latte.id,   gSyrup.id)
  await lnk(cola.id,    gIce.id);    await lnk(beer.id,    gIce.id)
  console.log('  ✓ Item–modifier links')

  // 12. Location Settings
  await prisma.locationSettings.upsert({
    where: { locationId: loc.id }, update: {},
    create: {
      locationId: loc.id,
      statsConfig:   { showRevenue: true, showCovers: true, showAverageCheck: true, showTopItems: true, defaultPeriod: 'today' },
      saleConfig:    { requireTable: false, allowNotes: true, allowDiscounts: true, allowVoid: true, allowScheduledOrders: true },
      rsvpConfig:    { allowAllDayMenu: true, allowSocialLunch: true, allowMixed: true, showTablesOption: true, allowGuestOverride: true },
      displayConfig: { autoRefreshSeconds: 10, showElapsedTime: true, showTableName: true, showServerName: true },
      tablesConfig:  { showOccupancy: true, showActiveOrders: true, colorByStatus: true },
      filterConfig:  { defaultStatus: 'all', defaultPeriod: 'today', showVoided: false },
      logConfig:     { retentionDays: 30, logLevel: 'info' },
    },
  })
  console.log('  ✓ Location settings')

  // 13. Open shift (if none exists)
  const hasShift = await prisma.shift.findFirst({ where: { locationId: loc.id, terminalId: pos1.id, status: 'OPEN' } })
  if (!hasShift) {
    await prisma.shift.create({ data: { locationId: loc.id, userId: 1, terminalId: pos1.id, openedAt: new Date(), openingCashAmount: dec(0), status: 'OPEN' } })
    console.log('  ✓ Open shift created')
  } else {
    console.log('  ✓ Open shift already exists')
  }

  console.log('\n✅  Seed done!')
  console.log('    PINs: 1111=Admin  2222=Manager  3333=Cashier  4444/5555=Waiter')
}

main()
  .catch((e) => { console.error('❌  Seed error:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
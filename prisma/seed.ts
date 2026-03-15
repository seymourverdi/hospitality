import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  DeviceType,
  KdsStatus,
  KitchenTicketStatus,
  MembershipLevel,
  ModifierGroup,
  OrderItemStatus,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  ReservationSource,
  ReservationStatus,
  ShiftStatus,
} from '@prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({
  connectionString,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

async function resetDatabase() {
  await prisma.paymentRefund.deleteMany()
  await prisma.apiIdempotency.deleteMany()
  await prisma.kitchenTicketItem.deleteMany()
  await prisma.kitchenTicket.deleteMany()
  await prisma.session.deleteMany()
  await prisma.savedFilter.deleteMany()
  await prisma.displayLayout.deleteMany()
  await prisma.reportSnapshot.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItemModifier.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItemModifierGroup.deleteMany()
  await prisma.modifierOption.deleteMany()
  await prisma.modifierGroup.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.reservationTable.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.table.deleteMany()
  await prisma.area.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.terminal.deleteMany()
  await prisma.kDSStation.deleteMany()
  await prisma.restaurantLocation.deleteMany()
}

async function main() {
  await resetDatabase()

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      permissionsJson: {
        all: true,
      },
    },
  })

  const managerRole = await prisma.role.create({
    data: {
      name: 'manager',
      permissionsJson: {
        reports: true,
        discounts: true,
        voids: true,
        shiftControl: true,
      },
    },
  })

  const cashierRole = await prisma.role.create({
    data: {
      name: 'cashier',
      permissionsJson: {
        pos: true,
        payments: true,
        openOrders: true,
      },
    },
  })

  const waiterRole = await prisma.role.create({
    data: {
      name: 'waiter',
      permissionsJson: {
        pos: true,
        tables: true,
        sendToKitchen: true,
      },
    },
  })

  const location = await prisma.restaurantLocation.create({
    data: {
      name: 'Demo Hospitality',
      code: 'DEMO',
      timezone: 'Europe/Kiev',
      address: 'Demo Street 1',
      phone: '+380000000000',
      isActive: true,
    },
  })

  const hotKitchen = await prisma.kDSStation.create({
    data: {
      locationId: location.id,
      name: 'Hot Kitchen',
      code: 'HOT',
      sortOrder: 1,
      isActive: true,
    },
  })

  const barStation = await prisma.kDSStation.create({
    data: {
      locationId: location.id,
      name: 'Bar',
      code: 'BAR',
      sortOrder: 2,
      isActive: true,
    },
  })

  const frontPos = await prisma.terminal.create({
    data: {
      locationId: location.id,
      name: 'Front POS',
      code: 'POS-1',
      deviceType: DeviceType.POS,
      kdsStationId: hotKitchen.id,
      isActive: true,
    },
  })

  const barTerminal = await prisma.terminal.create({
    data: {
      locationId: location.id,
      name: 'Bar POS',
      code: 'BAR-1',
      deviceType: DeviceType.BAR,
      kdsStationId: barStation.id,
      isActive: true,
    },
  })

  const kdsTerminal = await prisma.terminal.create({
    data: {
      locationId: location.id,
      name: 'Kitchen Screen',
      code: 'KDS-1',
      deviceType: DeviceType.KDS,
      kdsStationId: hotKitchen.id,
      isActive: true,
    },
  })

  const mainHall = await prisma.area.create({
    data: {
      locationId: location.id,
      name: 'Main Hall',
      sortOrder: 1,
      isActive: true,
    },
  })

  const patio = await prisma.area.create({
    data: {
      locationId: location.id,
      name: 'Patio',
      sortOrder: 2,
      isActive: true,
    },
  })

  const t1 = await prisma.table.create({
    data: {
      locationId: location.id,
      areaId: mainHall.id,
      name: 'T1',
      capacity: 4,
      status: 'free',
      isActive: true,
    },
  })

  const t2 = await prisma.table.create({
    data: {
      locationId: location.id,
      areaId: mainHall.id,
      name: 'T2',
      capacity: 4,
      status: 'free',
      isActive: true,
    },
  })

  const t3 = await prisma.table.create({
    data: {
      locationId: location.id,
      areaId: mainHall.id,
      name: 'T3',
      capacity: 2,
      status: 'free',
      isActive: true,
    },
  })

  const t4 = await prisma.table.create({
    data: {
      locationId: location.id,
      areaId: mainHall.id,
      name: 'T4',
      capacity: 2,
      status: 'free',
      isActive: true,
    },
  })

  const p1 = await prisma.table.create({
    data: {
      locationId: location.id,
      areaId: patio.id,
      name: 'P1',
      capacity: 4,
      status: 'free',
      isActive: true,
    },
  })

  const p2 = await prisma.table.create({
    data: {
      locationId: location.id,
      areaId: patio.id,
      name: 'P2',
      capacity: 6,
      status: 'free',
      isActive: true,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      locationId: location.id,
      firstName: 'System',
      lastName: 'Admin',
      pinCode: '1111',
      email: 'admin@example.com',
      roleId: adminRole.id,
      isActive: true,
    },
  })

  const cashierUser = await prisma.user.create({
    data: {
      locationId: location.id,
      firstName: 'John',
      lastName: 'Cashier',
      pinCode: '2222',
      email: 'cashier@example.com',
      roleId: cashierRole.id,
      isActive: true,
    },
  })

  const waiterUser = await prisma.user.create({
    data: {
      locationId: location.id,
      firstName: 'Anna',
      lastName: 'Waiter',
      pinCode: '3333',
      email: 'waiter@example.com',
      roleId: waiterRole.id,
      isActive: true,
    },
  })

  const managerUser = await prisma.user.create({
    data: {
      locationId: location.id,
      firstName: 'Kate',
      lastName: 'Manager',
      pinCode: '4444',
      email: 'manager@example.com',
      roleId: managerRole.id,
      isActive: true,
    },
  })

  const guest = await prisma.guest.create({
    data: {
      locationId: location.id,
      firstName: 'Michael',
      lastName: 'Stone',
      phone: '+380501112233',
      email: 'guest@example.com',
      note: 'Prefers window seating',
    },
  })

  const membership = await prisma.membership.create({
    data: {
      guestId: guest.id,
      membershipLevel: MembershipLevel.GOLD,
      membershipNumber: 'GOLD-0001',
      discountPercent: '10.00',
      isActive: true,
    },
  })

  await prisma.reservation.create({
    data: {
      locationId: location.id,
      guestId: guest.id,
      reservationTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      partySize: 4,
      status: ReservationStatus.CONFIRMED,
      source: ReservationSource.PHONE,
      note: 'Birthday dinner',
      tables: {
        create: [
          {
            tableId: t2.id,
          },
        ],
      },
    },
  })

  const burgersCategory = await prisma.menuCategory.create({
    data: {
      locationId: location.id,
      name: 'Burgers',
      slug: 'burgers',
      description: 'Burgers and sandwiches',
      sortOrder: 1,
      isActive: true,
    },
  })

  const pizzaCategory = await prisma.menuCategory.create({
    data: {
      locationId: location.id,
      name: 'Pizza',
      slug: 'pizza',
      description: 'Stone baked pizza',
      sortOrder: 2,
      isActive: true,
    },
  })

  const drinksCategory = await prisma.menuCategory.create({
    data: {
      locationId: location.id,
      name: 'Drinks',
      slug: 'drinks',
      description: 'Soft drinks and bar',
      sortOrder: 3,
      isActive: true,
    },
  })

  const sidesCategory = await prisma.menuCategory.create({
    data: {
      locationId: location.id,
      name: 'Sides',
      slug: 'sides',
      description: 'Snacks and sides',
      sortOrder: 4,
      isActive: true,
    },
  })

  const classicBurger = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: burgersCategory.id,
      name: 'Classic Burger',
      sku: 'BURGER-CLASSIC',
      description: 'Beef patty, lettuce, tomato, pickles',
      basePrice: '12.50',
      taxRate: '20.00',
      isAlcohol: false,
      isActive: true,
      kdsStationId: hotKitchen.id,
    },
  })

  const cheeseburger = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: burgersCategory.id,
      name: 'Cheeseburger',
      sku: 'BURGER-CHEESE',
      description: 'Beef patty with cheddar cheese',
      basePrice: '13.50',
      taxRate: '20.00',
      isAlcohol: false,
      isActive: true,
      kdsStationId: hotKitchen.id,
    },
  })

  const margherita = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: pizzaCategory.id,
      name: 'Margherita Pizza',
      sku: 'PIZZA-MARG',
      description: 'Tomato, mozzarella, basil',
      basePrice: '14.00',
      taxRate: '20.00',
      isAlcohol: false,
      isActive: true,
      kdsStationId: hotKitchen.id,
    },
  })

  const pepperoni = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: pizzaCategory.id,
      name: 'Pepperoni Pizza',
      sku: 'PIZZA-PEPP',
      description: 'Tomato, mozzarella, pepperoni',
      basePrice: '16.00',
      taxRate: '20.00',
      isAlcohol: false,
      isActive: true,
      kdsStationId: hotKitchen.id,
    },
  })

  const fries = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: sidesCategory.id,
      name: 'French Fries',
      sku: 'SIDE-FRIES',
      description: 'Crispy fries',
      basePrice: '5.50',
      taxRate: '20.00',
      isAlcohol: false,
      isActive: true,
      kdsStationId: hotKitchen.id,
    },
  })

  const caesarSalad = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: sidesCategory.id,
      name: 'Caesar Salad',
      sku: 'SALAD-CAESAR',
      description: 'Romaine, parmesan, croutons',
      basePrice: '9.00',
      taxRate: '20.00',
      isAlcohol: false,
      isActive: true,
      kdsStationId: hotKitchen.id,
    },
  })

  const cola = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: drinksCategory.id,
      name: 'Cola',
      sku: 'DRINK-COLA',
      description: '330ml bottle',
      basePrice: '3.50',
      taxRate: '20.00',
      isAlcohol: false,
      isActive: true,
      kdsStationId: barStation.id,
    },
  })

  const orangeJuice = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: drinksCategory.id,
      name: 'Orange Juice',
      sku: 'DRINK-OJ',
      description: 'Fresh orange juice',
      basePrice: '4.50',
      taxRate: '20.00',
      isAlcohol: false,
      isActive: true,
      kdsStationId: barStation.id,
    },
  })

  const beer = await prisma.menuItem.create({
    data: {
      locationId: location.id,
      categoryId: drinksCategory.id,
      name: 'Draft Beer',
      sku: 'DRINK-BEER',
      description: 'House lager 0.5L',
      basePrice: '5.00',
      taxRate: '20.00',
      isAlcohol: true,
      isActive: true,
      kdsStationId: barStation.id,
    },
  })

  const burgerAddons = await prisma.modifierGroup.create({
    data: {
      locationId: location.id,
      name: 'Burger Add-ons',
      minSelected: 0,
      maxSelected: 3,
      isRequired: false,
      sortOrder: 1,
      isActive: true,
    },
  })

  const burgerCooking = await prisma.modifierGroup.create({
    data: {
      locationId: location.id,
      name: 'Burger Cooking',
      minSelected: 1,
      maxSelected: 1,
      isRequired: true,
      sortOrder: 2,
      isActive: true,
    },
  })

  const pizzaExtras = await prisma.modifierGroup.create({
    data: {
      locationId: location.id,
      name: 'Pizza Extras',
      minSelected: 0,
      maxSelected: 3,
      isRequired: false,
      sortOrder: 3,
      isActive: true,
    },
  })

  const drinkSize = await prisma.modifierGroup.create({
    data: {
      locationId: location.id,
      name: 'Drink Size',
      minSelected: 1,
      maxSelected: 1,
      isRequired: true,
      sortOrder: 4,
      isActive: true,
    },
  })

  const extraCheese = await prisma.modifierOption.create({
    data: {
      modifierGroupId: burgerAddons.id,
      name: 'Extra Cheese',
      priceDelta: '1.50',
      sortOrder: 1,
      isActive: true,
    },
  })

  const extraBacon = await prisma.modifierOption.create({
    data: {
      modifierGroupId: burgerAddons.id,
      name: 'Bacon',
      priceDelta: '2.00',
      sortOrder: 2,
      isActive: true,
    },
  })

  const jalapeno = await prisma.modifierOption.create({
    data: {
      modifierGroupId: burgerAddons.id,
      name: 'Jalapeno',
      priceDelta: '1.00',
      sortOrder: 3,
      isActive: true,
    },
  })

  const mediumRare = await prisma.modifierOption.create({
    data: {
      modifierGroupId: burgerCooking.id,
      name: 'Medium Rare',
      priceDelta: '0.00',
      sortOrder: 1,
      isActive: true,
    },
  })

  const medium = await prisma.modifierOption.create({
    data: {
      modifierGroupId: burgerCooking.id,
      name: 'Medium',
      priceDelta: '0.00',
      sortOrder: 2,
      isActive: true,
    },
  })

  const wellDone = await prisma.modifierOption.create({
    data: {
      modifierGroupId: burgerCooking.id,
      name: 'Well Done',
      priceDelta: '0.00',
      sortOrder: 3,
      isActive: true,
    },
  })

  const extraMozzarella = await prisma.modifierOption.create({
    data: {
      modifierGroupId: pizzaExtras.id,
      name: 'Extra Mozzarella',
      priceDelta: '1.50',
      sortOrder: 1,
      isActive: true,
    },
  })

  const mushrooms = await prisma.modifierOption.create({
    data: {
      modifierGroupId: pizzaExtras.id,
      name: 'Mushrooms',
      priceDelta: '1.20',
      sortOrder: 2,
      isActive: true,
    },
  })

  const olives = await prisma.modifierOption.create({
    data: {
      modifierGroupId: pizzaExtras.id,
      name: 'Olives',
      priceDelta: '1.20',
      sortOrder: 3,
      isActive: true,
    },
  })

  const smallDrink = await prisma.modifierOption.create({
    data: {
      modifierGroupId: drinkSize.id,
      name: 'Small',
      priceDelta: '0.00',
      sortOrder: 1,
      isActive: true,
    },
  })

  const largeDrink = await prisma.modifierOption.create({
    data: {
      modifierGroupId: drinkSize.id,
      name: 'Large',
      priceDelta: '1.00',
      sortOrder: 2,
      isActive: true,
    },
  })

  await prisma.menuItemModifierGroup.createMany({
    data: [
      {
        menuItemId: classicBurger.id,
        modifierGroupId: burgerAddons.id,
      },
      {
        menuItemId: classicBurger.id,
        modifierGroupId: burgerCooking.id,
      },
      {
        menuItemId: cheeseburger.id,
        modifierGroupId: burgerAddons.id,
      },
      {
        menuItemId: cheeseburger.id,
        modifierGroupId: burgerCooking.id,
      },
      {
        menuItemId: margherita.id,
        modifierGroupId: pizzaExtras.id,
      },
      {
        menuItemId: pepperoni.id,
        modifierGroupId: pizzaExtras.id,
      },
      {
        menuItemId: cola.id,
        modifierGroupId: drinkSize.id,
      },
      {
        menuItemId: orangeJuice.id,
        modifierGroupId: drinkSize.id,
      },
      {
        menuItemId: beer.id,
        modifierGroupId: drinkSize.id,
      },
    ],
  })

  const openShift = await prisma.shift.create({
    data: {
      locationId: location.id,
      userId: cashierUser.id,
      terminalId: frontPos.id,
      openedAt: new Date(),
      closedAt: null,
      openingCashAmount: '200.00',
      closingCashAmount: null,
      status: ShiftStatus.OPEN,
    },
  })

  const openOrder = await prisma.order.create({
    data: {
      locationId: location.id,
      terminalId: frontPos.id,
      shiftId: openShift.id,
      tableId: t1.id,
      guestId: guest.id,
      membershipId: membership.id,
      parentOrderId: null,
      orderType: OrderType.DINE_IN,
      status: OrderStatus.OPEN,
      subtotalAmount: '29.50',
      discountAmount: '2.95',
      serviceChargeAmount: '0.00',
      taxAmount: '5.31',
      totalAmount: '31.86',
      openedByUserId: cashierUser.id,
      closedByUserId: null,
      openedAt: new Date(),
      closedAt: null,
      note: 'Demo open table order',
    },
  })

  await prisma.table.update({
    where: {
      id: t1.id,
    },
    data: {
      status: 'occupied',
      activeOrderId: openOrder.id,
    },
  })

  const burgerOrderItem = await prisma.orderItem.create({
    data: {
      orderId: openOrder.id,
      menuItemId: classicBurger.id,
      seatNumber: 1,
      quantity: 1,
      basePrice: '12.50',
      discountAmount: '1.25',
      finalPrice: '11.25',
      comment: 'No onions',
      kdsStatus: KdsStatus.PENDING,
      status: OrderItemStatus.ACTIVE,
    },
  })

  await prisma.orderItemModifier.createMany({
    data: [
      {
        orderItemId: burgerOrderItem.id,
        modifierOptionId: extraCheese.id,
        priceDelta: '1.50',
      },
      {
        orderItemId: burgerOrderItem.id,
        modifierOptionId: medium.id,
        priceDelta: '0.00',
      },
    ],
  })

  const friesOrderItem = await prisma.orderItem.create({
    data: {
      orderId: openOrder.id,
      menuItemId: fries.id,
      seatNumber: 1,
      quantity: 1,
      basePrice: '5.50',
      discountAmount: '0.55',
      finalPrice: '4.95',
      comment: null,
      kdsStatus: KdsStatus.IN_PROGRESS,
      status: OrderItemStatus.ACTIVE,
    },
  })

  const colaOrderItem = await prisma.orderItem.create({
    data: {
      orderId: openOrder.id,
      menuItemId: cola.id,
      seatNumber: 2,
      quantity: 2,
      basePrice: '3.50',
      discountAmount: '1.15',
      finalPrice: '6.15',
      comment: 'One with ice, one without',
      kdsStatus: KdsStatus.PENDING,
      status: OrderItemStatus.ACTIVE,
    },
  })

  await prisma.orderItemModifier.create({
    data: {
      orderItemId: colaOrderItem.id,
      modifierOptionId: largeDrink.id,
      priceDelta: '1.00',
    },
  })

  const kitchenTicket = await prisma.kitchenTicket.create({
    data: {
      locationId: location.id,
      orderId: openOrder.id,
      tableId: t1.id,
      kdsStationId: hotKitchen.id,
      terminalId: frontPos.id,
      createdByUserId: cashierUser.id,
      status: KitchenTicketStatus.OPEN,
    },
  })

  await prisma.kitchenTicketItem.createMany({
    data: [
      {
        ticketId: kitchenTicket.id,
        orderItemId: burgerOrderItem.id,
        quantity: 1,
      },
      {
        ticketId: kitchenTicket.id,
        orderItemId: friesOrderItem.id,
        quantity: 1,
      },
    ],
  })

  await prisma.displayLayout.create({
    data: {
      locationId: location.id,
      terminalId: frontPos.id,
      name: 'Default POS Layout',
      configJson: {
        sections: ['tables', 'menu', 'cart'],
      },
      isDefault: true,
    },
  })

  await prisma.savedFilter.create({
    data: {
      locationId: location.id,
      userId: managerUser.id,
      name: 'Open Orders',
      scope: 'ORDERS',
      filterJson: {
        status: ['OPEN', 'SENT_TO_KITCHEN'],
      },
      isDefault: true,
    },
  })

  await prisma.payment.create({
    data: {
      orderId: openOrder.id,
      shiftId: openShift.id,
      terminalId: frontPos.id,
      amount: '10.00',
      tipAmount: '0.00',
      paymentMethod: PaymentMethod.CARD,
      provider: 'demo-terminal',
      transactionId: 'TXN-DEMO-0001',
      status: PaymentStatus.APPROVED,
      paidAt: new Date(),
    },
  })

  console.log('Seed completed')
  console.log(`Location id: ${location.id}`)
  console.log('Users PINs: 1111, 2222, 3333, 4444')
  console.log('Tables: T1, T2, T3, T4, P1, P2')
  console.log(`Front POS terminal id: ${frontPos.id}`)
  console.log(`Open order id on T1: ${openOrder.id}`)

  void p1
  void p2
  void barTerminal
  void kdsTerminal
  void extraBacon
  void jalapeno
  void mediumRare
  void wellDone
  void extraMozzarella
  void mushrooms
  void olives
  void smallDrink
  void cheeseburger
  void pepperoni
  void caesarSalad
  void orangeJuice
  void beer
  void t3
  void t4
  void adminUser
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (error) => {
    console.error('Seed failed')
    console.error(error)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
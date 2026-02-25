import { PrismaClient, KdsStatus } from "@prisma/client";

export async function completeOpenTicketsForOrder(tx: PrismaClient, args: { orderId: number }) {
  const openTickets = await tx.kitchenTicket.findMany({
    where: { orderId: args.orderId, status: "OPEN" },
    select: { id: true },
  });

  if (openTickets.length === 0) return { closedTickets: 0, servedItems: 0 };

  const ticketIds = openTickets.map((t) => t.id);

  const ticketItems = await tx.kitchenTicketItem.findMany({
    where: { ticketId: { in: ticketIds } },
    select: { orderItemId: true },
  });

  const orderItemIds = ticketItems.map((i) => i.orderItemId);

  if (orderItemIds.length > 0) {
    await tx.orderItem.updateMany({
      where: { id: { in: orderItemIds } },
      data: { kdsStatus: "SERVED" as KdsStatus },
    });
  }

  await tx.kitchenTicket.updateMany({
    where: { id: { in: ticketIds } },
    data: { status: "COMPLETED" },
  });

  return { closedTickets: ticketIds.length, servedItems: orderItemIds.length };
}

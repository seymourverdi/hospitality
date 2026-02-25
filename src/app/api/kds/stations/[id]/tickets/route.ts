import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

function parseId(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);
    const { id: idParam } = await ctx.params;
    const stationId = parseId(idParam);

    if (!stationId) {
      return NextResponse.json({ error: "Invalid station id" }, { status: 400 });
    }

    const tickets = await prisma.kitchenTicket.findMany({
      where: {
        locationId: auth.locationId,
        kdsStationId: stationId,
        status: "OPEN",
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,

        order: {
          select: {
            id: true,
            orderType: true,
            note: true,
          },
        },

        table: {
          select: {
            id: true,
            name: true,
          },
        },

        items: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            quantity: true,

            orderItem: {
              select: {
                id: true,
                quantity: true,
                seatNumber: true,
                comment: true,

                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    isAlcohol: true,
                  },
                },

                modifiers: {
                  orderBy: { id: "asc" },
                  select: {
                    id: true,
                    priceDelta: true,
                    modifierOption: {
                      select: {
                        id: true,
                        name: true,
                        modifierGroup: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ tickets });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Shared types for log/tickets — safe to import in client components

export type LogTicketItem = {
  id: string
  name: string
  quantity: number
  seat: number | null
  completed: boolean
}

export type LogTicket = {
  id: string
  orderId: number
  guestName: string | null
  serverName: string
  tableName: string | null
  locationName: string | null
  seatNumber: number | null
  time: string
  status: 'pending' | 'delivered'
  items: LogTicketItem[]
}
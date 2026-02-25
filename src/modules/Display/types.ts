// City Club HMS - Display Module Types

// Kitchen ticket with order items
export interface KitchenTicket {
  id: string;
  orderNumber: number;
  tableNumber: string;
  serverName: string;
  status: 'incoming' | 'fired' | 'complete';
  items: KitchenItem[];
  notes?: string;
  createdAt: Date;
  firedAt?: Date;
  completedAt?: Date;
  elapsedTime: number; // in seconds
}

// Item on a kitchen ticket
export interface KitchenItem {
  id: string;
  name: string;
  quantity: number;
  modifiers: string[];
  notes?: string;
  allergenNotes?: string;
  routing: 'kitchen' | 'bar' | 'both';
  status: 'pending' | 'in_progress' | 'complete';
}

// Column in kanban
export type KanbanColumn = 'incoming' | 'fired' | 'complete';

// Filter options
export interface DisplayFilters {
  routing: 'all' | 'kitchen' | 'bar';
  showComplete: boolean;
}

// City Club HMS - Table Selector
// Table selection grid for orders

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrder } from '../context/order-context';
import type { Table, Location } from '@/core/database.types';

// Mock locations and tables - will be replaced with Supabase query
const mockLocations: Location[] = [
  {
    id: 'dining',
    name: 'Dining Room',
    code: 'D',
    description: 'Main dining area',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'patio',
    name: 'Patio',
    code: 'O',
    description: 'Outdoor patio',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bar',
    name: 'Bar',
    code: 'B',
    description: 'Bar seating',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockTables: Table[] = [
  // Dining Room
  { id: 'd1', location_id: 'dining', table_number: 'D1', display_name: null, capacity: 4, position_x: 0, position_y: 0, rotation: 0, shape: 'round', width: 1, height: 1, status: 'available', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'd2', location_id: 'dining', table_number: 'D2', display_name: null, capacity: 4, position_x: 0, position_y: 0, rotation: 0, shape: 'round', width: 1, height: 1, status: 'occupied', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'd3', location_id: 'dining', table_number: 'D3', display_name: null, capacity: 6, position_x: 0, position_y: 0, rotation: 0, shape: 'rectangle', width: 1.5, height: 1, status: 'available', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'd4', location_id: 'dining', table_number: 'D4', display_name: null, capacity: 2, position_x: 0, position_y: 0, rotation: 0, shape: 'round', width: 0.8, height: 0.8, status: 'reserved', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'd5', location_id: 'dining', table_number: 'D5', display_name: null, capacity: 8, position_x: 0, position_y: 0, rotation: 0, shape: 'rectangle', width: 2, height: 1, status: 'available', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'tt', location_id: 'dining', table_number: 'TT', display_name: 'Tasting Table', capacity: 12, position_x: 0, position_y: 0, rotation: 0, shape: 'rectangle', width: 3, height: 1, status: 'available', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Patio
  { id: 'o1', location_id: 'patio', table_number: 'O1', display_name: null, capacity: 4, position_x: 0, position_y: 0, rotation: 0, shape: 'round', width: 1, height: 1, status: 'available', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'o2', location_id: 'patio', table_number: 'O2', display_name: null, capacity: 4, position_x: 0, position_y: 0, rotation: 0, shape: 'round', width: 1, height: 1, status: 'available', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'o3', location_id: 'patio', table_number: 'O3', display_name: null, capacity: 6, position_x: 0, position_y: 0, rotation: 0, shape: 'rectangle', width: 1.5, height: 1, status: 'occupied', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Bar
  { id: 'b1', location_id: 'bar', table_number: 'B1', display_name: 'Bar Seat 1', capacity: 1, position_x: 0, position_y: 0, rotation: 0, shape: 'round', width: 0.5, height: 0.5, status: 'available', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b2', location_id: 'bar', table_number: 'B2', display_name: 'Bar Seat 2', capacity: 1, position_x: 0, position_y: 0, rotation: 0, shape: 'round', width: 0.5, height: 0.5, status: 'occupied', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b3', location_id: 'bar', table_number: 'B3', display_name: 'Bar Seat 3', capacity: 1, position_x: 0, position_y: 0, rotation: 0, shape: 'round', width: 0.5, height: 0.5, status: 'available', current_server_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const statusColors = {
  available: 'bg-success/20 border-success text-success',
  occupied: 'bg-destructive/20 border-destructive text-destructive',
  reserved: 'bg-warning/20 border-warning text-warning',
  blocked: 'bg-muted border-muted-foreground text-muted-foreground',
};

interface TableSelectorProps {
  className?: string;
}

export function TableSelector({ className }: TableSelectorProps) {
  const { state, dispatch } = useOrder();
  const [activeLocation, setActiveLocation] = React.useState(mockLocations[0]?.id ?? 'dining');

  const tablesInLocation = mockTables.filter(
    (t) => t.location_id === activeLocation
  );

  const handleSelectTable = (tableId: string) => {
    dispatch({ type: 'SET_TABLE', tableId });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-h3 font-semibold">Select Table</h2>

      <Tabs value={activeLocation} onValueChange={setActiveLocation}>
        <TabsList className="w-full justify-start">
          {mockLocations.map((location) => (
            <TabsTrigger key={location.id} value={location.id}>
              {location.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {mockLocations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="mt-4">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tablesInLocation.map((table) => {
                const isSelected = state.tableId === table.id;
                const isAvailable = table.status === 'available';

                return (
                  <button
                    key={table.id}
                    onClick={() => isAvailable && handleSelectTable(table.id)}
                    disabled={!isAvailable}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      statusColors[table.status],
                      isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      !isAvailable && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <div className="text-center">
                      <p className="text-lg font-bold">{table.table_number}</p>
                      {table.display_name && (
                        <p className="text-xs mt-1 opacity-80">
                          {table.display_name}
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {table.capacity} seats
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-xs text-muted-foreground">Reserved</span>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

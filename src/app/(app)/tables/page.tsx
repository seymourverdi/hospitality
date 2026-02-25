// City Club HMS - Tables Page
// Table management and floor plan

import { TopBar } from '@/components/layout';

export default function TablesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Table Management"
        subtitle="Floor plan and table status"
        user={{
          name: 'Manager Mike',
          email: 'mike@cityclub.com',
          role: 'manager',
        }}
      />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">
            Table floor plan editor coming soon
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Drag and drop tables, set capacity, and manage seating assignments
          </p>
        </div>
      </div>
    </div>
  );
}

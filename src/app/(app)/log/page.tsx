// City Club HMS - Log Page
// Activity and audit log

import { TopBar } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Mock log entries
const logEntries = [
  {
    id: '1',
    action: 'Order submitted',
    details: 'Order #42 submitted for Table D1',
    user: 'Sarah J.',
    timestamp: new Date(Date.now() - 180000),
    type: 'order',
  },
  {
    id: '2',
    action: 'Reservation created',
    details: 'New reservation for John Smith, 4 guests at 7:00 PM',
    user: 'Hannah H.',
    timestamp: new Date(Date.now() - 600000),
    type: 'rsvp',
  },
  {
    id: '3',
    action: 'Member signed in',
    details: 'Michael Chen (CC003) checked in at reception',
    user: 'System',
    timestamp: new Date(Date.now() - 1200000),
    type: 'member',
  },
  {
    id: '4',
    action: 'Product updated',
    details: 'Wagyu Steak price changed from $80 to $85',
    user: 'Mike M.',
    timestamp: new Date(Date.now() - 3600000),
    type: 'product',
  },
  {
    id: '5',
    action: 'Order completed',
    details: 'Order #38 marked as complete',
    user: 'James W.',
    timestamp: new Date(Date.now() - 7200000),
    type: 'order',
  },
];

const typeColors = {
  order: 'bg-primary',
  rsvp: 'bg-accent',
  member: 'bg-success',
  product: 'bg-warning',
};

export default function LogPage() {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Activity Log"
        subtitle="Recent actions and events"
        user={{
          name: 'Admin Alex',
          email: 'alex@cityclub.com',
          role: 'admin',
        }}
      />

      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {logEntries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${
                    typeColors[entry.type as keyof typeof typeColors]
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {entry.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {entry.details}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{entry.user}</span>
                    <span>·</span>
                    <span>{formatTime(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

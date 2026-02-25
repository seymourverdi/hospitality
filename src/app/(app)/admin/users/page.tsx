// City Club HMS - Admin Users Page
// User management

import { TopBar } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MoreVertical, Shield, Edit, Trash2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Mock users
const users = [
  {
    id: '1',
    name: 'Alex Admin',
    email: 'alex@cityclub.com',
    role: 'admin',
    isActive: true,
    lastLogin: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    name: 'Mike Manager',
    email: 'mike@cityclub.com',
    role: 'manager',
    isActive: true,
    lastLogin: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    name: 'Sarah Server',
    email: 'sarah@cityclub.com',
    role: 'server',
    isActive: true,
    lastLogin: new Date(Date.now() - 1800000),
  },
  {
    id: '4',
    name: 'Hannah Host',
    email: 'hannah@cityclub.com',
    role: 'host',
    isActive: true,
    lastLogin: new Date(Date.now() - 86400000),
  },
  {
    id: '5',
    name: 'Kevin Kitchen',
    email: 'kevin@cityclub.com',
    role: 'kitchen',
    isActive: true,
    lastLogin: new Date(Date.now() - 14400000),
  },
  {
    id: '6',
    name: 'Rachel Readonly',
    email: 'rachel@cityclub.com',
    role: 'readonly',
    isActive: false,
    lastLogin: new Date(Date.now() - 604800000),
  },
];

const roleColors = {
  admin: 'bg-destructive text-destructive-foreground',
  manager: 'bg-primary text-primary-foreground',
  server: 'bg-success text-success-foreground',
  host: 'bg-accent text-accent-foreground',
  kitchen: 'bg-warning text-warning-foreground',
  readonly: 'bg-muted text-muted-foreground',
};

export default function AdminUsersPage() {
  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="User Management"
        subtitle={`${users.length} users`}
        user={{
          name: 'Alex Admin',
          email: 'alex@cityclub.com',
          role: 'admin',
        }}
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    {!user.isActive && (
                      <Badge variant="secondary" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>

                <Badge
                  className={`capitalize ${
                    roleColors[user.role as keyof typeof roleColors]
                  }`}
                >
                  {user.role}
                </Badge>

                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Last login</p>
                  <p className="text-sm">{formatLastLogin(user.lastLogin)}</p>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

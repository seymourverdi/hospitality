// City Club HMS - Skeleton Component
// Loading placeholders for content

import { cn } from '@/core/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-muted', className)}
      {...props}
    />
  );
}

// Product card skeleton
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-card">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// Order item skeleton
function OrderItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background-tertiary">
      <Skeleton className="h-6 w-6 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

// Kanban ticket skeleton
function TicketSkeleton() {
  return (
    <div className="p-3 rounded-xl bg-card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-12" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-1 w-full rounded-full" />
    </div>
  );
}

// Table card skeleton
function TableSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

// Member list item skeleton
function MemberItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Reservation list item skeleton
function ReservationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  );
}

// Stats card skeleton
function StatsCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export {
  Skeleton,
  ProductCardSkeleton,
  OrderItemSkeleton,
  TicketSkeleton,
  TableSkeleton,
  MemberItemSkeleton,
  ReservationItemSkeleton,
  StatsCardSkeleton,
};

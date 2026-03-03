import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';

export function InstallmentCardSkeleton() {
  return (
    <Card hover={false}>
      <div className="space-y-4">
        {/* Header with description */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton variant="circular" className="h-10 w-10" />
        </div>

        {/* Amount section */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Progress bar */}
          <Skeleton className="h-2 w-full" />
        </div>

        {/* Account and category info */}
        <div className="flex items-center gap-4 text-sm">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </Card>
  );
}

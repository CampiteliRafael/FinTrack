import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';

export function GoalCardSkeleton() {
  return (
    <Card hover={false}>
      <div className="space-y-4">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton variant="circular" className="h-10 w-10" />
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Progress bar */}
          <Skeleton className="h-2 w-full" />
        </div>

        {/* Deadline or completion status */}
        <Skeleton className="h-5 w-32" />

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </Card>
  );
}

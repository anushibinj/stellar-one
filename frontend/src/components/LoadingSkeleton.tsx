import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';

interface LoadingSkeletonProps {
  count?: number;
}

export default function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-[200px]">
          <CardHeader>
            <Skeleton className="h-5 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>
          <CardFooter className="mt-auto border-t pt-4">
            <Skeleton className="h-4 w-1/4" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
}

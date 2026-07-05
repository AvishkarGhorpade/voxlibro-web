import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-24">
      <Skeleton className="mx-auto h-4 w-24" />
      <Skeleton className="mx-auto mt-4 h-10 w-2/3" />
      <div className="mt-16">
        <CardGridSkeleton />
      </div>
    </div>
  );
}

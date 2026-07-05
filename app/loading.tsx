import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-24">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <Skeleton className="mx-auto h-4 w-40" />
        <Skeleton className="mx-auto h-12 w-full" />
        <Skeleton className="mx-auto h-12 w-2/3" />
        <Skeleton className="mx-auto h-4 w-3/4" />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function BlogPostSkeleton() {
  return (
    <div className="container-narrow py-16">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-10 w-full" />
      <Skeleton className="mt-2 h-10 w-2/3" />
      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="mt-8 aspect-[16/9] w-full" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

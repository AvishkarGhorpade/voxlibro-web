import { BlogListSkeleton } from "@/components/skeletons/blog-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-20">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-4 h-10 w-1/3" />
      <div className="mt-14">
        <BlogListSkeleton />
      </div>
    </div>
  );
}

import { SearchClient } from "@/components/shared/search-client";
import { buildMeta } from "@/lib/seo/meta";

export const metadata = buildMeta({
  title: "Search",
  description: "Search VoxLibro blog articles.",
  path: "/search",
  noindex: true,
});

export default function SearchPage() {
  return <SearchClient />;
}

import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export function useSiteContent() {
  const { data: content, isLoading } = trpc.siteContent.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const contentMap = useMemo(() => {
    if (!content) return {};
    return content.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string | null>);
  }, [content]);

  return { content: contentMap, isLoading };
}

/**
 * /knowledge-base — Knowledge base (Hjálparmiðstöð) page
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";
import { kbDataQueryOptions } from "@/features/knowledgeBase/api/knowledgeBase.queries";
import { youtubeVideosQueryOptions } from "@/features/knowledgeBase/api/youtube.queries";
import { KnowledgeBasePage } from "@/features/knowledgeBase/components/KnowledgeBasePage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

const kbSearch = z.object({
  view: z.enum(["landing", "product", "videos"]).optional().default("landing"),
  productId: z.string().optional(),
  greenParentId: z.string().optional(),
  selectedFolderId: z.string().optional(),
  articleId: z.string().optional(),
  videoId: z.string().optional(),
});

export const Route = createFileRoute("/knowledge-base/")({
  validateSearch: kbSearch,
  loader: ({ context: { queryClient } }) => {
    // Both fire-and-forget — Suspense boundary shows spinner while data loads
    queryClient.prefetchQuery(kbDataQueryOptions);
    queryClient.prefetchQuery(youtubeVideosQueryOptions);
  },
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <KnowledgeBasePage />
    </Suspense>
  ),
});

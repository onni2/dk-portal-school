/**
 * /knowledge-base — Knowledge base (Hjálparmiðstöð) page
 */
import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBasePage } from "@/features/knowledgeBase/components/KnowledgeBasePage";

export const Route = createFileRoute("/knowledge-base/")({
  component: KnowledgeBasePage,
});

/**
 * Gray animated block used as a placeholder while content is loading.
 * Compose multiple Skeleton blocks to match the shape of the real content.
 * Uses: @/shared/utils/cn
 * Exports: Skeleton
 */
import { cn } from "@/shared/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-(--color-border)",
        className,
      )}
    />
  );
}

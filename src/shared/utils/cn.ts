/**
 * Utility that combines clsx and tailwind-merge so conditional Tailwind classes are merged without duplicates.
 * Uses: nothing — standalone file
 * Exports: cn
 * Author: Haukur — example/scaffold, use as template
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes via clsx + tailwind-merge, removing conflicting utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

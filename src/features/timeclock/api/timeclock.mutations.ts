/**
 * Mutation hook for stamping an employee in or out. Invalidates the entries and employees queries on success.
 * Uses: ./timeclock.api
 * Exports: useStampMutation
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stampEmployee } from "./timeclock.api";

/**
 *
 */
export function useStampMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stampEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeclock-entries"] });
      queryClient.invalidateQueries({ queryKey: ["timeclock-employees"] });
    },
  });
}

/**
 * Expandable form for creating a new customer. Submits to the API and invalidates the customers cache on success.
 * Uses: @/shared/components/Button, @/shared/components/Input, ../api/customers.api, ../types/customers.types
 * Exports: CreateCustomerForm
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { createCustomer } from "../api/customers.api";
import type { CreateCustomerInput } from "../types/customers.types";

const EMPTY_FORM: CreateCustomerInput = {
  Number: "",
  Name: "",
  SSNumber: "",
  Address1: "",
  City: "",
  ZipCode: "",
  Phone: "",
  Email: "",
};

/**
 *
 */
export function CreateCustomerForm() {
  const [form, setForm] = useState<CreateCustomerInput>(EMPTY_FORM);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setForm(EMPTY_FORM);
      setOpen(false);
    },
  });

  /**
   *
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  /**
   *
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ Nýr viðskiptavinur</Button>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
        Nýr viðskiptavinur
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Númer *"
          name="Number"
          value={form.Number}
          onChange={handleChange}
          required
        />
        <Input
          label="Nafn *"
          name="Name"
          value={form.Name}
          onChange={handleChange}
          required
        />
        <Input
          label="Kennitala"
          name="SSNumber"
          value={form.SSNumber ?? ""}
          onChange={handleChange}
        />
        <Input
          label="Netfang"
          name="Email"
          type="email"
          value={form.Email ?? ""}
          onChange={handleChange}
        />
        <Input
          label="Sími"
          name="Phone"
          value={form.Phone ?? ""}
          onChange={handleChange}
        />
        <Input
          label="Heimilisfang"
          name="Address1"
          value={form.Address1 ?? ""}
          onChange={handleChange}
        />
        <Input
          label="Staður"
          name="City"
          value={form.City ?? ""}
          onChange={handleChange}
        />
        <Input
          label="Póstnúmer"
          name="ZipCode"
          value={form.ZipCode ?? ""}
          onChange={handleChange}
        />
      </div>

      {mutation.isError && (
        <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]">
          Villa:{" "}
          {(mutation.error as { message?: string })?.message ?? "Óþekkt villa"}
        </div>
      )}

      {mutation.isSuccess && (
        <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">
          Viðskiptavinur stofnaður!
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Stofna..." : "Stofna"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setForm(EMPTY_FORM);
            mutation.reset();
          }}
        >
          Hætta við
        </Button>
      </div>
    </form>
  );
}

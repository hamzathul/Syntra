"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { useCompany } from "@/lib/company-context";

export function CompanyForm() {
  const { createCompany } = useCompany();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    try {
      const company = await createCompany({ name });
      toast.success(`${company.name} is ready!`);
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">
          Company name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Acme Corp"
          required
          minLength={2}
          maxLength={100}
          className="rounded-xl h-10"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-10 rounded-xl font-medium shadow-sm shadow-primary/20 mt-2"
      >
        Create company
      </Button>
    </form>
  );
}

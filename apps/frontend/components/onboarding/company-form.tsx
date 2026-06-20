"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyApi } from "@/lib/api/erp-client";
import { setActiveCompany } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/api/core-client";

export function CompanyForm() {
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    setPending(true);
    try {
      const company = await companyApi.create({ name });
      setActiveCompany({ id: company.id, name: company.name, role: company.role });
      toast.success(`${company.name} is ready!`);
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Company name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Acme Corp"
          required
          minLength={2}
          maxLength={100}
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create company"}
      </Button>
    </form>
  );
}

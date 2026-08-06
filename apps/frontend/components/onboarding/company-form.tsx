"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { useCompany } from "@/lib/company-context";

const companyFormSchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name too long"),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export function CompanyForm() {
  const { createCompany } = useCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      const company = await createCompany(values);
      toast.success(`${company.name} is ready!`);
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">
          Company name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Acme Corp"
          className="rounded-xl h-10"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
        )}
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
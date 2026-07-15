"use client";

import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { z } from "zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { businessTypes, indianStates } from "shared";
import type { CompanyProfileDto, UpdateCompanyProfileDto } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldToggle } from "./field-toggle";
import { LogoUpload } from "./logo-upload";
import { SignatureInput } from "./signature-input";
import { useUpdateCompanyProfileMutation } from "@/hooks/use-company-profile-query";
import { toast } from "sonner";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const pincodeRegex = /^\d{6}$/;

const companyProfileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  gstin: z.string().refine((v) => v === "" || gstinRegex.test(v), "Invalid GSTIN format"),
  phone1: z.string().refine((v) => v === "" || v.length >= 10, "Phone must be at least 10 digits"),
  phone2: z.string().refine((v) => v === "" || v.length >= 10, "Phone must be at least 10 digits"),
  email: z.string().refine((v) => v === "" || z.string().email().safeParse(v).success, "Invalid email"),
  address: z.string().max(500, "Address too long"),
  pincode: z.string().refine((v) => v === "" || pincodeRegex.test(v), "Pincode must be exactly 6 digits"),
  description: z.string().max(1000, "Description too long"),
  state: z.string(),
  businessType: z.string(),
  otherBusinessType: z.string(),
  businessCategory: z.string().max(100, "Category too long"),
  logo: z.string(),
  signature: z.string(),
  showOnCard: z.array(z.string()),
});

type FormValues = z.infer<typeof companyProfileFormSchema>;

interface CompanyProfileFormProps {
  profile: CompanyProfileDto;
  onLiveValuesChange?: (values: FormValues) => void;
}

export function CompanyProfileForm({ profile, onLiveValuesChange }: CompanyProfileFormProps) {
  const updateMutation = useUpdateCompanyProfileMutation();

  const isOtherBusinessType = profile.businessType
    && !(businessTypes as readonly string[]).includes(profile.businessType);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(companyProfileFormSchema),
    defaultValues: {
      name: profile.name ?? "",
      gstin: profile.gstin ?? "",
      phone1: profile.phone1 ?? "",
      phone2: profile.phone2 ?? "",
      email: profile.email ?? "",
      address: profile.address ?? "",
      pincode: profile.pincode ?? "",
      description: profile.description ?? "",
      state: profile.state ?? "",
      businessType: isOtherBusinessType ? "__other__" : (profile.businessType ?? ""),
      businessCategory: profile.businessCategory ?? "",
      logo: profile.logo ?? "",
      signature: profile.signature ?? "",
      showOnCard: profile.showOnCard ?? [],
      otherBusinessType: isOtherBusinessType ? profile.businessType ?? "" : "",
    },
  });

  const currentLogo = watch("logo");
  const currentSignature = watch("signature");
  const currentBusinessType = watch("businessType");
  const currentShowOnCard = watch("showOnCard");

  const watchedValues = watch();
  const prevJsonRef = useRef("");

  useEffect(() => {
    const json = JSON.stringify(watchedValues);
    if (json !== prevJsonRef.current) {
      prevJsonRef.current = json;
      onLiveValuesChange?.(watchedValues);
    }
  }, [watchedValues, onLiveValuesChange]);

  const toggleShowOnCard = useCallback(
    (key: string, show: boolean) => {
      const current = currentShowOnCard ?? [];
      setValue(
        "showOnCard",
        show ? [...current, key] : current.filter((k) => k !== key),
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [currentShowOnCard, setValue],
  );

  const onSubmit = useCallback(
    async (data: FormValues) => {
      const businessType = data.businessType === "__other__"
        ? data.otherBusinessType
        : data.businessType;

      const dto: UpdateCompanyProfileDto = {
        name: data.name || undefined,
        gstin: data.gstin || null,
        phone1: data.phone1 || null,
        phone2: data.phone2 || null,
        email: data.email || null,
        address: data.address || null,
        pincode: data.pincode || null,
        description: data.description || null,
        state: data.state || null,
        businessType: businessType || null,
        businessCategory: data.businessCategory || null,
        logo: data.logo || null,
        signature: data.signature || null,
        showOnCard: data.showOnCard,
      };

      try {
        await updateMutation.mutateAsync(dto);
        toast.success("Company profile updated successfully");
      } catch (err) {
        const axiosError = err as AxiosError<{
          error?: { details?: Array<{ path: string; message: string }> };
          message?: string;
        }>;
        const details = axiosError?.response?.data?.error?.details;

        if (details && details.length > 0) {
          const messages: string[] = [];
          for (const d of details) {
            const fieldName = d.path.replace("body.", "");
            messages.push(d.message);
            if (fieldName in data) {
              setError(fieldName as keyof FormValues, { message: d.message });
            }
          }
          toast.error(messages.join("\n"));
        } else {
          const serverMsg = axiosError?.response?.data?.message;
          toast.error(serverMsg ?? "Failed to update company profile");
        }
      }
    },
    [updateMutation, setError],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo */}
      <div>
        <Label>Company Logo</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Click to upload a logo (max 500KB)
        </p>
        <LogoUpload
          value={currentLogo}
          onChange={(v) => setValue("logo", v ?? "", { shouldDirty: true })}
        />
      </div>

      {/* Business Name */}
      <FieldToggle id="name" label="Business Name">
        <Input
          id="name"
          {...register("name")}
          placeholder="Your business name"
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
        )}
      </FieldToggle>

      {/* GSTIN + phone1 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldToggle
          id="gstin"
          label="GSTIN"
          showOnCard={currentShowOnCard?.includes("gstin")}
          onToggleShow={(v) => toggleShowOnCard("gstin", v)}
        >
          <Input
            id="gstin"
            {...register("gstin")}
            placeholder="22AAAAA0000A1Z5"
            className="font-mono"
          />
          {errors.gstin && (
            <p className="text-xs text-destructive mt-1">{errors.gstin.message}</p>
          )}
        </FieldToggle>

        <FieldToggle
          id="phone1"
          label="Phone Number 1"
          showOnCard={currentShowOnCard?.includes("phone1")}
          onToggleShow={(v) => toggleShowOnCard("phone1", v)}
        >
          <Input
            id="phone1"
            {...register("phone1")}
            placeholder="+91 9876543210"
          />
          {errors.phone1 && (
            <p className="text-xs text-destructive mt-1">{errors.phone1.message}</p>
          )}
        </FieldToggle>
      </div>

      {/* phone2 + email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldToggle
          id="phone2"
          label="Phone Number 2"
          showOnCard={currentShowOnCard?.includes("phone2")}
          onToggleShow={(v) => toggleShowOnCard("phone2", v)}
        >
          <Input
            id="phone2"
            {...register("phone2")}
            placeholder="+91 9876543210"
          />
          {errors.phone2 && (
            <p className="text-xs text-destructive mt-1">{errors.phone2.message}</p>
          )}
        </FieldToggle>

        <FieldToggle
          id="email"
          label="Email ID"
          showOnCard={currentShowOnCard?.includes("email")}
          onToggleShow={(v) => toggleShowOnCard("email", v)}
        >
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="business@example.com"
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </FieldToggle>
      </div>

      {/* Address + Pincode */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldToggle
          id="address"
          label="Business Address"
          showOnCard={currentShowOnCard?.includes("address")}
          onToggleShow={(v) => toggleShowOnCard("address", v)}
        >
          <Textarea
            id="address"
            {...register("address")}
            placeholder="Full business address"
            rows={2}
          />
          {errors.address && (
            <p className="text-xs text-destructive mt-1">{errors.address.message}</p>
          )}
        </FieldToggle>

        <FieldToggle
          id="pincode"
          label="Pincode"
          showOnCard={currentShowOnCard?.includes("pincode")}
          onToggleShow={(v) => toggleShowOnCard("pincode", v)}
        >
          <Input
            id="pincode"
            {...register("pincode")}
            placeholder="6-digit pincode"
            maxLength={6}
          />
          {errors.pincode && (
            <p className="text-xs text-destructive mt-1">{errors.pincode.message}</p>
          )}
        </FieldToggle>
      </div>

      {/* State + Business Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldToggle
          id="state"
          label="State"
          showOnCard={currentShowOnCard?.includes("state")}
          onToggleShow={(v) => toggleShowOnCard("state", v)}
        >
          <Select id="state" {...register("state")}>
            <option value="">Select state</option>
            {indianStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </FieldToggle>

        <FieldToggle
          id="businessType"
          label="Business Type"
          showOnCard={currentShowOnCard?.includes("businessType")}
          onToggleShow={(v) => toggleShowOnCard("businessType", v)}
        >
          <Select id="businessType" {...register("businessType")}>
            <option value="">Select type</option>
            {businessTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="__other__">Other</option>
          </Select>
          {currentBusinessType === "__other__" && (
            <Input
              {...register("otherBusinessType")}
              placeholder="Enter business type"
              className="mt-2"
            />
          )}
        </FieldToggle>
      </div>

      {/* Business Category */}
      <div>
        <Label htmlFor="businessCategory">Business Category</Label>
        <Input
          id="businessCategory"
          {...register("businessCategory")}
          placeholder="e.g., Electronics, Grocery, Pharmaceuticals"
          className="mt-1"
        />
        {errors.businessCategory && (
          <p className="text-xs text-destructive mt-1">{errors.businessCategory.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Business Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Brief description of your business"
          rows={3}
          className="mt-1"
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Signature */}
      <div>
        <Label>Authorized Signature</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Draw your signature or upload an image
        </p>
        <SignatureInput
          value={currentSignature}
          onChange={(v) => setValue("signature", v ?? "", { shouldDirty: true })}
        />
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
          {updateMutation.isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

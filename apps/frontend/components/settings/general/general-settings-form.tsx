"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { z } from "zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { currencies, dateFormats } from "shared";
import type { GeneralSettingsDto, UpdateGeneralSettingsDto } from "shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useUpdateGeneralSettingsMutation } from "@/hooks/settings/use-general-settings-query";
import { toast } from "sonner";

const decimalPlacesSchema = z.number().int().min(1).max(5);

const generalSettingsFormSchema = z.object({
  businessCurrency: z.string(),
  decimalPlaces: decimalPlacesSchema,
  dateFormat: z.string(),
});

type FormValues = z.infer<typeof generalSettingsFormSchema>;

interface GeneralSettingsFormProps {
  settings: GeneralSettingsDto;
}

export function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const updateMutation = useUpdateGeneralSettingsMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(generalSettingsFormSchema),
    defaultValues: {
      businessCurrency: settings.businessCurrency ?? "INR",
      decimalPlaces: settings.decimalPlaces ?? 2,
      dateFormat: settings.dateFormat ?? "DD/MM/YYYY",
    },
  });

  const onSubmit = useCallback(
    async (data: FormValues) => {
      const dto: UpdateGeneralSettingsDto = {
        ...(dirtyFields.businessCurrency && {
          businessCurrency: data.businessCurrency,
        }),
        ...(dirtyFields.decimalPlaces && {
          decimalPlaces: data.decimalPlaces,
        }),
        ...(dirtyFields.dateFormat && {
          dateFormat: data.dateFormat,
        }),
      };

      try {
        await updateMutation.mutateAsync(dto);
        toast.success("General settings updated successfully");
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
          toast.error(serverMsg ?? "Failed to update general settings");
        }
      }
    },
    [updateMutation, setError, dirtyFields],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Business Currency */}
      <div className="grid gap-2">
        <Label htmlFor="businessCurrency">Business Currency</Label>
        <Select id="businessCurrency" {...register("businessCurrency")}>
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} — {c.code} ({c.name})
            </option>
          ))}
        </Select>
        {errors.businessCurrency && (
          <p className="text-xs text-destructive">
            {errors.businessCurrency.message}
          </p>
        )}
      </div>

      {/* Decimal Places */}
      <div className="grid gap-2">
        <Label htmlFor="decimalPlaces">Decimal Places</Label>
        <Select
          id="decimalPlaces"
          {...register("decimalPlaces", { valueAsNumber: true })}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "place" : "places"}
            </option>
          ))}
        </Select>
        {errors.decimalPlaces && (
          <p className="text-xs text-destructive">
            {errors.decimalPlaces.message}
          </p>
        )}
      </div>

      {/* Date Format */}
      <div className="grid gap-2">
        <Label htmlFor="dateFormat">Date Format</Label>
        <Select id="dateFormat" {...register("dateFormat")}>
          {dateFormats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
        {errors.dateFormat && (
          <p className="text-xs text-destructive">
            {errors.dateFormat.message}
          </p>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="gap-2"
        >
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

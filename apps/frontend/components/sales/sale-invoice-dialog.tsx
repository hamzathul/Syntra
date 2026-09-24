"use client";

import { useCallback, useState } from "react";
import { DownloadIcon, Loader2Icon, PrinterIcon } from "lucide-react";
import { toast } from "sonner";
import type {
  BankDto,
  CompanyProfileDto,
  GeneralSettingsDto,
  PartyDto,
  SaleDto,
} from "shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useParty } from "@/hooks/parties/use-parties-query";
import { useBanks } from "@/hooks/settings/use-bank-settings-query";
import { useCompanyProfile } from "@/hooks/settings/use-company-profile-query";
import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";
import { SaleInvoicePreview } from "./sale-invoice-preview";
import {
  buildUpiPayload,
  groupInvoiceBanks,
  invoiceQrAmount,
} from "./sale-invoice-format";

interface SaleInvoiceDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly sale: SaleDto | null;
}

export function SaleInvoiceDialog({
  open,
  onOpenChange,
  sale,
}: SaleInvoiceDialogProps) {
  const { data: company } = useCompanyProfile();
  const { data: banks } = useBanks();
  const { data: settings } = useGeneralSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sale invoice</DialogTitle>
          <DialogDescription>
            Preview the invoice, print it, or download it as a PDF.
          </DialogDescription>
        </DialogHeader>
        {sale ? (
          <InvoiceBody
            sale={sale}
            company={company ?? null}
            banks={banks ?? []}
            settings={settings ?? null}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface InvoiceBodyProps {
  readonly sale: SaleDto;
  readonly company: CompanyProfileDto | null;
  readonly banks: BankDto[];
  readonly settings: GeneralSettingsDto | null;
}

function InvoiceBody({ sale, company, banks, settings }: InvoiceBodyProps) {
  const { data: party } = useParty(sale.partyId);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const currencyCode = settings?.businessCurrency ?? "INR";
  const decimalPlaces = settings?.decimalPlaces ?? 2;
  const dateFormat = settings?.dateFormat ?? "DD/MM/YYYY";

  const buildQrDataUrls = useCallback(async () => {
    const { toDataURL } = await import("qrcode");
    const { upiBanks } = groupInvoiceBanks(banks);
    const amount = invoiceQrAmount(sale.totalAmount, sale.balanceDue);
    const entries = await Promise.all(
      upiBanks.map(async (b) => {
        const upiId = (b.upiId ?? "").trim();
        if (!upiId) return null;
        const payload = buildUpiPayload(
          upiId,
          amount,
          company?.name ?? "Merchant",
          currencyCode,
        );
        const url = await toDataURL(payload, { width: 160, margin: 1 });
        return [upiId, url] as const;
      }),
    );
    const qrDataUrls: Record<string, string> = {};
    for (const entry of entries) {
      if (entry) qrDataUrls[entry[0]] = entry[1];
    }
    return qrDataUrls;
  }, [banks, sale.totalAmount, sale.balanceDue, company?.name, currencyCode]);

  const renderPdfBlob = useCallback(
    async (partyValue: PartyDto | null | undefined) => {
      const { pdf } = await import("@react-pdf/renderer");
      const qrDataUrls = await buildQrDataUrls();
      const { SaleInvoiceDocument: Doc } =
        await import("./sale-invoice-document");
      return pdf(
        <Doc
          sale={sale}
          company={company}
          party={partyValue ?? null}
          banks={banks}
          currencyCode={currencyCode}
          decimalPlaces={decimalPlaces}
          dateFormat={dateFormat}
          qrDataUrls={qrDataUrls}
        />,
      ).toBlob();
    },
    [
      banks,
      buildQrDataUrls,
      company,
      currencyCode,
      dateFormat,
      decimalPlaces,
      sale,
    ],
  );

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await renderPdfBlob(party);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${sale.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Failed to generate invoice PDF");
    } finally {
      setDownloading(false);
    }
  }, [renderPdfBlob, party, sale.id]);

  const handlePrint = useCallback(async () => {
    setPrinting(true);
    try {
      const blob = await renderPdfBlob(party);
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          iframe.remove();
          URL.revokeObjectURL(url);
        }, 5000);
      };
      toast.success("Invoice sent to printer");
    } catch {
      toast.error("Failed to print invoice");
    } finally {
      setPrinting(false);
    }
  }, [renderPdfBlob, party]);

  const busy = printing || downloading;

  return (
    <div className="space-y-4">
      <SaleInvoicePreview
        sale={sale}
        company={company}
        party={party}
        banks={banks}
        currencyCode={currencyCode}
        decimalPlaces={decimalPlaces}
        dateFormat={dateFormat}
      />
      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrint}
          disabled={busy}
          className="gap-2"
        >
          {printing ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <PrinterIcon className="h-4 w-4" />
          )}
          {printing ? "Printing..." : "Print"}
        </Button>
        <Button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="gap-2"
        >
          {downloading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <DownloadIcon className="h-4 w-4" />
          )}
          {downloading ? "Generating..." : "Download PDF"}
        </Button>
      </DialogFooter>
    </div>
  );
}

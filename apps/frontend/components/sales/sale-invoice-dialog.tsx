"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DownloadIcon,
  Loader2Icon,
  MailIcon,
  PrinterIcon,
  ShareIcon,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useParty } from "@/hooks/parties/use-parties-query";
import { useSendSaleInvoiceMutation } from "@/hooks/sales/use-sales-query";
import { useBanks } from "@/hooks/settings/use-bank-settings-query";
import { useCompanyProfile } from "@/hooks/settings/use-company-profile-query";
import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
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
            Preview the invoice, print it, share it, or send it by email.
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read invoice PDF"));
    reader.readAsDataURL(blob);
  });
}

function InvoiceBody({ sale, company, banks, settings }: InvoiceBodyProps) {
  const { data: party } = useParty(sale.partyId);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const sendInvoice = useSendSaleInvoiceMutation();
  const sending = sendInvoice.isPending;

  const partyEmail = party?.email ?? "";

  useEffect(() => {
    if (emailOpen) {
      setTo(partyEmail);
      setSubject("");
      setNotes("");
    }
  }, [emailOpen, partyEmail]);

  const currencyCode = settings?.businessCurrency ?? "INR";
  const decimalPlaces = settings?.decimalPlaces ?? 2;
  const dateFormat = settings?.dateFormat ?? "DD/MM/YYYY";
  const invoiceFilename = `invoice-${sale.id.slice(0, 8)}.pdf`;

  const buildQrDataUrls = useCallback(async () => {
    const amount = invoiceQrAmount(sale.balanceDue);
    if (amount === null) return {};
    const { toDataURL } = await import("qrcode");
    const { upiBanks } = groupInvoiceBanks(banks);
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
  }, [banks, sale.balanceDue, company?.name, currencyCode]);

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
      downloadBlob(blob, invoiceFilename);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Failed to generate invoice PDF");
    } finally {
      setDownloading(false);
    }
  }, [renderPdfBlob, party, invoiceFilename]);

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

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const blob = await renderPdfBlob(party);
      const file = new File([blob], invoiceFilename, {
        type: "application/pdf",
      });
      if (
        typeof navigator !== "undefined" &&
        "canShare" in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: "Sale invoice" });
      } else {
        downloadBlob(blob, invoiceFilename);
        toast.info(
          "Sharing is not supported on this device — invoice downloaded instead",
        );
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      toast.error("Failed to share invoice");
    } finally {
      setSharing(false);
    }
  }, [renderPdfBlob, party, invoiceFilename]);

  const handleSendEmail = useCallback(async () => {
    const recipient = to.trim();
    if (!recipient) {
      toast.error("Enter a recipient email address");
      return;
    }
    try {
      const blob = await renderPdfBlob(party);
      const pdfBase64 = await blobToDataUrl(blob);
      await sendInvoice.mutateAsync({
        id: sale.id,
        dto: {
          to: recipient,
          pdfBase64,
          subject: subject.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      toast.success("Invoice sent by email");
      setEmailOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }, [to, subject, notes, renderPdfBlob, party, sendInvoice, sale.id]);

  const busy = printing || downloading || sharing || sending;

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
      <DialogFooter className="flex-wrap gap-2 sm:gap-2">
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
          variant="outline"
          onClick={handleShare}
          disabled={busy}
          className="gap-2"
        >
          {sharing ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <ShareIcon className="h-4 w-4" />
          )}
          {sharing ? "Sharing..." : "Share"}
        </Button>
        <Button
          type="button"
          variant="outline"
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
        <Button
          type="button"
          onClick={() => setEmailOpen(true)}
          disabled={busy}
          className="gap-2"
        >
          <MailIcon className="h-4 w-4" />
          Send by Email
        </Button>
      </DialogFooter>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send invoice by email</DialogTitle>
            <DialogDescription>
              The invoice PDF will be sent as an attachment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-email-to">To</Label>
              <Input
                id="invoice-email-to"
                type="email"
                placeholder="customer@example.com"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                disabled={sending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-email-subject">Subject (optional)</Label>
              <Input
                id="invoice-email-subject"
                placeholder={`Sale invoice ${sale.id.slice(0, 8)}`}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                disabled={sending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-email-notes">Notes (optional)</Label>
              <Textarea
                id="invoice-email-notes"
                placeholder="Add a message for the customer"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={sending}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmailOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendEmail}
              disabled={sending}
              className="gap-2"
            >
              {sending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <MailIcon className="h-4 w-4" />
              )}
              {sending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

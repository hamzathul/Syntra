"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import type { BankDto, CompanyProfileDto, PartyDto, SaleDto } from "shared";
import {
  bankNameById,
  buildUpiPayload,
  formatInvoiceAmount,
  formatInvoiceDate,
  groupInvoiceBanks,
  invoiceQrAmount,
} from "./sale-invoice-format";

export interface SaleInvoicePreviewProps {
  readonly sale: SaleDto;
  readonly company: CompanyProfileDto | null;
  readonly party: PartyDto | null | undefined;
  readonly banks: BankDto[];
  readonly currencyCode: string;
  readonly decimalPlaces: number;
  readonly dateFormat: string;
}

function companyAddress(company: CompanyProfileDto | null): string | null {
  if (!company) return null;
  const show = company.showOnCard ?? [];
  const parts: Array<{ value: string | null; key: string }> = [
    { value: company.address, key: "address" },
    { value: company.pincode, key: "pincode" },
    { value: company.state, key: "state" },
  ];
  const visible = parts
    .filter((p) => p.value && (show.length === 0 || show.includes(p.key)))
    .map((p) => p.value as string);
  if (visible.length > 0) return visible.join(", ");
  const raw = parts.map((p) => p.value).filter((x): x is string => Boolean(x));
  return raw.length > 0 && show.length === 0 ? raw.join(", ") : null;
}

export function SaleInvoicePreview({
  sale,
  company,
  party,
  banks,
  currencyCode,
  decimalPlaces,
  dateFormat,
}: SaleInvoicePreviewProps) {
  const money = (v: number) =>
    formatInvoiceAmount(v, currencyCode, decimalPlaces);
  const show = company?.showOnCard ?? [];
  const showField = (key: string, value: string | null) =>
    Boolean(value) && (show.length === 0 || show.includes(key));
  const address = companyAddress(company);
  const phones = [company?.phone1, company?.phone2].filter(
    (p, i): p is string =>
      Boolean(p) &&
      (show.length === 0 || show.includes(i === 0 ? "phone1" : "phone2")),
  );
  const { detailBanks, upiBanks } = groupInvoiceBanks(banks);
  const qrAmount = invoiceQrAmount(sale.totalAmount, sale.balanceDue);

  return (
    <div className="overflow-hidden rounded-xl border bg-white text-gray-900">
      <div className="border-b-2 border-primary/80 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">
              {company?.name ?? "Business"}
            </h2>
            {address ? (
              <p className="mt-1 text-xs text-gray-500">{address}</p>
            ) : null}
            {phones.length > 0 ? (
              <p className="mt-0.5 text-xs text-gray-500">
                {phones.join(" / ")}
              </p>
            ) : null}
            {showField("email", company?.email ?? null) ? (
              <p className="mt-0.5 text-xs text-gray-500">{company?.email}</p>
            ) : null}
            {showField("gstin", company?.gstin ?? null) ? (
              <p className="mt-0.5 font-mono text-xs tracking-wide text-gray-500">
                GSTIN: {company?.gstin}
              </p>
            ) : null}
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xl font-bold text-white">
            {company?.logo ? (
              <Image
                src={company.logo}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              (company?.name ?? "B").charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Sale Invoice
        </p>
        <Badge variant={sale.paid ? "success" : "warning"}>
          {sale.paid ? "Paid" : "Due"}
        </Badge>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-[11px] font-semibold uppercase text-gray-500">
            Billed to
          </p>
          <p className="mt-1 text-sm font-semibold">
            {party?.name ?? sale.partyName}
          </p>
          {party?.contactNumber ? (
            <p className="mt-0.5 text-xs text-gray-500">
              {party.contactNumber}
            </p>
          ) : null}
          {party?.billingAddress ? (
            <p className="mt-0.5 text-xs text-gray-500">
              {party.billingAddress}
            </p>
          ) : null}
          {party?.email ? (
            <p className="mt-0.5 text-xs text-gray-500">{party.email}</p>
          ) : null}
        </div>
        <div className="rounded-lg border p-3 text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Sale ID</span>
            <span className="truncate font-mono text-xs">{sale.id}</span>
          </div>
          <div className="mt-1 flex justify-between gap-2">
            <span className="text-gray-500">Date</span>
            <span className="font-medium">
              {formatInvoiceDate(sale.saleDate, dateFormat)}
            </span>
          </div>
          <div className="mt-1 flex justify-between gap-2">
            <span className="text-gray-500">Type</span>
            <span className="font-medium">{sale.saleType}</span>
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">Mode</th>
                <th className="px-3 py-2 font-semibold">Details</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sale.payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-center text-xs text-muted-foreground"
                  >
                    No payments recorded
                  </td>
                </tr>
              ) : (
                sale.payments.map((p, i) => {
                  const bankName = bankNameById(banks, p.bankId);
                  return (
                    <tr key={p.id}>
                      <td className="px-3 py-2 text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 font-medium">{p.mode}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {[
                          bankName,
                          p.mode === "CHEQUE" && p.cheque
                            ? `${p.cheque.drawBankName} • ${p.cheque.chequeNumber} • ${p.cheque.chequeDate.slice(0, 10)}`
                            : null,
                          p.description,
                        ]
                          .filter(Boolean)
                          .join(" — ") || "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">
                        {money(p.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-1 text-right text-sm">
          <p>
            <span className="text-gray-500">Total: </span>
            <span className="font-bold tabular-nums">
              {money(sale.totalAmount)}
            </span>
          </p>
          <p>
            <span className="text-gray-500">Received: </span>
            <span className="font-semibold tabular-nums">
              {money(sale.receivedAmount)}
            </span>
          </p>
          <p>
            <span className="text-gray-500">Balance due: </span>
            <span className="font-bold tabular-nums">
              {money(sale.balanceDue)}
            </span>
          </p>
        </div>

        {sale.description ? (
          <div className="mt-3 rounded-lg border p-3">
            <p className="text-[11px] font-semibold uppercase text-gray-500">
              Notes
            </p>
            <p className="mt-1 text-sm">{sale.description}</p>
          </div>
        ) : null}

        {detailBanks.length > 0 || upiBanks.length > 0 ? (
          <div className="mt-3 rounded-lg border p-3">
            <p className="text-[11px] font-semibold uppercase text-gray-500">
              Payment details
            </p>
            {detailBanks.map((b) => (
              <div key={b.id} className="mt-2 text-sm">
                <p className="font-semibold">{b.name}</p>
                {b.accountHolderName ? (
                  <p className="text-xs text-gray-500">{b.accountHolderName}</p>
                ) : null}
                <p className="text-xs text-gray-500">
                  A/C: {b.accountNumber ?? "—"}
                  {b.ifscCode ? ` • IFSC: ${b.ifscCode}` : ""}
                  {b.branchName ? ` • ${b.branchName}` : ""}
                </p>
              </div>
            ))}
            {upiBanks.map((b) => {
              const upiId = (b.upiId ?? "").trim();
              const payload = buildUpiPayload(
                upiId,
                qrAmount,
                company?.name ?? "Merchant",
                currencyCode,
              );
              return (
                <div key={b.id} className="mt-2 flex items-center gap-3">
                  <QRCodeSVG value={payload} size={72} />
                  <div className="text-sm">
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-xs text-gray-500">UPI: {upiId}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-4 py-4">
          <p className="text-xs text-gray-400">Thank you for your business.</p>
          {company?.signature ? (
            <Image
              src={company.signature}
              alt="Signature"
              width={140}
              height={36}
              className="h-9 object-contain"
              unoptimized
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

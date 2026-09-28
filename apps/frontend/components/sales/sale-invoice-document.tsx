import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { BankDto, CompanyProfileDto, PartyDto, SaleDto } from "shared";
import {
  bankNameById,
  formatInvoiceAmount,
  formatInvoiceDate,
  groupInvoiceBanks,
} from "./sale-invoice-format";

export interface SaleInvoiceDocumentProps {
  readonly sale: SaleDto;
  readonly company: CompanyProfileDto | null;
  readonly party: PartyDto | null;
  readonly banks: BankDto[];
  readonly currencyCode: string;
  readonly decimalPlaces: number;
  readonly dateFormat: string;
  /** upiId -> PNG data URL (generated in the dialog via `qrcode`). */
  readonly qrDataUrls: Readonly<Record<string, string>>;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#4f46e5",
  },
  companyBlock: { flex: 1, paddingRight: 12 },
  companyName: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  companyLine: { fontSize: 9, color: "#4b5563", marginTop: 2 },
  logo: { width: 56, height: 56, borderRadius: 28, objectFit: "cover" },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 14,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4f46e5",
    textTransform: "uppercase",
  },
  metaBox: { alignItems: "flex-end" },
  metaLine: { fontSize: 9, color: "#374151", marginTop: 1 },
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardLine: { fontSize: 10, color: "#111827", marginTop: 1 },
  muted: { fontSize: 9, color: "#6b7280", marginTop: 1 },
  table: { marginTop: 4, marginBottom: 12 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  th: { fontSize: 8, fontWeight: "bold", color: "#6b7280" },
  td: { fontSize: 9, color: "#111827" },
  totals: { alignItems: "flex-end", marginTop: 4 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 2 },
  totalLabel: { fontSize: 9, color: "#6b7280", width: 110, textAlign: "right" },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    width: 110,
    textAlign: "right",
  },
  bankSection: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
  },
  bankTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  upiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  qr: { width: 72, height: 72 },
  footer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signature: { width: 140, height: 36, objectFit: "contain" },
});

function companyLines(company: CompanyProfileDto | null): string[] {
  if (!company) return [];
  const show = company.showOnCard ?? [];
  const lines: string[] = [];
  const address = [company.address, company.pincode, company.state]
    .filter(
      (x): x is string =>
        typeof x === "string" && x !== "" && show.includes(addrKey(x, company)),
    )
    .join(", ");
  // Fallback: include address parts even if toggles are missing, matching
  // the invoice requirement to always show configured company details.
  const rawAddress = [company.address, company.pincode, company.state]
    .filter((x): x is string => Boolean(x))
    .join(", ");
  if (address) lines.push(address);
  else if (rawAddress && show.length === 0) lines.push(rawAddress);
  const phones = [company.phone1, company.phone2].filter(
    (p): p is string =>
      Boolean(p) &&
      (show.length === 0 ||
        show.includes(p === company.phone1 ? "phone1" : "phone2")),
  );
  if (phones.length > 0) lines.push(phones.join(" / "));
  if (company.email && (show.length === 0 || show.includes("email")))
    lines.push(company.email);
  if (company.gstin && (show.length === 0 || show.includes("gstin")))
    lines.push(`GSTIN: ${company.gstin}`);
  return lines;
}

function addrKey(value: string, company: CompanyProfileDto): string {
  if (value === company.address) return "address";
  if (value === company.pincode) return "pincode";
  return "state";
}

function paymentDetail(
  payment: SaleDto["payments"][number],
  banks: BankDto[],
): string {
  const parts: string[] = [];
  if (payment.mode === "BANK") {
    const name = bankNameById(banks, payment.bankId);
    if (name) parts.push(name);
  }
  if (payment.mode === "CHEQUE" && payment.cheque) {
    parts.push(
      `${payment.cheque.drawBankName} • ${payment.cheque.chequeNumber} • ${payment.cheque.chequeDate.slice(0, 10)}`,
    );
  }
  if (payment.description) parts.push(payment.description);
  return parts.join(" — ");
}

export function SaleInvoiceDocument({
  sale,
  company,
  party,
  banks,
  currencyCode,
  decimalPlaces,
  dateFormat,
  qrDataUrls,
}: SaleInvoiceDocumentProps) {
  const money = (v: number) =>
    formatInvoiceAmount(v, currencyCode, decimalPlaces);
  const { detailBanks, upiBanks } = groupInvoiceBanks(banks);
  const billTo = party?.name ?? sale.partyName;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>
              {company?.name ?? "Business"}
            </Text>
            {companyLines(company).map((line) => (
              <Text key={line} style={styles.companyLine}>
                {line}
              </Text>
            ))}
          </View>
          {company?.logo ? (
            <Image src={company.logo} style={styles.logo} />
          ) : (
            <Text style={styles.logoFallback}>
              {(company?.name ?? "B").charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.invoiceTitle}>Sale Invoice</Text>
          <View style={styles.metaBox}>
            <Text style={styles.metaLine}>Sale ID: {sale.id}</Text>
            <Text style={styles.metaLine}>
              Date: {formatInvoiceDate(sale.saleDate, dateFormat)}
            </Text>
            <Text style={styles.metaLine}>Type: {sale.saleType}</Text>
            <Text style={styles.metaLine}>
              Status: {sale.paid ? "Paid" : "Due"}
            </Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Billed to</Text>
            <Text style={styles.cardLine}>{billTo}</Text>
            {party?.contactNumber ? (
              <Text style={styles.muted}>{party.contactNumber}</Text>
            ) : null}
            {party?.billingAddress ? (
              <Text style={styles.muted}>{party.billingAddress}</Text>
            ) : null}
            {party?.email ? (
              <Text style={styles.muted}>{party.email}</Text>
            ) : null}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <Text style={styles.cardLine}>
              Total: {money(sale.totalAmount)}
            </Text>
            <Text style={styles.muted}>
              Received: {money(sale.receivedAmount)}
            </Text>
            <Text style={styles.muted}>
              Balance due: {money(sale.balanceDue)}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1 }]}>#</Text>
            <Text style={[styles.th, { flex: 2 }]}>Mode</Text>
            <Text style={[styles.th, { flex: 4 }]}>Details</Text>
            <Text style={[styles.th, { flex: 2, textAlign: "right" }]}>
              Amount
            </Text>
          </View>
          {sale.payments.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { flex: 1 }]}>—</Text>
              <Text style={[styles.td, { flex: 2 }]}>No payments</Text>
              <Text style={[styles.td, { flex: 4 }]}>—</Text>
              <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
                —
              </Text>
            </View>
          ) : (
            sale.payments.map((p, i) => (
              <View key={p.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1 }]}>{i + 1}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{p.mode}</Text>
                <Text style={[styles.td, { flex: 4 }]}>
                  {paymentDetail(p, banks) || "—"}
                </Text>
                <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
                  {money(p.amount)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{money(sale.totalAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Received</Text>
            <Text style={styles.totalValue}>{money(sale.receivedAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Balance due</Text>
            <Text style={styles.totalValue}>{money(sale.balanceDue)}</Text>
          </View>
        </View>

        {sale.description ? (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.cardLine}>{sale.description}</Text>
          </View>
        ) : null}

        {detailBanks.length > 0 || upiBanks.length > 0 ? (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>Payment details</Text>
            {detailBanks.map((b) => (
              <View key={b.id} style={{ marginTop: 4 }}>
                <Text style={styles.cardLine}>{b.name}</Text>
                {b.accountHolderName ? (
                  <Text style={styles.muted}>{b.accountHolderName}</Text>
                ) : null}
                <Text style={styles.muted}>
                  A/C: {b.accountNumber ?? "—"}
                  {b.ifscCode ? ` • IFSC: ${b.ifscCode}` : ""}
                  {b.branchName ? ` • ${b.branchName}` : ""}
                </Text>
              </View>
            ))}
            {upiBanks.map((b) => {
              const upiId = (b.upiId ?? "").trim();
              const qr = qrDataUrls[upiId];
              return (
                <View key={b.id} style={styles.upiRow}>
                  {qr ? <Image src={qr} style={styles.qr} /> : null}
                  <View>
                    <Text style={styles.cardLine}>{b.name}</Text>
                    <Text style={styles.muted}>UPI: {upiId}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.footer}>
          <View>
            <Text style={styles.muted}>Thank you for your business.</Text>
            <Text style={styles.muted}>
              Generated{" "}
              {formatInvoiceDate(new Date().toISOString(), dateFormat)}
            </Text>
          </View>
          {company?.signature ? (
            <Image src={company.signature} style={styles.signature} />
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

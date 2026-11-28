import { Check } from "lucide-react";

const highlights = [
  "GST-ready invoices with payments tracked automatically",
  "Stock, categories and quantities always up to date",
  "Banks and cash reconciled in one calm view",
];

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[#0a0a12] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/30 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-0 h-[360px] w-[360px] rounded-full bg-sky-500/15 blur-[110px]"
        />

        <div className="relative flex items-center gap-2.5">
          <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-lg text-[15px] font-bold text-white">
            S
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold tracking-tight">Syntra</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/70">
              ERP
            </span>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-[-0.03em]">
            Run your business.
            <br />
            <span className="text-white/45">Not your spreadsheets.</span>
          </h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-white/55">
            Sales, stock, parties and cash — one fast, quiet workspace that
            stays out of your way.
          </p>

          <ul className="mt-10 space-y-3.5">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[13.5px]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-3 w-3 text-white/80" strokeWidth={2.5} />
                </span>
                <span className="leading-relaxed text-white/65">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12px] text-white/30">
          © {new Date().getFullYear()} Syntra ERP · Open source
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[380px] animate-page-in">{children}</div>
      </div>
    </div>
  );
}

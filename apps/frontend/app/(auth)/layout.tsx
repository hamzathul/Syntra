import { Package, ReceiptText, Wallet } from "lucide-react";

const highlights = [
  {
    icon: ReceiptText,
    title: "Sales in seconds",
    description: "GST-ready invoices with payments tracked automatically.",
  },
  {
    icon: Package,
    title: "Stock without stress",
    description: "Items, categories, and quantities always up to date.",
  },
  {
    icon: Wallet,
    title: "Cash, clear",
    description: "Banks and cash on hand reconciled in one calm view.",
  },
];

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="mesh-bg grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="brand-gradient absolute inset-0" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(420px 260px at 20% 15%, rgb(255 255 255 / 0.25), transparent 60%), radial-gradient(520px 320px at 85% 90%, rgb(255 255 255 / 0.18), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold backdrop-blur">
              S
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-semibold tracking-tight">
                Syntra
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                ERP
              </span>
            </div>
          </div>

          <div>
            <h1 className="max-w-md text-[40px] font-semibold leading-[1.1] tracking-tight">
              Billing that feels effortless.
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
              Sales, stock, parties, and cash — designed to be calm, minimal,
              and fast from day one.
            </p>
            <div className="mt-8 space-y-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-3.5 rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-white/70">
                      {description}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[13px] text-white/60">
            Trusted by growing businesses to stay in sync.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm animate-fade-up">{children}</div>
      </div>
    </div>
  );
}

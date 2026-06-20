export default function AuthLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Soft background blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-125 w-125 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(258 88% 63%), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-125 w-125 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, hsl(258 88% 63%), transparent 70%)" }}
      />
      <div className="relative z-10 w-full max-w-sm px-4">{children}</div>
    </div>
  );
}

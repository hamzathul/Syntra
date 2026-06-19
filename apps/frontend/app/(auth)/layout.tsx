export default function AuthLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      {children}
    </div>
  );
}

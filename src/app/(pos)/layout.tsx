import { PosSidebar } from "@/components/pos/PosSidebar";

export default function PosGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <PosSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

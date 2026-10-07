import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StarField } from "@/components/effects/star-field";
import { CursorGlow } from "@/components/effects/cursor-glow";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-space-deep">
      <StarField />
      <CursorGlow />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}